const mongoose = require("mongoose");

const user = new mongoose.Schema({
  name:{
    type: String,
    required:true
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: Boolean,
    default: false
  },
});

user.index({ username: 1 });

module.exports = mongoose.model("user", user);
