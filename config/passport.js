const passport = require("passport");
const User = require("../models/model");
const bcrypt = require("bcrypt");
var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      User.findOne({ googleId: profile.id }, async (error, user) => {
        if (error) return cb(error, null);

        if (!user) {
          let newUser = new User({
            googleId: profile.id,
            username: profile.displayName,
          });
          await newUser.save();
          return cb(null, newUser);
        } else {
          return cb(null, user);
        }
      });
    }
  )
);

// Serialized
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialized
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done({ msg: error.message }, false);
  }
});
