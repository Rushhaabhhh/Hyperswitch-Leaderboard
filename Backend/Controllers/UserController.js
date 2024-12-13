// Required Modules
const dotenv = require('dotenv');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { contributorsTable } = require('../config/airtableConfig');

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

// Helper Function: Role-Based Redirect
const getRoleBasedRedirect = (role) => {
    const redirects = {
        'super-admin': '/super-admin',
        'admin': '/admin',
        'user': '/user',
        'default': '/user',
    };
    return redirects[role] || redirects['default'];
};

// Middleware: Role Checker
const checkUserRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const userRole = req.user.fields.Role;
            if (allowedRoles.includes(userRole)) {
                next();
            } else {
                return res.status(403).json({
                    message: 'Access denied',
                    currentRole: userRole,
                    requiredRoles: allowedRoles,
                });
            }
        } catch (error) {
            console.error('Role checking error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};

// UserController Class
class UserController {
    static middlewares = {
        isAdmin: checkUserRole(['admin']),
        isSuperAdmin: checkUserRole(['super-admin']),
        isUser: checkUserRole(['user']),
    };

    // GitHub Login
    static githubLogin(req, res, next) {
        passport.authenticate('github', { scope: ['user:email', 'read:user'] })(req, res, next);
    }

    // GitHub Callback
    static githubCallback(req, res, next) {
        passport.authenticate('github', async (err, profile) => {
            if (err) {
                console.error('GitHub authentication error:', err);
                return res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
            }

            if (!profile) {
                return res.redirect(`${FRONTEND_URL}/login?error=no_profile`);
            }

            try {
                const githubId = profile.id;
                const username = profile.username || profile.displayName;
                const profileLink = profile.profileUrl;

                const userData = {
                    GithubId: githubId,
                    Username: username,
                    ProfileLink: profileLink,
                    Role: 'user',
                };

                const records = await contributorsTable
                    .select({ filterByFormula: `{GithubId} = '${githubId}'` })
                    .firstPage();

                let user;
                if (records.length > 0) {
                    const updatedRecords = await contributorsTable.update([
                        {
                            id: records[0].id,
                            fields: {
                                ...userData,
                                Role: records[0].fields.Role || 'user',
                            },
                        },
                    ]);
                    user = updatedRecords[0];
                } else {
                    const createdRecords = await contributorsTable.create([
                        { fields: userData },
                    ]);
                    user = createdRecords[0];
                }

                req.login(user, (loginErr) => {
                    if (loginErr) {
                        console.error('Login error:', loginErr);
                        return res.redirect(`${FRONTEND_URL}/login?error=session_failed`);
                    }

                    const redirectPath = getRoleBasedRedirect(user.fields.Role);
                    return res.redirect(`${FRONTEND_URL}${redirectPath}`);
                });
            } catch (error) {
                console.error('Airtable error:', error);
                return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
            }
        })(req, res, next);
    }

    // Role-Based Redirect Endpoint
    static roleBasedRedirect(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const redirectPath = getRoleBasedRedirect(req.user.fields.Role);
            res.json({ redirectPath });
        } catch (error) {
            console.error('Role-based redirection error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Get User Role
    static async getUserRole(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            return res.json({
                role: req.user.fields.Role,
                username: req.user.fields.Username,
            });
        } catch (error) {
            console.error('Get user role error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Fetch User Profile
    static async getUserProfile(req, res) {
      const { username } = req.params;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const records = await contributorsTable.select({
            filterByFormula: `{Username} = '${username}'`,
        }).firstPage();

        if (records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userRecord = records[0];
        const userProfile = {
            id: userRecord.id,
            username: userRecord.fields.Username,
            githubUrl: userRecord.fields['GitHub URL'],
            role: userRecord.fields.Role,
        };

        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
  }

    // Get List of Admins
    static async getAdmins(req, res) {
        try {
            const records = await contributorsTable.select({
                filterByFormula: `{Role} = 'admin'`,
            }).all();
            res.json(records);
        } catch (error) {
            console.error('Error fetching admins:', error);
            res.status(500).json({ message: 'Error fetching admins' });
        }
    }

    // Assign Admin Role
    static async assignAdminRole(req, res) {
        const { username } = req.body;
        try {
            const newAdmin = await contributorsTable.create([
                {
                    fields: {
                        Role: 'admin',
                        Username: username,
                        ProfileLink: `https://github.com/${username}`,
                    },
                },
            ]);

            res.json({ message: 'Admin assigned successfully' });
        } catch (error) {
            console.error('Error assigning admin role:', error);
            res.status(500).json({ message: 'Error assigning admin role' });
        }
    }

    // Remove Admin Role
    static async removeAdminRole(req, res) {
        const { userId } = req.body;
        try {
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
}

module.exports = UserController;