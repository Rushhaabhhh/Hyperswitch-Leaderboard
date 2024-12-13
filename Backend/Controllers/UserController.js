const dotenv = require('dotenv');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { contributorsTable } = require('../config/airtableConfig');

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

// Role-Based Middleware
// Middleware to check user roles and control access
const checkUserRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get user role from Airtable
      const userRole = req.user.fields.Role;

      // Check if user's role is in the allowed roles
      if (allowedRoles.includes(userRole)) {
        next(); // Allow access
      } else {
        // Forbidden access
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


// Role-based redirect helper
const getRoleBasedRedirect = (role) => {
    const redirects = {
        'super-admin': '/super-admin',
        'admin': '/admin',
        'user': '/user',
        'default': '/user'
    };
    return redirects[role] || redirects['default'];
};
// Middleware Definitions
exports.middlewares = {
  isAdmin: checkUserRole(['admin']),
  isSuperAdmin: checkUserRole(['super-admin']),
  isUser: checkUserRole(['user']),
};

// Passport Configuration for GitHub OAuth
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;
        const username = profile.username || profile.displayName;
        const profileLink = profile.profileUrl;

        // Check if user exists in Airtable
        const records = await contributorsTable
          .select({
            filterByFormula: `{GithubId} = '${githubId}'`,
          })
          .firstPage();

        let user;
        const userData = {
          GithubId: githubId,
          Username: username,
          ProfileLink: profileLink,
          Role: 'user',
        };

        if (records.length > 0) {
          // Update existing user, preserve existing role
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
          // Create new user
          const createdRecords = await contributorsTable.create([
            {
              fields: userData,
            },
          ]);
          user = createdRecords[0];
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialization and Deserialization of User
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

// Authentication Controllers
// GitHub Login initiation
exports.githubLogin = (req, res, next) => {
  passport.authenticate('github', { scope: ['user:email', 'read:user'] })(
    req,
    res,
    next
  );
};

// GitHub Callback after authentication
exports.githubCallback = async (req, res, next) => {
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

            // Prepare user data
            const userData = {
                GithubId: githubId,
                Username: username,
                ProfileLink: profileLink,
                Role: 'user'
            };

            // Check if user exists in Airtable
            const records = await contributorsTable.select({
                filterByFormula: `{GithubId} = '${githubId}'`
            }).firstPage();

            let user;
            if (records.length > 0) {
                // Update existing user
                const updatedRecords = await contributorsTable.update([{
                    id: records[0].id,
                    fields: {
                        ...userData,
                        // Preserve existing role if it exists
                        Role: records[0].fields.Role || 'user'
                    }
                }]);
                user = updatedRecords[0];
            } else {
                // Create new user
                const createdRecords = await contributorsTable.create([{
                    fields: userData
                }]);
                user = createdRecords[0];
            }

            // Use req.login to establish a login session
            req.login(user, (loginErr) => {
                if (loginErr) {
                    console.error('Login error:', loginErr);
                    return res.redirect(`${FRONTEND_URL}/login?error=session_failed`);
                }

                // Determine redirect based on user role
                const redirectPath = getRoleBasedRedirect(user.fields.Role);
                
                // Redirect to appropriate dashboard
                return res.redirect(`${FRONTEND_URL}${redirectPath}`);
            });

        } catch (error) {
            console.error('Airtable error:', error);
            return res.status(500).redirect(`${FRONTEND_URL}/login?error=server_error`);
        }
    })(req, res, next);
};

// User Role Retrieval Endpoint
exports.getUserRole = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Return user role
    return res.json({
      role: req.user.fields.Role,
      username: req.user.fields.Username,
    });
  } catch (error) {
    console.error('Get user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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
      Role: userProfile.fields.Role || 'user',
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

    const allowedUpdates = ['Username', 'ProfileLink'];
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const updatedUser = await contributorsTable.update([
      {
        id: req.user.id,
        fields: {
          ...updates,
          UpdatedAt: new Date().toISOString(),
          Role: req.user.fields.Role || 'user',
        },
      },
    ]);

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
      filterByFormula: `{Role} = 'admin'`,
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
        },
      },
    ]);

    res.json({ message: 'Admin assigned successfully' });
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
