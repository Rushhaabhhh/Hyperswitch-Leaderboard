const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class LeaderboardController {
  static async fetchRepoData(req, res) {
    const { owner, repo } = req.params;
    const { timeFrame = 'weekly', sort = 'contributions_desc', type = 'all' } = req.query;

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

      // Fetch organization members (internal contributors)
      const orgMembersResponse = await axios.get(`https://api.github.com/orgs/${owner}/members`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
        }
      });
      const internalContributors = new Set(orgMembersResponse.data.map(member => member.login));

      // Fetch issues and pull requests
      const issuesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        params: {
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          since,
          per_page: 100,
        },
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
        }
      });

      const contributors = {};

      // Iterate over each issue or pull request
      issuesResponse.data.forEach(item => {
        const username = item.user.login;

        // Skip internal contributors
        if (internalContributors.has(username)) return;

        if (type !== 'all' && item.labels.every(label => label.name.toLowerCase() !== type)) return;

        if (!contributors[username]) {
          contributors[username] = {
            username,
            contributions: 0,
            details: []
          };
        }

        contributors[username].contributions++;
        contributors[username].details.push({
          type: item.pull_request ? 'Pull Request' : 'Issue',
          title: item.title,
          url: item.html_url,
          labels: item.labels.map(label => label.name)
        });
      });

      // Sort the contributors based on the number of contributions
      let sortedContributors = Object.values(contributors);
      if (sort === 'contributions_asc') {
        sortedContributors = sortedContributors.sort((a, b) => a.contributions - b.contributions);
      } else {
        sortedContributors = sortedContributors.sort((a, b) => b.contributions - a.contributions);
      }

      res.json({
        leaderboard: sortedContributors,
        totalItems: sortedContributors.length,
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      res.status(500).json({ error: 'Failed to fetch repository data', details: error.message });
    }
  }
}

module.exports = LeaderboardController;
