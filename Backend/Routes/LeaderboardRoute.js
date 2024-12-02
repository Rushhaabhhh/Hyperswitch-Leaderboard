const express = require('express');
const router = express.Router();
const LeaderboardController = require('../Controllers/LeaderboardController');

router.get('/github/fetch/:owner/:repo', 
    (req, res) => LeaderboardController.fetchAndStoreGitHubContributions(req, res)
  );
  
router.get('/', (req, res) => LeaderboardController.getLeaderboard(req, res));
router.patch('/points/:username', LeaderboardController.updateUserPoints);

module.exports = router;