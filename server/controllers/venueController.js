const Venue = require("../models/Venue");

// Only a summary is returned for each queue — not the raw queue.queue
// ticket array — since this endpoint is public and that array contains
// other users' ids.
const summarizeQueue = (queue) => ({
  _id: queue._id,
  name: queue.name,
  isActive: queue.isActive,
  isPaused: queue.isPaused,
  queueLength: queue.queue.filter((ticket) => ticket.status === "waiting").length,
});

const summarizeVenue = (venue) => ({
  _id: venue._id,
  name: venue.name,
  location: venue.location,
  queues: venue.queues.map(summarizeQueue),
});

const getVenues = async (req, res) => {
  const venues = await Venue.find().populate("queues");
  res.json(venues.map(summarizeVenue));
};

const getVenueById = async (req, res) => {
  const venue = await Venue.findById(req.params.id).populate("queues");
  if (!venue) {
    return res.status(404).json({ message: "Venue not found" });
  }
  res.json(summarizeVenue(venue));
};

module.exports = { getVenues, getVenueById };
