const axios = require('axios');
const dotenv = require('dotenv');
const { leaderboardTable } = require('../config/airtableConfig');
const Redis = require('ioredis');
dotenv.config();

class LeaderboardController {
  static pointSystem = {
    basePoints: 5,
    labelPoints: {
      easy: 5,
      medium: 10,
      hard: 20,
    },
    firstTimeContributorBonus: 15,
    specialLabels: {
      feature: 25,
      'critical-bug': 30,
      'major-improvement': 20,
      enhancement: 15,
      security: 35,
      performance: 20,
    },
  };

  // Redis client initialization
  static redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // password: process.env.REDIS_PASSWORD,
  });

  // Caching configuration
  static CACHE_KEY_PREFIX = 'gh_leaderboard:';
  static CACHE_EXPIRATION = 24 * 60 * 60; 

  // Method to save data to Airtable with existing implementation
  static async saveToAirtableOnce(data) {
    try {
      const escapedUsername = data.Username.replace(/'/g, "\\'");
      const escapedContributionID = data.ContributionID.replace(/'/g, "\\'");
      const filterByFormula = `AND({Username} = '${escapedUsername}', {ContributionID} = '${escapedContributionID}')`;

      const existingRecords = await leaderboardTable
        .select({ filterByFormula })
        .firstPage();

      if (existingRecords.length > 0) {
        return;
      }

      await leaderboardTable.create([{ fields: data }]);
    } catch (error) {
      console.error('Error saving data to Airtable:', error);
    }
  }

  // Ensure this method uses arrow function or explicit binding
  static fetchAndStoreAllTimeRepoData = async (req, res) => {
    const { owner, repo, userType } = req.params;

    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${owner}:${repo}:${userType}:all_time`;
      const cachedData = await this.redisClient.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Fetch both issues and pull requests
      const [issuesResponse, pullRequestsResponse] = await Promise.all([
        axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          params: { state: 'all', per_page: 100 },
          headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
        }),
        axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
          params: { state: 'all', per_page: 100 },
          headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
        })
      ]);

      // Combine and deduplicate contributors
      const contributors = {};
      const allContributors = new Set();

      // Helper function to process contributors
      const processContributor = (item, type) => {
        // Check for valid user
        const username = item.user?.login;
        if (!username) return;

        // Track first-time contributors
        if (!allContributors.has(username)) {
          allContributors.add(username);
        }

        // Initialize contributor if not exists
        if (!contributors[username]) {
          contributors[username] = {
            username,
            points: 0,
            contributions: 0,
            details: [],
            isFirstTime: !allContributors.has(username),
          };
        }

        // Calculate points
        const pointsData = this.calculatePoints(item, contributors[username].isFirstTime);

        // Update contributor details
        contributors[username].points += pointsData.total;
        contributors[username].contributions++;
        contributors[username].details.push({
          type: type,
          title: item.title,
          url: item.html_url,
          createdAt: item.created_at,
          labels: item.labels.map((label) => label.name),
          pointsEarned: pointsData.total,
          pointBreakdown: pointsData.breakdown,
        });
      };

      // Process all issues
      issuesResponse.data.forEach((item) => {
        // Only process closed or merged issues
        if (item.state === 'closed' && !item.pull_request) {
          processContributor(item, 'Issue');
        }
      });

      // Process all pull requests
      pullRequestsResponse.data.forEach((item) => {
        // Only process merged pull requests
        if (item.merged_at) {
          processContributor(item, 'Pull Request');
        }
      });

      // Sort contributors by points
      const sortedContributors = Object.values(contributors)
        .sort((a, b) => b.points - a.points);

      // Save contributors to Airtable
      for (const contributor of sortedContributors) {
        const leaderboardData = {
          Username: contributor.username,
          Points: contributor.points,
          ContributionType: contributor.details.map((d) => d.type).join(', '),
          ContributionID: contributor.details.map((d) => d.url).join(', '),
          Date: new Date().toISOString(),
          Description: JSON.stringify(contributor.details),
          UserType: userType === 'external' ? 'External' : 'Internal',
        };
        await this.saveToAirtableOnce(leaderboardData);
      }

      // Prepare response data
      const responseData = {
        leaderboard: sortedContributors,
        totalItems: sortedContributors.length,
        metadata: { 
          userType, 
          fetchedAt: new Date().toISOString(),
          totalContributors: Object.keys(contributors).length 
        },
      };

      // Cache the response
      await this.redisClient.set(
        cacheKey, 
        JSON.stringify(responseData), 
        'EX', 
        this.CACHE_EXPIRATION
      );

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching all-time repo data:', error);
      res.status(500).json({ error: 'Failed to fetch all-time repository data' });
    }
  }

  // Static method for calculating points
  static calculatePoints(item, isEligibleForFirstTimeBonus) {
    const breakdown = {
      base: this.pointSystem.basePoints,
      difficultyBonus: 0,
      specialBonus: 0,
      firstTimeBonus: 0,
    };

    let totalPoints = breakdown.base;

    const difficultyLabel = item.labels.find((label) =>
      ['easy', 'medium', 'hard'].includes(label.name.toLowerCase())
    );
    if (difficultyLabel) {
      breakdown.difficultyBonus = this.pointSystem.labelPoints[difficultyLabel.name.toLowerCase()];
      totalPoints += breakdown.difficultyBonus;
    }

    item.labels.forEach((label) => {
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

    return { total: totalPoints, breakdown };
  }

  static async updateUserPoints(req, res) {
    try {
      const { username } = req.params;
      const { 
        pointsToAdd = 0, 
        reason = '',
        contributionDetails = {}
      } = req.body;

      // Validate input
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Find existing record for the user
      const existingRecords = await leaderboardTable
        .select({
          filterByFormula: `LOWER({Username}) = LOWER("${username}")`,
          maxRecords: 1
        })
        .firstPage();

      if (existingRecords.length === 0) {
        return res.status(404).json({ error: 'No records found for this user' });
      }

      const userRecord = existingRecords[0];
      const currentPoints = parseFloat(userRecord.get('Points') || 0);
      const adjustedPoints = currentPoints + pointsToAdd;

      try {
        // Update points in Airtable
        await leaderboardTable.update(userRecord.id, {
          'Points': adjustedPoints,
          'LastPointUpdate': new Date().toISOString(),
          'PointUpdateReason': reason
        });

        // Update Redis cache
        const cacheKey = `${this.CACHE_KEY_PREFIX}user:${username}:points`;
        await this.redisClient.set(
          cacheKey, 
          JSON.stringify({
            points: adjustedPoints,
            lastUpdated: new Date().toISOString(),
            reason: reason,
            details: contributionDetails
          }),
          'EX', 
          this.CACHE_EXPIRATION
        );

        // Optional: Log point update event (you might want to implement a separate logging mechanism)
        console.log(`Points updated for ${username}: +${pointsToAdd}, New Total: ${adjustedPoints}`);

        res.status(200).json({
          message: 'Points updated successfully',
          newPoints: adjustedPoints,
          oldPoints: currentPoints,
          username: username,
          updatedAt: new Date().toISOString(),
          reason: reason
        });

      } catch (updateError) {
        console.error('Error updating points in Airtable or Redis:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update points in database', 
          details: updateError.message 
        });
      }

    } catch (error) {
      console.error('Error in point update process:', error);
      res.status(500).json({ 
        error: 'Failed to process point update', 
        details: error.message 
      });
    }
  }

  // Enhanced updateUserType method
  static async updateUserType(req, res) {
    try {
      const { username } = req.params;
      const { userType } = req.body;

      // Validate input
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Find existing record for the user
      const existingRecords = await leaderboardTable
        .select({
          filterByFormula: `LOWER({Username}) = LOWER("${username}")`,
          maxRecords: 1
        })
        .firstPage();

      if (existingRecords.length === 0) {
        return res.status(404).json({ error: 'No records found for this user' });
      }

      const userRecord = existingRecords[0];
      const currentUserType = userRecord.get('UserType');

      // Determine new user type
      let newUserType;
      if (userType) {
        // If specific user type is provided, use it
        newUserType = ['Internal', 'External'].includes(userType)
          ? userType
          : currentUserType;
      } else {
        // Default to toggling if no specific type is provided
        newUserType = currentUserType === 'Internal' ? 'External' : 'Internal';
      }

      try {
        // Update user type in Airtable
        await leaderboardTable.update(userRecord.id, {
          'UserType': newUserType,
        });

        // Update Redis cache
        const cacheKey = `${LeaderboardController.CACHE_KEY_PREFIX}user:${username}:type`;
        await LeaderboardController.redisClient.set(
          cacheKey, 
          JSON.stringify({
            userType: newUserType,
          }),
          'EX', 
          LeaderboardController.CACHE_EXPIRATION
        );

        // Optional: Log user type change
        console.log(`User type updated for ${username}: ${currentUserType} → ${newUserType}`);

        res.status(200).json({
          message: 'User type updated successfully',
          username: username,
          oldUserType: currentUserType,
          newUserType: newUserType,
          updatedAt: new Date().toISOString()
        });

      } catch (updateError) {
        console.error('Error updating user type in Airtable or Redis:', updateError);
        return res.status(500).json({ 
          error: 'Failed to update user type in database', 
          details: updateError.message 
        });
      }

    } catch (error) {
      console.error('Error in user type update process:', error);
      res.status(500).json({ 
        error: 'Failed to process user type update', 
        details: error.message 
      });
    }
  }
}

module.exports = LeaderboardController;