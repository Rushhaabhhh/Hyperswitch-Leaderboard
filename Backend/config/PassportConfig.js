const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = function(passport) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // Pass the access token along with the profile
        return done(null, profile, { accessToken });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const records = await table.select({
                filterByFormula: `RECORD_ID() = '${id}'`
            }).firstPage();
            
            if (records.length > 0) {
                done(null, records[0]);
            } else {
                done(new Error('User not found'));
            }
        } catch (error) {
            done(error);
        }
    });
};