const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// passport.authenticate('google') has already found/created the User and set
// req.user; this swaps it for our own JWT and redirects back to the React app.
const googleCallback = (req, res) => {
  const token = signToken(req.user);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-history");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

module.exports = { googleCallback, getMe };
