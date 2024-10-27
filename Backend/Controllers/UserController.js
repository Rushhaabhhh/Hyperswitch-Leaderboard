const passport = require('passport');
const { contributorsTable } = require('../config/airtableConfig');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const cache = require('memory-cache');

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many authentication attempts, please try again later'
});

// Redirects the user to GitHub for authentication
exports.githubLogin = [
    authLimiter,
    (req, res, next) => {
        passport.authenticate('github', { 
            scope: ['user:email', 'read:user']
        })(req, res, next);
    }
];

// Handles the callback from GitHub after authentication
exports.githubCallback = [
    authLimiter,
    (req, res, next) => {
        passport.authenticate('github', async (err, profile) => {
            if (err) {
                logger.error('GitHub authentication error:', { error: err });
                return next(err);
            }
            if (!profile) {
                logger.warn('No profile received from GitHub');
                return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/');
            }

            try {
                const userData = {
                    githubId: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0]?.value || 'N/A',
                    avatarUrl: profile.photos?.[0]?.value,
                    lastLogin: new Date().toISOString()
                };

                // Check cache first
                const cacheKey = `user_${userData.githubId}`;
                let user = cache.get(cacheKey);

                if (!user) {
                    // Check if user exists in Airtable
                    const records = await contributorsTable.select({
                        filterByFormula: `{githubId} = '${userData.githubId}'`
                    }).firstPage();

                    if (records.length > 0) {
                        // Update existing user
                        const updatedRecords = await contributorsTable.update([{
                            id: records[0].id,
                            fields: {
                                ...userData,
                                loginCount: (records[0].fields.loginCount || 0) + 1,
                                updatedAt: new Date().toISOString()
                            }
                        }]);
                        user = updatedRecords[0];
                        logger.info('User updated:', { username: userData.username });
                    } else {
                        // Create new user
                        const createdRecords = await contributorsTable.create([{
                            fields: {
                                ...userData,
                                totalPoints: 0,
                                contributionsCount: 0,
                                loginCount: 1,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                        }]);
                        user = createdRecords[0];
                        logger.info('New user created:', { username: userData.username });
                    }

                    // Cache user data
                    cache.put(cacheKey, user, 5 * 60 * 1000); // 5 minutes
                }

                // Log the user in and redirect
                req.logIn(user, (err) => {
                    if (err) {
                        logger.error('Login error:', { error: err, username: userData.username });
                        return next(err);
                    }
                    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173/HomePage');
                });
            } catch (error) {
                logger.error('Airtable error:', { error });
                return res.status(500).json({ 
                    message: 'Error accessing database',
                    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
                });
            }
        })(req, res, next);
    }
];

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const cacheKey = `profile_${req.user.id}`;
        let userProfile = cache.get(cacheKey);

        if (!userProfile) {
            userProfile = await contributorsTable.find(req.user.id);
            cache.put(cacheKey, userProfile, 5 * 60 * 1000);
        }

        res.json({
            id: userProfile.id,
            ...userProfile.fields,
            githubId: undefined, // Exclude sensitive data
            email: undefined
        });
    } catch (error) {
        logger.error('Error fetching user profile:', { error, userId: req.user?.id });
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
                logger.error('Logout error:', { error: err, userId });
                return res.status(500).json({ message: 'Failed to log out' });
            }
            // Clear cache for this user
            if (userId) {
                cache.del(`user_${userId}`);
                cache.del(`profile_${userId}`);
            }
            res.clearCookie('connect.sid');
            logger.info('User logged out successfully:', { userId });
            res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        logger.error('Error during logout:', { error, userId: req.user?.id });
        res.status(500).json({ message: 'Error during logout' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const allowedUpdates = ['displayName', 'bio', 'location', 'website'];
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
                updatedAt: new Date().toISOString()
            }
        }]);

        // Update cache
        cache.del(`profile_${req.user.id}`);
        cache.del(`user_${req.user.id}`);

        logger.info('User profile updated:', { userId: req.user.id });
        res.json(updatedUser[0]);
    } catch (error) {
        logger.error('Error updating profile:', { error, userId: req.user?.id });
        res.status(500).json({ message: 'Error updating profile' });
    }
};