const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');

// GitHub OAuth login route
router.get('/github', UserController.githubLogin);

// GitHub OAuth callback route
router.get('/github/callback', UserController.githubCallback);

// Get current user info
router.get('/user', UserController.getUser);

// Logout user
router.get('/logout', UserController.logout);

module.exports = router;
