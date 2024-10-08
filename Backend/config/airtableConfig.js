const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const table = base('tblPd0nIOKVjM1fJh'); 

module.exports = table;
