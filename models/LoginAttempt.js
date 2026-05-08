const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  ip_address: {
    type: String,
    default: "unknown",
  },
  attempted_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
