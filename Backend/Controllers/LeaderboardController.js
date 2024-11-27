const axios = require('axios');
const dotenv = require('dotenv');
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

  static async saveToAirtableOnce(data) {
    try {
      // Escape single quotes in formula values
      const escapedUsername = data.Username.replace(/'/g, "\\'");
      const escapedContributionID = data.ContributionID.replace(/'/g, "\\'");

      // Construct a valid filter formula
      const filterFormula = `AND({Username} = '${escapedUsername}', {ContributionID} = '${escapedContributionID}')`;

      // Check if the record already exists
      const existingRecords = await leaderboardTable
        .select({
          filterByFormula: filterFormula,
        })
        .firstPage();

      if (existingRecords.length > 0) {
        return; 
      }

      // Save the new record
      await leaderboardTable.create([
        {
          fields: data,
        },
      ]);
    } catch (error) {
      console.error('Error saving data to Airtable:', error);
    }
  }

  static async fetchRepoData(req, res) {
    const { owner, repo, userType } = req.params;
    const { sort = 'points_desc', type = 'all', from, to } = req.query;

    try {
      let startDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let endDate = to ? new Date(to) : new Date();

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
        return res.status(400).json({ error: 'Invalid date parameters' });
      }

      const historicalContributorsResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          params: {
            state: 'all',
            until: startDate.toISOString(),
          },
          headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
        }
      );

      const historicalContributors = new Set(
        historicalContributorsResponse.data.map((item) => item.user.login)
      );

      const issuesResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          params: {
            state: 'all',
            since: startDate.toISOString(),
          },
          headers: { Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}` },
        }
      );

      const contributors = {};
      const firstTimeContributorBonusGiven = new Set();

      for (const item of issuesResponse.data.filter(
        (issue) => new Date(issue.created_at) <= endDate
      )) {
        const username = item.user.login;

        if (!contributors[username]) {
          const isFirstTimeContributor = !historicalContributors.has(username);
          contributors[username] = {
            username,
            points: 0,
            contributions: 0,
            details: [],
            isFirstTime: isFirstTimeContributor,
          };
        }

        const pointsData = LeaderboardController.calculatePoints(
          item,
          contributors[username].isFirstTime && !firstTimeContributorBonusGiven.has(username)
        );

        if (pointsData.breakdown.firstTimeBonus > 0) {
          firstTimeContributorBonusGiven.add(username);
        }

        contributors[username].points += pointsData.total;
        contributors[username].contributions++;
        contributors[username].details.push({
          type: item.pull_request ? 'Pull Request' : 'Issue',
          title: item.title,
          url: item.html_url,
          createdAt: item.created_at,
          labels: item.labels.map((label) => label.name),
          pointsEarned: pointsData.total,
          pointBreakdown: pointsData.breakdown,
        });
      }

      const sortedContributors = Object.values(contributors).sort((a, b) => b.points - a.points);

      // Save leaderboard data to Airtable only once per user
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
        await LeaderboardController.saveToAirtableOnce(leaderboardData);
      }

      res.json({
        leaderboard: sortedContributors,
        totalItems: sortedContributors.length,
        metadata: { 
          dateRange: { from: startDate, to: endDate },
          userType: userType
        },
      });
    } catch (error) {
      console.error('Error fetching repo data:', error);
      res.status(500).json({ error: 'Failed to fetch repository data' });
    }
  }

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
            // Update only the Points field in the existing record
            await leaderboardTable.update(userRecord.id, {
                'Points': adjustedPoints
            });
        } catch (updateError) {
            console.error('Error updating points in Airtable:', updateError);
            return res.status(500).json({ 
                error: 'Failed to update points in database', 
                details: updateError.message 
            });
        }

        res.status(200).json({
            message: 'Points updated successfully',
            newPoints: adjustedPoints,
            oldPoints: currentPoints,
            username: username
        });

    } catch (error) {
        console.error('Error in point update process:', error);
        res.status(500).json({ 
            error: 'Failed to process point update', 
            details: error.message 
        });
    }
  }

  static async updateUserType(req, res) {
    try {
        const { username } = req.params;

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

        // Toggle between Internal and External
        const newUserType = currentUserType === 'Internal' ? 'External' : 'Internal';

        try {
            // Update the UserType field in the existing record
            await leaderboardTable.update(userRecord.id, {
                'UserType': newUserType
            });
        } catch (updateError) {
            console.error('Error updating user type in Airtable:', updateError);
            return res.status(500).json({ 
                error: 'Failed to update user type in database', 
                details: updateError.message 
            });
        }

        res.status(200).json({
            message: 'User type toggled successfully',
            username: username,
            oldUserType: currentUserType,
            newUserType: newUserType
        });

    } catch (error) {
        console.error('Error in user type toggle process:', error);
        res.status(500).json({ 
            error: 'Failed to process user type toggle', 
            details: error.message 
        });
    }
  }
}

module.exports = LeaderboardController;