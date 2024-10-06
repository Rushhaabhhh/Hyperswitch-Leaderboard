const passport = require('passport');

// Redirects the user to GitHub for authentication
exports.githubLogin = (req, res, next) => {
    console.log("Redirecting to GitHub for authentication");
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};

// Handles the callback from GitHub after authentication
exports.githubCallback = (req, res, next) => {
    passport.authenticate('github', (err, user, info) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
            return res.redirect('/login'); // Redirect to login if user is not found
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('http://localhost:5173/HomePage'); 
        });
    })(req, res, next);
};


// Get the logged-in user info
exports.getUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
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
                return res.status(500).json({ message: 'Failed to log out' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logged out successfully' }); // Respond instead of redirecting
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout' });
    }
};
