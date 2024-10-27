const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const contributorsTable = base(process.env.AIRTABLE_CONTRIBUTORS_TABLE);
const leaderboardTable = base(process.env.AIRTABLE_LEADERBOARD_TABLE);

module.exports = {
    contributorsTable,
    leaderboardTable
};