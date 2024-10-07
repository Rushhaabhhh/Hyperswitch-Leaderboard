// UserController.js
const passport = require('passport');
const table = require('../config/airtableConfig');

// Redirects the user to GitHub for authentication
exports.githubLogin = (req, res, next) => {
    console.log("Redirecting to GitHub for authentication");
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};

// Handles the callback from GitHub after authentication
exports.githubCallback = (req, res, next) => {
    passport.authenticate('github', async (err, profile, info) => {
        if (err) {
            console.error('Authentication error:', err); // Log any errors
            return next(err);
        }

        if (!profile) {
            console.log('GitHub profile not found');
            return res.redirect('/login');
        }

        const githubId = profile.id;
        const username = profile.username;
        const email = profile.emails && profile.emails[0]?.value;

        try {
            // Log user information for debugging
            console.log(`GitHub Profile: ID=${githubId}, Username=${username}, Email=${email}`);

            // Check if the user already exists in Airtable
            const records = await table.select({
                filterByFormula: `githubId = '${githubId}'`
            }).firstPage();

            let user;

            if (records.length > 0) {
                user = records[0]; 
                console.log('User found in Airtable:', user.fields);
            } else {
                // Create a new user in Airtable
                const createdRecords = await table.create([{
                    fields: {
                        githubId: githubId,
                        username: username,
                        email: email || 'N/A'
                    }
                }]);
                user = createdRecords[0]; 
                console.log('New user created in Airtable:', user.fields);
            }

            // Log the user in and redirect
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Login error:', err);
                    return next(err);
                }
                console.log('User logged in, redirecting to homepage');
                return res.redirect('http://localhost:5173/HomePage');
            });

        } catch (error) {
            console.error('Error accessing Airtable:', error);
            return res.status(500).json({ message: 'Error accessing Airtable', error });
        }
    })(req, res, next);
};

// Get the logged-in user info
exports.getUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            id: req.user.id, // Airtable record id
            username: req.user.fields.username,
            email: req.user.fields.email
        });
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
};

// Logout the user
exports.logout = async (req, res) => {
    try {
        await req.logout();
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Failed to log out' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
};
