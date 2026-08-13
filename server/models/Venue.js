const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    queues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Queue" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Venue", venueSchema);