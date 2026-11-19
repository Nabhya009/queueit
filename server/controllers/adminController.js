const Queue = require("../models/Queue");
const User = require("../models/User");

// Auth is not checked in these handlers: routes/adminRoutes.js applies
// protect + requireAdmin to the whole router.

const pickNextWaitingTicket = (queue) => {
  const waitingTickets = queue.queue.filter((ticket) => ticket.status === "waiting");
  // Sorted explicitly by tokenNumber rather than trusting array order, so a
  // future manual walk-in insert can't accidentally jump the line.
  waitingTickets.sort((a, b) => a.tokenNumber - b.tokenNumber);
  return waitingTickets[0];
};

const advanceQueue = async (req, res, newStatus, historyStatus) => {
  const { id: queueId } = req.params;

  const queue = await Queue.findById(queueId);
  if (!queue) {
    return res.status(404).json({ message: "Queue not found" });
  }

  const nextTicket = pickNextWaitingTicket(queue);
  if (!nextTicket) {
    return res.status(400).json({ message: "No one is waiting in this queue" });
  }

  // Filtered update instead of read-then-save: if another admin already
  // changed this ticket's status between our read and this write, the
  // filter no longer matches and matchedCount is 0 — so two admins can
  // never both "serve" the same ticket.
  // $elemMatch puts both conditions on the SAME array element, which is the
  // one queue.$ then updates. Tickets have no _id, so tokenNumber identifies it.
  const updateResult = await Queue.updateOne(
    {
      _id: queueId,
      queue: { $elemMatch: { tokenNumber: nextTicket.tokenNumber, status: "waiting" } },
    },
    { $set: { "queue.$.status": newStatus, nowServing: nextTicket.tokenNumber } }
  );

  if (updateResult.matchedCount === 0) {
    return res.status(409).json({ message: "Ticket was already updated by someone else, please retry" });
  }

  await User.updateOne(
    { _id: nextTicket.userId },
    {
      $push: {
        history: {
          queueId,
          tokenNumber: nextTicket.tokenNumber,
          status: historyStatus,
          servedAt: new Date(),
        },
      },
    }
  );

  res.json({ queueId, tokenNumber: nextTicket.tokenNumber, userId: nextTicket.userId, status: newStatus });
};

const getQueueDetail = async (req, res) => {
  const { id: queueId } = req.params;

  // Populated only here, not on the public venue-listing endpoint: names
  // and emails of waiting users must only be visible to admins.
  const queue = await Queue.findById(queueId).populate("queue.userId", "name email");
  if (!queue) {
    return res.status(404).json({ message: "Queue not found" });
  }

  const waitingList = queue.queue
    .filter((ticket) => ticket.status === "waiting")
    .sort((a, b) => a.tokenNumber - b.tokenNumber)
    .map((ticket) => ({
      tokenNumber: ticket.tokenNumber,
      name: ticket.userId.name,
      email: ticket.userId.email,
      joinedAt: ticket.joinedAt,
    }));

  res.json({
    queueId: queue._id,
    name: queue.name,
    isActive: queue.isActive,
    isPaused: queue.isPaused,
    nowServing: queue.nowServing,
    waitingList,
  });
};

const serveNext = (req, res) => advanceQueue(req, res, "served", "served");

const skipNext = (req, res) => advanceQueue(req, res, "skipped", "skipped");

const togglePause = async (req, res) => {
  const { id: queueId } = req.params;

  const queue = await Queue.findById(queueId);
  if (!queue) {
    return res.status(404).json({ message: "Queue not found" });
  }

  queue.isPaused = !queue.isPaused;
  await queue.save();

  res.json({ queueId, isPaused: queue.isPaused });
};

module.exports = { getQueueDetail, serveNext, skipNext, togglePause };
