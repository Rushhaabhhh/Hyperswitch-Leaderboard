// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');


// User profile routes
router.get('/profile', UserController.getUserProfile);
router.put('/profile', UserController.updateProfile);

// Admin management routes
router.get('/get-admin', UserController.getAdmins);
router.post('/assign-admin', UserController.assignAdminRole);
router.delete('/remove-admin', UserController.removeAdminRole);

// Auth routes with enhanced role handling
router.get('/github', UserController.githubLogin);
router.get('/github/callback', UserController.githubCallback);

// Role-based route handler
router.get('/dashboard', (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.redirect('/');
    }
    const userRole = req.user.fields.Role || 'user';

    // Redirect based on role
    const redirectPath = getRoleBasedRedirect(userRole);
    res.redirect(redirectPath);
});


module.exports = router;