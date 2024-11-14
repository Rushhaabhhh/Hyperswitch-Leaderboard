const passport = require('passport');
const { contributorsTable } = require('../config/airtableConfig');
const dotenv = require('dotenv');

dotenv.config();

// Helper function to check if user is super-admin
function isSuperAdmin(user) {
    return user && user.fields && user.fields.Role === 'super-admin';
}

// Helper function to check if user is admin
function isAdmin(user) {
    return user && user.fields && user.fields.Role === 'admin';
}

exports.githubLogin = (req, res, next) => {
    passport.authenticate('github', { 
        scope: ['user:email', 'read:user']
    })(req, res, next);
};

// Callback URL after successful GitHub authentication
exports.githubCallback = async (req, res, next) => {
    passport.authenticate('github', async (err, profile) => {
        if (err) {
            console.error('GitHub authentication error:', err);
            return next(err);
        }

        if (!profile) {
            console.warn('No profile received from GitHub');
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
                        Role: records[0].fields.Role // Preserve the existing role
                    }
                }]);
                user = updatedRecords[0];
                console.info('User updated:', userData.Username);
            } else {
                // Create new user
                const createdRecords = await contributorsTable.create([{
                    fields: {
                        ...userData,
                        Role: 'user' // Set the default role to 'user'
                    }
                }]);
                user = createdRecords[0];
                console.info('New user created:', userData.Username);
            }

            // Check the user's role and redirect accordingly
            if (user.fields.Role === 'admin') {
                return res.redirect(`${process.env.FRONTEND_URL}/admin`);
            } else if (user.fields.Role === 'super-admin') {
                return res.redirect(`${process.env.FRONTEND_URL}/super-admin`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/user`);
            }
        } catch (error) {
            console.error('Airtable error:', error);
            return res.status(500).json({ message: error.message });
        }
    })(req, res, next);
};

// Get user profile
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

// Logout the user
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
            console.info('User logged out successfully:', userId);
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

        const newAdmin = await contributorsTable.update([{
            id: req.user.id,
            fields: {
                ...updates,
                UpdatedAt: new Date().toISOString(),
                Role: req.user.fields.Role || 'user'
            }
        }]);

        console.info('User profile updated:', req.user.id);
        res.json(newAdmin[0]);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

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

// Assign admin role - Only accessible by super-admin
exports.assignAdminRole = async (req, res) => {
    const { username, email} = req.body;
    try {        
        const newAdmin = await contributorsTable.create([
        { 
            fields: {
                Role: 'admin',
                Username: username,
                ProfileLink: 'https://github.com/' + username,
            }
          }
        ]);
        
        console.info('Role updated:', newAdmin[0].id, 'admin');
        res.json({ message: 'Role updated successfully', user: newAdmin[0] });
    } catch (error) {
        console.error('Error assigning admin role:', error);
        res.status(500).json({ message: 'Error assigning admin role' });
    }
};

exports.removeAdminRole = async (req, res) => {
    try {
        if (!req.user || !isSuperAdmin(req.user)) {
            return res.status(403).json({ message: 'Forbidden: Only super-admin can remove roles.' });
        }

        const { userId } = req.body;

        const userToUpdate = await contributorsTable.find(userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newAdmin = await contributorsTable.update([{
            id: userToUpdate.id,
            fields: { Role: 'user' }
        }]);

        console.info('Role removed from user:', userId);
        res.json({ message: 'Role removed successfully', user: newAdmin[0] });
    } catch (error) {
        console.error('Error removing admin role:', error);
        res.status(500).json({ message: 'Error removing admin role' });
    }
};