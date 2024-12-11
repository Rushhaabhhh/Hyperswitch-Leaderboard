const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');

// Auth routes
router.get('/github', UserController.githubLogin);
router.get('/github/callback', UserController.githubCallback);
router.post('/logout', UserController.logout);

// User profile routes
router.get('/profile', UserController.getUserProfile);
router.put('/profile', UserController.updateProfile);

// Admin management routes
router.get('/get-admin', UserController.getAdmins);
router.post('/assign-admin', UserController.assignAdminRole);
router.delete('/remove-admin', UserController.removeAdminRole);

module.exports = router;