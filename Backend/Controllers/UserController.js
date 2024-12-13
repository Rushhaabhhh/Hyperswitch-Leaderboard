const dotenv = require('dotenv');
const passport = require('passport');
const { contributorsTable } = require('../config/airtableConfig');

dotenv.config();

// // Check if user is super-admin
// function isSuperAdmin(user) {
//     return user && user.fields && user.fields.Role === 'super-admin';
// }

// // Check if user is admin
// function isAdmin(user) {
//     return user && user.fields && user.fields.Role === 'admin';
// }

// Initiate GitHub login
exports.githubLogin = (req, res, next) => {
    passport.authenticate('github', { scope: ['user:email', 'read:user'] })(req, res, next);
};

// Handle GitHub login callback
exports.githubCallback = async (req, res, next) => {
    passport.authenticate('github', async (err, profile) => {
        if (err) {
            console.error('GitHub authentication error:', err);
            return next(err);
        }

        if (!profile) {
            return res.redirect(`${process.env.FRONTEND_URL}/`);
        }

        try {
            const userData = {
                GithubId: profile.id,
                Username: profile.username,
                ProfileLink: profile.profileUrl,
                TotalPoints: 0,
                Rank: 'Newbie',
            };

            // Check if user exists in Airtable
            const records = await contributorsTable.select({
                filterByFormula: `{GithubId} = '${userData.GithubId}'`
            }).firstPage();

            let user;
            if (records.length > 0) {
                // Update existing user
                const updatedRecords = await contributorsTable.update([{
                    id: records[0].id,
                    fields: {
                        ...userData,
                        Role: records[0].fields.Role // Retain existing role
                    }
                }]);
                user = updatedRecords[0];
            } else {
                // Create new user
                const createdRecords = await contributorsTable.create([{
                    fields: {
                        ...userData,
                        Role: 'user' // Default role
                    }
                }]);
                user = createdRecords[0];
            }

            // Redirect based on role
            const roleRedirects = {
                admin: '/admin',
                'super-admin': '/super-admin',
                user: '/user'
            };
            return res.redirect(`${process.env.FRONTEND_URL}${roleRedirects[user.fields.Role] || '/user'}`);
        } catch (error) {
            console.error('Airtable error:', error);
            return res.status(500).json({ message: error.message });
        }
    })(req, res, next);
};

// Fetch user profile
exports.getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const userProfile = await contributorsTable.find(req.user.id);

        res.json({
            id: userProfile.id,
            ...userProfile.fields,
            GithubId: undefined,
            Role: userProfile.fields.Role || 'user'
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const userId = req.user?.id;
        await req.logout();
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Failed to log out' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const allowedUpdates = ['Username', 'Rank', 'TotalPoints', 'ProfileLink'];
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        const updatedUser = await contributorsTable.update([{
            id: req.user.id,
            fields: {
                ...updates,
                UpdatedAt: new Date().toISOString(),
                Role: req.user.fields.Role || 'user'
            }
        }]);

        res.json(updatedUser[0]);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Get list of admins
exports.getAdmins = async (req, res) => {
    try {
        const records = await contributorsTable.select({
            filterByFormula: `{Role} = 'admin'`
        }).all();
        res.json(records);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error fetching admins' });
    }
};

// Assign admin role (super-admin only)
exports.assignAdminRole = async (req, res) => {
    const { username } = req.body;
    try {
        const newAdmin = await contributorsTable.create([
            {
                fields: {
                    Role: 'admin',
                    Username: username,
                    ProfileLink: `https://github.com/${username}`,
                }
            }
        ]);

        res.json({ message: 'Admin assigned successfully'});
    } catch (error) {
        console.error('Error assigning admin role:', error);
        res.status(500).json({ message: 'Error assigning admin role' });
    }
};

// Remove admin role (super-admin only)
exports.removeAdminRole = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'Bad Request: userId is required.' });
        }

        const userToUpdate = await contributorsTable.find(userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = await contributorsTable.update([{
            id: userToUpdate.id,
            fields: { Role: 'user' }
        }]);

        res.json({ message: 'Admin Role removed successfully'});
    } catch (error) {
        console.error('Error removing admin role:', error);
        res.status(500).json({ message: 'Error removing admin role' });
    }
};
