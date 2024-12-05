const express = require('express');
const router = express.Router();
const LeaderboardController = require('../Controllers/LeaderboardController');

router.get('/:owner/:repo/:userType', LeaderboardController.fetchAndStoreAllTimeRepoData);

router.patch('/users/:username', LeaderboardController.updateUserType);

router.patch('/points/:username', LeaderboardController.updateUserPoints);

module.exports = router;