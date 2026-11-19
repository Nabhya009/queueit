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
    // Snapshot of past tickets, appended when one is served/skipped/left.
    // "left" tickets are pulled out of Queue.queue[], so this is their only record.
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