const passport = require('passport');
const table = require('../config/airtableConfig');
const axios = require('axios');

// Helper function for handling errors
const handleError = (res, statusCode, message, error = null) => {
    console.error(`${message}:`, error);
    return res.status(statusCode).json({ message, error: error?.message || error });
};

// Redirects the user to GitHub for authentication
exports.githubLogin = (req, res, next) => {
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};

// Handles the callback from GitHub after authentication
exports.githubCallback = (req, res, next) => {
    passport.authenticate('github', async (err, profile) => {
        if (err) return handleError(res, 500, 'Authentication error', err);
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
                if (err) return handleError(res, 500, 'Login error', err);
                return res.redirect('http://localhost:5173/HomePage');
            });
        } catch (error) {
            return handleError(res, 500, 'Error accessing Airtable', error);
        }
    })(req, res, next);
};

// Get the logged-in user info
exports.getUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return handleError(res, 401, 'User not authenticated');
    }

    res.json({
        id: req.user.id,
        username: req.user.fields.username,
        email: req.user.fields.email
    });
};

// Logout the user
exports.logout = async (req, res) => {
    if (!req.isAuthenticated()) {
        return handleError(res, 401, 'User not authenticated');
    }

    try {
        await req.logout();
        req.session.destroy((err) => {
            if (err) return handleError(res, 500, 'Failed to log out', err);
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        handleError(res, 500, 'Error during logout', error);
    }
};

exports.getUserGitHubData = async (req, res) => {
    if (!req.isAuthenticated()) {
        return handleError(res, 401, 'User not authenticated');
    }

    const githubUsername = req.user.fields.username;

    try {
        // Fetch user profile data
        const userResponse = await axios.get(`https://api.github.com/users/${githubUsername}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.GITHUB_ACCESS_TOKEN}`
            }
        });

        const userData = userResponse.data;

        // Fetch user's README
        let readme = null;
        try {
            const readmeResponse = await axios.get(`https://api.github.com/repos/${githubUsername}/${githubUsername}/readme`, {
                headers: {
                    'Accept': 'application/vnd.github.v3.raw',
                    'Authorization': `token ${process.env.GITHUB_ACCESS_TOKEN}`
                }
            });
            readme = readmeResponse.data;
        } catch (error) {
            console.log('README not found or inaccessible');
        }

        res.json({
            avatar_url: userData.avatar_url,
            name: userData.name,
            bio: userData.bio,
            public_repos: userData.public_repos,
            followers: userData.followers,
            following: userData.following,
            readme: readme
        });
    } catch (error) {
        handleError(res, 500, 'Error fetching GitHub data', error);
    }
};