import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5173/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });
                if (!user) {
                    user = new User({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        password: "", // No password needed for Google sign-in
                    });
                    await user.save();
                }
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
                return done(null, { user, token }); // Pass the user and token
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Store user ID in the session (instead of full user object)
passport.serializeUser((user, done) => {
    done(null, user.user._id); // Store only the user ID
});

// Retrieve the user using the ID in the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Retrieve the full user object using ID
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});