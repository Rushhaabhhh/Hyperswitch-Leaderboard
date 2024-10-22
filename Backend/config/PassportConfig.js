const GitHubStrategy = require('passport-github2').Strategy;
const dotenv = require('dotenv');
const table = require('../config/airtableConfig');

dotenv.config();

module.exports = function (passport) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const githubid = profile.id;
            const username = profile.username || profile.displayName;
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

            // Check if user exists in Airtable
            const records = await table.select({
                filterByFormula: `{githubid} = '${githubid}'`
            }).firstPage();

            let user;
            if (records.length > 0) {
                user = records[0]; // User exists
            } else {
                // Create new user
                const createdRecords = await table.create([
                    {
                        fields: {
                            githubid: githubid,
                            username: username,
                            email: email || 'N/A' // Ensure email is not null
                        }
                    }
                ]);
                user = createdRecords[0];
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // Serialize user
    passport.serializeUser((user, done) => {
        done(null, user.id); // Airtable record ID
    });

    // Deserialize user
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await table.find(id); // Fetch user from Airtable
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};
