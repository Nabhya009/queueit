// One-off dev script: creates fixture data so you can see real documents in
// MongoDB Compass and manually test endpoints before the frontend exists.
// Safe to re-run — each document is upserted on a unique field instead of
// being inserted again.
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Venue = require("../models/Venue");
const Queue = require("../models/Queue");
const User = require("../models/User");

dotenv.config({ quiet: true });

const seed = async () => {
  await connectDB();

  const venue = await Venue.findOneAndUpdate(
    { name: "Main Cafeteria" },
    { name: "Main Cafeteria", location: "Block A" },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const queue = await Queue.findOneAndUpdate(
    { name: "Veg Counter", venueId: venue._id },
    { name: "Veg Counter", venueId: venue._id },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  // Keep venue.queues in sync without creating a duplicate entry on re-run.
  if (!venue.queues.some((id) => id.equals(queue._id))) {
    venue.queues.push(queue._id);
    await venue.save();
  }

  const user = await User.findOneAndUpdate(
    { email: "test.user@example.com" },
    {
      name: "Test User",
      email: "test.user@example.com",
      googleId: "test-google-id-123",
      role: "user",
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log("Seeded:");
  console.log("  Venue:", venue._id.toString(), venue.name);
  console.log("  Queue:", queue._id.toString(), queue.name);
  console.log("  User: ", user._id.toString(), user.email);

  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
