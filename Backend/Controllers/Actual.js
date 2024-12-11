const cron = require('cron');
const axios = require('axios');
const dotenv = require('dotenv');
const Redis = require('ioredis');
const Airtable = require('airtable');

dotenv.config();

class LeaderboardController {
  // Static configuration for point system
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

  // Airtable initialization
  static base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);
  
  // Leaderboard table reference
  static leaderboardTable = this.base('Leaderboard'); // Replace with your actual table name

  // Constructor to allow instance creation with dependencies
  constructor(
    redisClient = LeaderboardController.redisClient, 
    leaderboardTable = LeaderboardController.leaderboardTable
  ) {
    this.redisClient = redisClient;
    this.leaderboardTable = leaderboardTable;
  }

  // Helper method to calculate points
  calculatePoints(item, isFirstTime) {
    let total = this.constructor.pointSystem.basePoints;
    const breakdown = { basePoints: total };

    // Add points based on difficulty labels
    const difficultyLabel = item.labels.find(label => 
      ['easy', 'medium', 'hard'].includes(label.name)
    );
    if (difficultyLabel) {
      const labelPoints = this.constructor.pointSystem.labelPoints[difficultyLabel.name];
      total += labelPoints;
      breakdown.difficultyPoints = labelPoints;
    }

    // Add points for special labels
    const specialLabel = item.labels.find(label => 
      Object.keys(this.constructor.pointSystem.specialLabels).includes(label.name)
    );
    if (specialLabel) {
      const specialPoints = this.constructor.pointSystem.specialLabels[specialLabel.name];
      total += specialPoints;
      breakdown.specialLabelPoints = specialPoints;
    }

    // First-time contributor bonus
    if (isFirstTime) {
      total += this.constructor.pointSystem.firstTimeContributorBonus;
      breakdown.firstTimeBonus = this.constructor.pointSystem.firstTimeContributorBonus;
    }

    return { total, breakdown };
  }

  static async saveRepositoryToAirtable(owner, repo) {
    try {
      // Create an instance to use instance methods
      const controllerInstance = new LeaderboardController();
      
      // Fetch both issues and pull requests
      const [issuesResponse, pullRequestsResponse] = await Promise.all([
        axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          params: { state: 'all', per_page: 100 },
          headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
        }),
        axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
          params: { state: 'all', per_page: 100 },
          headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
        }),
      ]);
  
      // Combine and deduplicate contributors
      const contributors = {};
      const allContributors = new Set();
  
      // Helper function to process contributors
      const processContributor = (item, type) => {
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
        const pointsData = controllerInstance.calculatePoints(item, contributors[username].isFirstTime);
  
        // Update contributor details
        contributors[username].points += pointsData.total;
        contributors[username].contributions++;
        contributors[username].details.push({
          type,
          title: item.title,
          url: item.html_url,
          createdAt: item.created_at,
          labels: item.labels.map((label) => label.name),
          pointsEarned: pointsData.total,
          pointBreakdown: pointsData.breakdown,
        });
      };
  
      // Process issues
      for (const item of issuesResponse.data) {
        if (item.state === 'closed' && !item.pull_request) {
          processContributor(item, 'Issue');
        }
      }
  
      // Process pull requests
      for (const item of pullRequestsResponse.data) {
        if (item.merged_at) {
          processContributor(item, 'Pull Request');
        }
      }
  
      // Sort contributors by points
      const sortedContributors = Object.values(contributors).sort((a, b) => b.points - a.points);
  
      // Save contributors to Airtable
      for (const contributor of sortedContributors) {
        const leaderboardData = {
          Username: contributor.username,
          Points: contributor.points,
          ContributionType: contributor.details.map((d) => d.type).join(', '),
          ContributionID: contributor.details.map((d) => d.url).join(', '),
          Date: new Date().toISOString(),
          Description: JSON.stringify(contributor.details),
          UserType: 'External', 
        };
  
        try {
          // Escape single quotes in username and contribution ID
          const escapedUsername = leaderboardData.Username.replace(/'/g, "\\'");
          const escapedContributionID = leaderboardData.ContributionID.replace(/'/g, "\\'");
          
          // Create filter formula
          const filterByFormula = `AND({Username} = '${escapedUsername}', {ContributionID} = '${escapedContributionID}')`;
  
          // Check for existing records
          const existingRecords = await new Promise((resolve, reject) => {
            controllerInstance.leaderboardTable
              .select({ filterByFormula })
              .firstPage((err, records) => {
                if (err) reject(err);
                else resolve(records);
              });
          });
  
          // If record already exists, skip
          if (existingRecords.length > 0) {
            console.log(`Skipping duplicate record for ${leaderboardData.Username}`);
            continue;
          }
  
          // Create new record
          await new Promise((resolve, reject) => {
            controllerInstance.leaderboardTable.create(
              [{ fields: leaderboardData }],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
  
          console.log(`Created record for ${leaderboardData.Username}`);
        } catch (airtableError) {
          console.error(`Airtable error for ${leaderboardData.Username}:`, airtableError);
        }
      }
  
      console.log(`Completed processing repository ${owner}/${repo}`);
    } catch (error) {
      console.error(`Error saving repository ${owner}/${repo} to Airtable:`, error);
      throw error;
    }
  }
  
  // Method to setup daily sync for multiple repositories
  setupDailyRepositorySync(repositories) {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
      console.log('Starting daily GitHub repository sync...');
      
      for (const { owner, repo } of repositories) {
        try {
          await LeaderboardController.saveRepositoryToAirtable(owner, repo);
        } catch (error) {
          console.error(`Failed to sync repository ${owner}/${repo}:`, error);
        }
      }
      
      console.log('Daily GitHub repository sync completed.');
    });
  }

  // Static method for manual trigger
  static async saveToAirtable(req, res) {
    const { owner, repo } = req.params;

    try {
      await LeaderboardController.saveRepositoryToAirtable(owner, repo);
      res.json({ message: 'Repository data saved to Airtable successfully' });
    } catch (error) {
      console.error('Error saving repository data to Airtable:', error);
      res.status(500).json({ error: 'Failed to save repository data to Airtable' });
    }
  }

  static async fetchLeaderboardData(req, res) {
    const { userType } = req.params;

    try {
      const leaderboardController = new LeaderboardController();
      const leaderboardData = await leaderboardController.getLeaderboardData(userType);
      res.json(leaderboardData);
    } 
    catch (error) {
      console.error(`Error fetching ${userType} leaderboard data:`, error);
      res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
  }

  async fetchLeaderboardData(userType) {
    try {
      // Fetch all records from Airtable
      const records = await this.leaderboardTable
        .select({
          filterByFormula: `{UserType} = '${userType}'`,
          sort: [{ field: 'Points', direction: 'desc' }]
        })
        .all();

      // Transform records
      const leaderboardData = records.map(record => ({
        username: record.get('Username'),
        points: record.get('Points'),
        contributionType: record.get('ContributionType'),
        contributionId: record.get('ContributionID'),
        date: record.get('Date'),
        description: JSON.parse(record.get('Description') || '[]')
      }));

      // Store in Redis with an expiration (e.g., 24 hours)
      const redisKey = `leaderboard:${userType}`;
      await this.redisClient.set(
        redisKey, 
        JSON.stringify(leaderboardData), 
        'EX', 
        24 * 60 * 60 // 24 hours in seconds
      );

      return leaderboardData;
    } catch (error) {
      console.error(`Error fetching ${userType} leaderboard data:`, error);
      throw error;
    }
  }

  async getLeaderboardData(userType) {
    try {
      const redisKey = `leaderboard:${userType}`;
      
      // Try to get data from Redis first
      const cachedData = await this.redisClient.get(redisKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      // If no cached data, fetch from Airtable
      return await this.fetchLeaderboardData(userType);
    } catch (error) {
      console.error(`Error retrieving ${userType} leaderboard data:`, error);
      throw error;
    }
  }

  async refreshLeaderboardData(userType) {
    try {
      return await this.fetchLeaderboardData(userType);
    } catch (error) {
      console.error(`Error refreshing ${userType} leaderboard data:`, error);
      throw error;
    }
  }
  // Enhanced method to update Redis cache
  

  // Static method to update user points
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
      const existingRecords = await this.leaderboardTable
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
        await this.leaderboardTable.update(userRecord.id, {
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

  // Static method to update user type
  static async updateUserType(req, res) {
    try {
      const { username } = req.params;
      const { userType } = req.body;

      // Validate input
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Ensure we're using the class's static methods and properties
      const leaderboardTable = LeaderboardController.leaderboardTable;
      
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
        // Use LeaderboardController to ensure static method context
        const updatedUserData = await LeaderboardController.updateUserCache(username, {
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

  // Static method to update user cache with bound context
  static async updateUserCache(username, additionalData = {}) {
    try {
      // Ensure we're using the class's static methods and properties
      const leaderboardTable = this.leaderboardTable || LeaderboardController.leaderboardTable;
      const redisClient = this.redisClient || LeaderboardController.redisClient;

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
      const pointsCacheKey = `leaderboard:user:${username}:points`;
      const typeCacheKey = `leaderboard:user:${username}:type`;
      const detailsCacheKey = `leaderboard:user:${username}:details`;

      // Update multiple cache entries
      await Promise.all([
        redisClient.set(
          pointsCacheKey, 
          JSON.stringify({ points: cacheData.points }),
          'EX', 
          24 * 60 * 60 // 24 hours expiration
        ),
        redisClient.set(
          typeCacheKey, 
          JSON.stringify({ userType: cacheData.userType }),
          'EX', 
          24 * 60 * 60 // 24 hours expiration
        ),
        redisClient.set(
          detailsCacheKey, 
          JSON.stringify(cacheData),
          'EX', 
          24 * 60 * 60 // 24 hours expiration
        )
      ]);

      return cacheData;
    } catch (error) {
      console.error('Error updating user cache:', error);
      return null;
    }
  }
}

// const repositories = [
//   { owner: 'juspay', repo: 'hyperswitch' },
// ];
// const dataSync = new LeaderboardController();
// dataSync.setupDailyRepositorySync(repositories);

module.exports = LeaderboardController;