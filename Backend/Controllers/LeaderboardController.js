const cron = require('cron');
const axios = require('axios');
const dotenv = require('dotenv');
const Redis = require('ioredis');
const { leaderboardTable } = require('../config/airtableConfig');
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
  static CACHE_KEY_PREFIX = 'HyperSwitch :';
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

      // Helper function to process contributors with user type filtering
      const processContributor = async (item, type) => {
        // Check for valid user
        const username = item.user?.login;
        if (!username) return;

        // Check user type before processing
        const userTypeRecords = await leaderboardTable
          .select({
            filterByFormula: `LOWER({Username}) = LOWER("${username}")`,
            fields: ['Username', 'UserType']
          })
          .firstPage();

        // Determine user type
        const normalizedUserType = userType === 'external' ? 'External' : 'Internal';
        const userTypeFromRecord = userTypeRecords.length > 0 
          ? userTypeRecords[0].get('UserType') 
          : normalizedUserType;

        // Skip if user type doesn't match
        if (userTypeFromRecord !== normalizedUserType) {
          return;
        }

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

      // Process all issues with type filtering
      for (const item of issuesResponse.data) {
        // Only process closed or merged issues
        if (item.state === 'closed' && !item.pull_request) {
          await processContributor(item, 'Issue');
        }
      }

      // Process all pull requests with type filtering
      for (const item of pullRequestsResponse.data) {
        // Only process merged pull requests
        if (item.merged_at) {
          await processContributor(item, 'Pull Request');
        }
      }

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
          totalContributors: sortedContributors.length 
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

  // New method to filter contributors by user type from Airtable
  static filterContributorsByUserType = async (contributors, requestedUserType) => {
    // Normalize user type
    const normalizedUserType = requestedUserType === 'external' ? 'External' : 'Internal';

    // Fetch user types from Airtable
    const userTypeRecords = await leaderboardTable
      .select({
        fields: ['Username', 'UserType']
      })
      .all();

    // Create a map of usernames to their types
    const userTypeMap = new Map();
    userTypeRecords.forEach(record => {
      userTypeMap.set(
        record.get('Username'), 
        record.get('UserType')
      );
    });

    // Filter contributors based on user type
    return contributors.filter(contributor => {
      // If no record exists, default to the requested user type
      const userType = userTypeMap.get(contributor.username) || normalizedUserType;
      return userType === normalizedUserType;
    });
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

    // Enhanced method to update Redis cache
    static updateUserCache = async (username, additionalData = {}) => {
      try {
        // Fetch the most recent user record from Airtable
        const existingRecords = await leaderboardTable
          .select({
            filterByFormula: `LOWER({Username}) = LOWER("${username}")`,
            maxRecords: 1
          })
          .firstPage();
  
        if (existingRecords.length === 0) {
          console.error(`No record found for username: ${username}`);
          return null;
        }
  
        const userRecord = existingRecords[0];
        
        // Prepare cache data
        const cacheData = {
          username: userRecord.get('Username'),
          points: parseFloat(userRecord.get('Points') || 0),
          userType: userRecord.get('UserType'),
          contributionDetails: userRecord.get('Description') 
            ? JSON.parse(userRecord.get('Description')) 
            : [],
          lastUpdated: new Date().toISOString(),
          ...additionalData
        };
  
        // Create cache keys
        const pointsCacheKey = `${this.CACHE_KEY_PREFIX}user:${username}:points`;
        const typeCacheKey = `${this.CACHE_KEY_PREFIX}user:${username}:type`;
        const detailsCacheKey = `${this.CACHE_KEY_PREFIX}user:${username}:details`;
  
        // Update multiple cache entries
        await Promise.all([
          this.redisClient.set(
            pointsCacheKey, 
            JSON.stringify({ points: cacheData.points }),
            'EX', 
            this.CACHE_EXPIRATION
          ),
          this.redisClient.set(
            typeCacheKey, 
            JSON.stringify({ userType: cacheData.userType }),
            'EX', 
            this.CACHE_EXPIRATION
          ),
          this.redisClient.set(
            detailsCacheKey, 
            JSON.stringify(cacheData),
            'EX', 
            this.CACHE_EXPIRATION
          )
        ]);
  
        return cacheData;
      } catch (error) {
        console.error('Error updating user cache:', error);
        return null;
      }
    }
  
    // Use arrow function for all methods to ensure correct 'this' binding
    static updateUserPoints = async (req, res) => {
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
          // Retrieve existing contribution details
          let existingDetails = userRecord.get('Description') 
            ? JSON.parse(userRecord.get('Description')) 
            : [];
  
          // Add new contribution details
          if (Object.keys(contributionDetails).length > 0) {
            existingDetails.push({
              ...contributionDetails,
              pointsAdded: pointsToAdd,
              addedAt: new Date().toISOString()
            });
          }
  
          // Update points in Airtable
          await leaderboardTable.update(userRecord.id, {
            'Points': adjustedPoints,
            'Description': JSON.stringify(existingDetails)
          });
  
          // Update Redis cache
          const updatedUserData = await this.updateUserCache(username, {
            pointsAdded: pointsToAdd,
            reason: reason
          });
  
          res.status(200).json({
            message: 'Points updated successfully',
            userData: updatedUserData,
            newPoints: adjustedPoints,
            oldPoints: currentPoints,
            username: username,
            updatedAt: new Date().toISOString(),
            reason: reason
          });
  
        } catch (updateError) {
          console.error('Error updating points in Airtable:', updateError);
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
  
    // Also use arrow function for updateUserType
    static updateUserType = async (req, res) => {
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
          const updatedUserData = await this.updateUserCache(username, {
            typeChanged: true
          });
  
          res.status(200).json({
            message: 'User type updated successfully',
            userData: updatedUserData,
            username: username,
            oldUserType: currentUserType,
            newUserType: newUserType,
            updatedAt: new Date().toISOString()
          });
  
        } catch (updateError) {
          console.error('Error updating user type in Airtable:', updateError);
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