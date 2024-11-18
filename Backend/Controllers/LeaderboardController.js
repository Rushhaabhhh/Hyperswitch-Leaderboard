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
    const { 
      sort = 'points_desc', 
      type = 'all',
      from,
      to
    } = req.query;

    try {
      // Parse and validate date parameters
      let startDate, endDate;
      
      try {
        // If from date is provided, use it; otherwise default to 7 days ago
        startDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // If to date is provided, use it; otherwise default to current time
        endDate = to ? new Date(to) : new Date();

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }

        // Ensure end date is not before start date
        if (endDate < startDate) {
          throw new Error('End date cannot be before start date');
        }
      } catch (dateError) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          details: dateError.message 
        });
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

      // Get contributors who contributed before the start date
      const historicalContributorsResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          params: {
            state: 'all',
            sort: 'updated',
            direction: 'desc',
            per_page: 100,
            until: startDate.toISOString()
          },
          headers: {
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
          }
        }
      );
      
      const historicalContributors = new Set(
        historicalContributorsResponse.data
          .map(item => item.user.login)
      );

      // Fetch organization members (internal contributors)
      const orgMembersResponse = await axios.get(
        `https://api.github.com/orgs/${owner}/members`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
          }
        }
      );
      const internalContributors = new Set(
        orgMembersResponse.data.map(member => member.login)
      );

      // Fetch issues and pull requests within the date range
      const issuesResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          params: {
            state: 'all',
            sort: 'updated',
            direction: 'desc',
            since: startDate.toISOString(),
            per_page: 100,
          },
          headers: {
            Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`
          }
        }
      );

      const contributors = {};
      const firstTimeContributorBonusGiven = new Set();

      // Filter and process issues/PRs within the date range
      const validIssues = issuesResponse.data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate && itemDate <= endDate;
      });

      // Process each issue or pull request
      for (const item of validIssues) {
        const username = item.user.login;

        // Skip internal contributors
        if (internalContributors.has(username)) continue;

        // Filter by type if specified
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
          createdAt: item.created_at,
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
        pointSystem: LeaderboardController.pointSystem,
        metadata: {
          dateRange: {
            from: startDate.toISOString(),
            to: endDate.toISOString()
          },
          totalContributions: sortedContributors.reduce((sum, contributor) => sum + contributor.contributions, 0)
        }
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch repository data', 
        details: error.message 
      });
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