const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class LeaderboardController {
  // Point system configuration
  static pointSystem = {
    basePoints: 5,
    labelPoints: {
      easy: 5,
      medium: 10,
      hard: 20
    },
    firstTimeContributorBonus: 15,  // One-time bonus for first contribution
    specialLabels: {
      'feature': 25,
      'critical-bug': 30,
      'major-improvement': 20,
      'enhancement': 15,
      'security': 35,
      'performance': 20
    }
  };

  static async fetchRepoData(req, res) {
    const { owner, repo } = req.params;
    const { timeFrame = 'weekly', sort = 'points_desc', type = 'all' } = req.query;

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
        case 'allTime':
          since = new Date(0).toISOString(); // Unix epoch (1970-01-01T00:00:00.000Z)
          break;
        default:
          since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Fetch all contributors to identify first-time contributors
      const allContributorsResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contributors`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
          }
        }
      );

      // Get historical contributors (those who contributed before the time frame)
      const historicalContributors = new Set(allContributorsResponse.data.map(c => c.login));

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
      const firstTimeContributorBonusGiven = new Set(); // Track first-time bonus recipients

      // Process each issue or pull request
      for (const item of issuesResponse.data) {
        const username = item.user.login;

        // Skip internal contributors
        if (internalContributors.has(username)) continue;

        if (type !== 'all' && item.labels.every(label => label.name.toLowerCase() !== type)) continue;

        if (!contributors[username]) {
          const isFirstTimeContributor = !historicalContributors.has(username);
          contributors[username] = {
            username,
            points: 0,
            contributions: 0,
            details: [],
            isFirstTime: isFirstTimeContributor,
            firstTimeBonusGiven: false
          };
        }

        // Calculate points for this contribution
        const pointsData = LeaderboardController.calculatePoints(
          item, 
          contributors[username].isFirstTime && !firstTimeContributorBonusGiven.has(username)
        );

        // If first-time bonus was awarded, mark it as given
        if (pointsData.breakdown.firstTimeBonus > 0) {
          firstTimeContributorBonusGiven.add(username);
          contributors[username].firstTimeBonusGiven = true;
        }

        contributors[username].points += pointsData.total;
        contributors[username].contributions++;
        contributors[username].details.push({
          type: item.pull_request ? 'Pull Request' : 'Issue',
          title: item.title,
          url: item.html_url,
          labels: item.labels.map(label => label.name),
          pointsEarned: pointsData.total,
          pointBreakdown: pointsData.breakdown
        });
      }

      // Sort contributors based on points or contributions
      let sortedContributors = Object.values(contributors);
      switch (sort) {
        case 'points_asc':
          sortedContributors.sort((a, b) => a.points - b.points);
          break;
        case 'points_desc':
          sortedContributors.sort((a, b) => b.points - a.points);
          break;
        case 'contributions_asc':
          sortedContributors.sort((a, b) => a.contributions - b.contributions);
          break;
        case 'contributions_desc':
          sortedContributors.sort((a, b) => b.contributions - a.contributions);
          break;
      }

      res.json({
        leaderboard: sortedContributors,
        totalItems: sortedContributors.length,
        pointSystem: LeaderboardController.pointSystem
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      res.status(500).json({ error: 'Failed to fetch repository data', details: error.message });
    }
  }

  static calculatePoints(item, isEligibleForFirstTimeBonus) {
    const breakdown = {
      base: this.pointSystem.basePoints,
      difficultyBonus: 0,
      specialBonus: 0,
      firstTimeBonus: 0
    };

    // Add base points
    let totalPoints = breakdown.base;

    // Add points based on difficulty labels
    const difficultyLabel = item.labels.find(label => 
      ['easy', 'medium', 'hard'].includes(label.name.toLowerCase())
    );
    if (difficultyLabel) {
      breakdown.difficultyBonus = this.pointSystem.labelPoints[difficultyLabel.name.toLowerCase()];
      totalPoints += breakdown.difficultyBonus;
    }

    // Add points for special contributions
    item.labels.forEach(label => {
      const specialPoints = this.pointSystem.specialLabels[label.name.toLowerCase()];
      if (specialPoints) {
        breakdown.specialBonus += specialPoints;
        totalPoints += specialPoints;
      }
    });

    // Add first-time contributor bonus (only once)
    if (isEligibleForFirstTimeBonus) {
      breakdown.firstTimeBonus = this.pointSystem.firstTimeContributorBonus;
      totalPoints += breakdown.firstTimeBonus;
    }

    return {
      total: totalPoints,
      breakdown
    };
  }
}

module.exports = LeaderboardController;


/*
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class LeaderboardController {
  // Point system configuration remains the same
  static pointSystem = {
    basePoints: 5,
    labelPoints: {
      easy: 5,
      medium: 10,
      hard: 20
    },
    firstTimeContributorBonus: 15,
    specialLabels: {
      'feature': 25,
      'critical-bug': 30,
      'major-improvement': 20,
      'enhancement': 15,
      'security': 35,
      'performance': 20
    }
  };

  static async fetchRepoData(req, res) {
    const { owner, repo } = req.params;
    const { timeFrame = 'weekly', sort = 'points_desc', type = 'all' } = req.query;

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

      // Fetch all contributors to identify first-time contributors
      const allContributorsResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contributors`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
          }
        }
      );

      const historicalContributors = new Set(allContributorsResponse.data.map(c => c.login));

      // Fetch organization members (internal contributors)
      const orgMembersResponse = await axios.get(`https://api.github.com/orgs/${owner}/members`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
        }
      });
      const internalContributors = new Set(orgMembersResponse.data.map(member => member.login));

      // Fetch closed issues and merged pull requests
      const issuesResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        params: {
          state: 'closed', // Only fetch closed issues/PRs
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
      const firstTimeContributorBonusGiven = new Set();

      // Process each closed issue or merged pull request
      for (const item of issuesResponse.data) {
        const username = item.user.login;

        // Skip internal contributors
        if (internalContributors.has(username)) continue;

        // For pull requests, check if they were merged
        if (item.pull_request) {
          const prResponse = await axios.get(item.pull_request.url, {
            headers: {
              Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
            }
          });
          
          // Skip if PR was closed without merging
          if (!prResponse.data.merged) continue;
        }

        if (type !== 'all' && item.labels.every(label => label.name.toLowerCase() !== type)) continue;

        if (!contributors[username]) {
          const isFirstTimeContributor = !historicalContributors.has(username);
          contributors[username] = {
            username,
            points: 0,
            contributions: 0,
            details: [],
            isFirstTime: isFirstTimeContributor,
            firstTimeBonusGiven: false,
            mergedPRs: 0,
            closedIssues: 0
          };
        }

        // Calculate points for this contribution
        const pointsData = LeaderboardController.calculatePoints(
          item, 
          contributors[username].isFirstTime && !firstTimeContributorBonusGiven.has(username)
        );

        // If first-time bonus was awarded, mark it as given
        if (pointsData.breakdown.firstTimeBonus > 0) {
          firstTimeContributorBonusGiven.add(username);
          contributors[username].firstTimeBonusGiven = true;
        }

        contributors[username].points += pointsData.total;
        contributors[username].contributions++;
        
        // Track PR vs Issue counts
        if (item.pull_request) {
          contributors[username].mergedPRs++;
        } else {
          contributors[username].closedIssues++;
        }

        contributors[username].details.push({
          type: item.pull_request ? 'Merged Pull Request' : 'Closed Issue',
          title: item.title,
          url: item.html_url,
          labels: item.labels.map(label => label.name),
          pointsEarned: pointsData.total,
          pointBreakdown: pointsData.breakdown,
          closedAt: item.closed_at,
          mergedAt: item.pull_request ? (await axios.get(item.pull_request.url, {
            headers: {
              Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
            }
          })).data.merged_at : null
        });
      }

      // Sort contributors based on points or contributions
      let sortedContributors = Object.values(contributors);
      switch (sort) {
        case 'points_asc':
          sortedContributors.sort((a, b) => a.points - b.points);
          break;
        case 'points_desc':
          sortedContributors.sort((a, b) => b.points - a.points);
          break;
        case 'contributions_asc':
          sortedContributors.sort((a, b) => a.contributions - b.contributions);
          break;
        case 'contributions_desc':
          sortedContributors.sort((a, b) => b.contributions - a.contributions);
          break;
      }

      res.json({
        leaderboard: sortedContributors,
        totalItems: sortedContributors.length,
        pointSystem: LeaderboardController.pointSystem,
        summary: {
          totalContributors: sortedContributors.length,
          totalMergedPRs: sortedContributors.reduce((sum, c) => sum + c.mergedPRs, 0),
          totalClosedIssues: sortedContributors.reduce((sum, c) => sum + c.closedIssues, 0),
          totalPoints: sortedContributors.reduce((sum, c) => sum + c.points, 0)
        }
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      res.status(500).json({ error: 'Failed to fetch repository data', details: error.message });
    }
  }

  static calculatePoints(item, isEligibleForFirstTimeBonus) {
    // calculatePoints method remains the same
    const breakdown = {
      base: this.pointSystem.basePoints,
      difficultyBonus: 0,
      specialBonus: 0,
      firstTimeBonus: 0
    };

    let totalPoints = breakdown.base;

    const difficultyLabel = item.labels.find(label => 
      ['easy', 'medium', 'hard'].includes(label.name.toLowerCase())
    );
    if (difficultyLabel) {
      breakdown.difficultyBonus = this.pointSystem.labelPoints[difficultyLabel.name.toLowerCase()];
      totalPoints += breakdown.difficultyBonus;
    }

    item.labels.forEach(label => {
      const specialPoints = this.pointSystem.specialLabels[label.name.toLowerCase()];
      if (specialPoints) {
        breakdown.specialBonus += specialPoints;
        totalPoints += specialPoints;
      }
    });

    if (isEligibleForFirstTimeBonus) {
      breakdown.firstTimeBonus = this.pointSystem.firstTimeContributorBonus;
      totalPoints += breakdown.firstTimeBonus;
    }

    return {
      total: totalPoints,
      breakdown
    };
  }
}

module.exports = LeaderboardController;
*/