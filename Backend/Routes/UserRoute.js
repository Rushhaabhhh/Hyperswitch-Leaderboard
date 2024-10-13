// UserRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');

router.get('/github', UserController.githubLogin);

router.get('/github/callback', UserController.githubCallback);

router.get('/user', UserController.getUser);

router.get('/logout', UserController.logout);

module.exports = router;
