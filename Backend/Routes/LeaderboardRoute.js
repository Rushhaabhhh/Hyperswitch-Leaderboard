const express = require('express');
const router = express.Router();
const LeaderboardController = require('../Controllers/LeaderboardController');

router.get('/repo/:owner/:repo/:userType?', LeaderboardController.fetchRepoData);

router.put('/users/:username/type', LeaderboardController.updateUserType);

router.patch('/points/:username', LeaderboardController.updateUserPoints);

module.exports = router;