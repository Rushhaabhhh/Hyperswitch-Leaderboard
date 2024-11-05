const GitHubStrategy = require('passport-github2').Strategy;
const { contributorsTable } = require('../config/airtableConfig');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function(passport) {

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const githubId = profile.id;
            const username = profile.username || profile.displayName;
            const profileLink = profile.profileUrl;

            const records = await contributorsTable.select({
                filterByFormula: `{GithubId} = '${githubId}'`
            }).firstPage();

            let user;
            if (records.length > 0) {
                user = records[0]; // Contributor exists
            } else {
                // Create new contributor
                const createdRecords = await contributorsTable.create([{
                    fields: {
                        GithubId: githubId,
                        Username: username,
                        TotalPoints: 0,
                        ProfileLink: profileLink,
                        Rank: 'Newbie', 
                        Role: 'user',
                    }
                }]);
                user = createdRecords[0];
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id); // Airtable record ID
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await contributorsTable.find(id); // Fetch user from Airtable
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};