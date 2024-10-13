const express = require('express');
const router = express.Router();
const LeaderboardController = require('../Controllers/LeaderboardController');

router.get('/repo/:owner/:repo', LeaderboardController.fetchRepoData);

module.exports = router;