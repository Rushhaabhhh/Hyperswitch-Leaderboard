const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');
const User = require('../Models/UserModel');

dotenv.config();

module.exports = function(passport) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile); // Debugging to check profile data

            const githubId = profile.id;
            const username = profile.username || profile.displayName; // Updated to use displayName
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

            let user = await User.findOne({ githubId });
            if (!user) {
                user = new User({
                    githubId,
                    username,
                    email
                });
                await user.save();
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
