const express = require("express");
const passport = require("passport");
const { googleCallback, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=1` }),
  googleCallback
);

router.get("/me", protect, getMe);

module.exports = router;
