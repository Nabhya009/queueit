const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Google's stable per-account identifier, used to find/create the User
    // record on OAuth login instead of a local password.
    googleId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Snapshot of past queue tickets, appended when a ticket is served/skipped/left.
    // Kept separate from the live Queue.queue[] entry, which is removed once resolved.
    history: [
      {
        queueId: { type: mongoose.Schema.Types.ObjectId, ref: "Queue" },
        tokenNumber: Number,
        status: { type: String, enum: ["served", "skipped", "left"] },
        servedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);