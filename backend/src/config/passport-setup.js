const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BACKEND_URL, JWT_SECRET } =
  process.env;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { googleId: profile.id } });
        let isNewUser = false;

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
          });
          isNewUser = true;
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, {
          expiresIn: "1d",
        });

        return done(null, { user, isNewUser, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
