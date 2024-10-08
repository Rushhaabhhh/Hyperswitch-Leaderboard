const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  githubid: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
