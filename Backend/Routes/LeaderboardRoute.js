const express = require('express');
const router = express.Router();
const LeaderboardController = require('../Controllers/LeaderboardController');

router.get('/repo/:owner/:repo', LeaderboardController.fetchRepoData);

router.patch('/points/:username', LeaderboardController.updateUserPoints);

module.exports = router;