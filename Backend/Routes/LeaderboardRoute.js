const express = require('express');
const router = express.Router();
const LeaderboardController = require('../Controllers/LeaderboardController');

router.get('/:owner/:repo/:userType', LeaderboardController.fetchAndStoreAllTimeRepoData);

router.put('/users/:username/type', LeaderboardController.updateUserType);

router.patch('/points/:username', LeaderboardController.updateUserPoints);

module.exports = router;