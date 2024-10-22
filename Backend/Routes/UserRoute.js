// userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Auth routes
router.get('/github', UserController.githubLogin);
router.get('/github/callback', UserController.githubCallback);
router.post('/logout', UserController.logout);

// Profile routes
router.get('/user/profile', UserController.getProfile);
router.put('/user/profile/username', UserController.updateUsername);
router.put('/user/profile/image', upload.single('image'), UserController.updateProfileImage);

module.exports = router;