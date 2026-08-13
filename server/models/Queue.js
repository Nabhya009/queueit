const mongoose = require("mongoose");

// Embedded subdocument: one entry per person currently waiting in this
// queue. Lives inside Queue.queue[] instead of a separate Ticket
// collection, per the spec's data model.
const userQueueObjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenNumber: { type: Number, required: true },
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["waiting", "served", "skipped"],
      default: "waiting",
    },
    notified: { type: Boolean, default: false },
  },
  { _id: false }
);

const queueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
    avgServiceTime: { type: Number, default: 120 },
    lastToken: { type: Number, default: 0 },
    nowServing: { type: Number, default: 0 },
    queue: { type: [userQueueObjectSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);