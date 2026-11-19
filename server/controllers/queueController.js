const Queue = require("../models/Queue");
const User = require("../models/User");

// userId always comes from req.user.id (set by protect after verifying the
// JWT), never from the request body or query, so callers can't act as someone else.

const countWaiting = (queue) =>
  queue.queue.filter((ticket) => ticket.status === "waiting").length;

const joinQueue = async (req, res) => {
  const { id: queueId } = req.params;
  const userId = req.user.id;

  const queue = await Queue.findById(queueId);
  if (!queue) {
    return res.status(404).json({ message: "Queue not found" });
  }
  if (!queue.isActive) {
    return res.status(400).json({ message: "Queue is not active" });
  }

  const alreadyWaiting = queue.queue.some(
    (ticket) => ticket.userId.toString() === userId && ticket.status === "waiting"
  );
  if (alreadyWaiting) {
    return res.status(409).json({ message: "User already has a waiting ticket in this queue" });
  }

  // $inc is atomic: MongoDB serializes updates to one document, so two
  // simultaneous joins never get the same lastToken value.
  const updatedQueue = await Queue.findByIdAndUpdate(
    queueId,
    { $inc: { lastToken: 1 } },
    { new: true }
  );
  const tokenNumber = updatedQueue.lastToken;

  // Position is derived from how many people are already waiting, not
  // stored — this is what lets "leave" work without any renumbering.
  const position = countWaiting(updatedQueue) + 1;

  await Queue.updateOne(
    { _id: queueId },
    {
      $push: {
        queue: {
          userId,
          tokenNumber,
          joinedAt: new Date(),
          status: "waiting",
          notified: false,
        },
      },
    }
  );

  const eta = position * updatedQueue.avgServiceTime;

  res.status(201).json({ queueId, tokenNumber, position, eta });
};

const getQueueStatus = async (req, res) => {
  const { id: queueId } = req.params;
  const userId = req.user.id;

  const queue = await Queue.findById(queueId);
  if (!queue) {
    return res.status(404).json({ message: "Queue not found" });
  }

  const response = {
    queueId: queue._id,
    name: queue.name,
    isActive: queue.isActive,
    isPaused: queue.isPaused,
    nowServing: queue.nowServing,
    queueLength: countWaiting(queue),
  };

  // Served/skipped entries stay in queue.queue (only "leave" removes one),
  // so a returning user can have several entries. A waiting ticket takes
  // priority over older ones.
  const waitingTicket = queue.queue.find(
    (entry) => entry.userId.toString() === userId && entry.status === "waiting"
  );

  if (waitingTicket) {
    const waitingAhead = queue.queue.filter(
      (entry) => entry.status === "waiting" && entry.tokenNumber < waitingTicket.tokenNumber
    ).length;
    response.you = {
      tokenNumber: waitingTicket.tokenNumber,
      status: waitingTicket.status,
      position: waitingAhead + 1,
      eta: (waitingAhead + 1) * queue.avgServiceTime,
    };
  } else {
    const pastEntries = queue.queue.filter((entry) => entry.userId.toString() === userId);
    const mostRecent = pastEntries[pastEntries.length - 1];
    response.you = mostRecent
      ? { tokenNumber: mostRecent.tokenNumber, status: mostRecent.status, position: null, eta: null }
      : null;
  }

  res.json(response);
};

const leaveQueue = async (req, res) => {
  const { id: queueId } = req.params;
  const userId = req.user.id;

  const queue = await Queue.findById(queueId);
  if (!queue) {
    return res.status(404).json({ message: "Queue not found" });
  }

  const ticket = queue.queue.find(
    (entry) => entry.userId.toString() === userId && entry.status === "waiting"
  );
  if (!ticket) {
    return res.status(404).json({ message: "No waiting ticket for this user in this queue" });
  }

  // Nothing to renumber: position is computed from the array at read time.
  await Queue.updateOne(
    { _id: queueId },
    { $pull: { queue: { userId, status: "waiting" } } }
  );

  await User.updateOne(
    { _id: userId },
    {
      $push: {
        history: {
          queueId,
          tokenNumber: ticket.tokenNumber,
          status: "left",
          servedAt: new Date(),
        },
      },
    }
  );

  res.json({ message: "Left queue", tokenNumber: ticket.tokenNumber });
};

module.exports = { joinQueue, getQueueStatus, leaveQueue };
