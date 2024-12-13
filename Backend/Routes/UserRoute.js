// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');

// Helper function for role-based redirection
const getRoleBasedRedirect = (role) => {
    switch (role) {
        case 'admin': return '/admin';
        case 'super-admin': return '/super-admin';
        case 'user': return '/user';
        default: return '/user';
    }
};

// User profile routes
router.get('/profile/:username', UserController.getUserProfile);

// Admin management routes
router.get('/get-admin', UserController.getAdmins);
router.post('/assign-admin', UserController.assignAdminRole);
router.delete('/remove-admin', UserController.removeAdminRole);

// Auth routes with enhanced role handling
router.get('/github', UserController.githubLogin);
router.get('/github/callback', UserController.githubCallback);

// Role-based route handler
router.get('/dashboard', async (req, res) => {

    try {
        const userEmail = req.user.fields.Email; 
        const userRole = await UserController.getUserRoleFromAirtable(userEmail);

        if (!userRole) {
            return res.status(404).send('User role not found.');
        }

        // Redirect based on role
        const redirectPath = getRoleBasedRedirect(userRole);
        return res.redirect(redirectPath);
    } catch (error) {
        console.error('Error checking user role:', error);
        return res.status(500).send('Internal server error.');
    }
});


module.exports = router;