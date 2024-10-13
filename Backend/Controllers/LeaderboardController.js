const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class LeaderboardController {
  static async fetchRepoData(req, res) {
    const { owner, repo } = req.params;
    const { timeFrame = 'weekly' } = req.query;

    try {
      let since;
      switch (timeFrame) {
        case 'daily':
          since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'weekly':
          since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'monthly':
          since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        params: {
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          since,
          per_page: 100, // Increase this if you need more data
        },
        headers: {
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
          },
      });

      const contributors = {};
      response.data.forEach(item => {
        const username = item.user.login;
        if (!contributors[username]) {
          contributors[username] = {
            username,
            contributions: 0,
          };
        }
        contributors[username].contributions++;
      });

      const leaderboard = Object.values(contributors)
        .sort((a, b) => b.contributions - a.contributions);

      res.json({
        leaderboard,
        totalItems: response.data.length,
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      res.status(500).json({ error: 'Failed to fetch repository data', details: error.message });
    }
  }
}

module.exports = LeaderboardController;