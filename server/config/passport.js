const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // role is deliberately left out of the $set below. setDefaultsOnInsert
        // applies the schema default ("user") only when this document is first
        // created — on every later login this update leaves an existing user's
        // role (e.g. an admin promoted by hand in Compass) untouched.
        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
