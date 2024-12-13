const express = require('express');
const LeaderboardController = require('../Controllers/LeaderboardController');

const router = express.Router();

// Route to get leaderboard data for a specific user type
router.get('/:userType', async (req, res) => {
  await LeaderboardController.fetchLeaderboardData(req, res);
});

// Route to update points for a specific user
router.put('/points/:username', async (req, res) => {
  await LeaderboardController.updateUserPoints(req, res);
});

// Route to update user type for a specific user
router.put('/users/:username', async (req, res) => {
  await LeaderboardController.updateUserType(req, res);
});

module.exports = router;
