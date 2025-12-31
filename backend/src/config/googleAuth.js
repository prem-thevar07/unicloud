import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.js";

console.log("GOOGLE CLIENT ID:", process.env.GOOGLE_CLIENT_ID);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (_, __, profile, done) => {
      try {
        const existingUser = await User.findOne({
          email: profile.emails[0].value
        });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: "google-oauth"
        });

        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
