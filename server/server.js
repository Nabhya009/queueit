const dotenv = require("dotenv");
// quiet: true suppresses dotenv's random promotional console "tips".
// This must run before any require() that reads process.env at module-load
// time (config/passport.js constructs its GoogleStrategy immediately on require).
dotenv.config({ quiet: true });

const express = require("express");
const cors = require("cors");
const passport = require("./config/passport");
const connectDB = require("./config/db");
const queueRoutes = require("./routes/queueRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const venueRoutes = require("./routes/venueRoutes");

connectDB();

const app = express();

// Restricted to CLIENT_URL rather than left wide open, now that a real
// production frontend origin exists to restrict it to. There are no
// cookies involved (auth is a Bearer token), so this is about not
// accepting requests from arbitrary origins, not CSRF.
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/venues", venueRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
