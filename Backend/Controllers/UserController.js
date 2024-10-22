const passport = require('passport');
const table = require('../config/airtableConfig');

// Redirects the user to GitHub for authentication
exports.githubLogin = (req, res, next) => {
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};

// Handles the callback from GitHub after authentication
exports.githubCallback = (req, res, next) => {
    passport.authenticate('github', async (err, profile) => {
        if (err) return next(err);
        if (!profile) return res.redirect('http://localhost:5173/');

        const githubid = profile.id;
        const username = profile.username;
        const email = profile.emails && profile.emails[0]?.value;

        try {
            // Check if the user already exists in Airtable
            const records = await table.select({
                filterByFormula: `{githubid} = '${githubid}'`
            }).firstPage();

            let user;
            if (records.length > 0) {
                user = records[0];
            } else {
                // Create a new user in Airtable
                const createdRecords = await table.create([{
                    fields: {
                        githubid: githubid,
                        username: username,
                        email: email || 'N/A'
                    }
                }]);
                user = createdRecords[0];
            }

            // Log the user in and redirect
            req.logIn(user, (err) => {
                if (err) return next(err);
                return res.redirect('http://localhost:5173/HomePage');
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error accessing Airtable', error });
        }
    })(req, res, next);
};


// Logout the user
exports.logout = async (req, res) => {
    try {
        await req.logout();
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: 'Failed to log out' });
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout' });
    }
};