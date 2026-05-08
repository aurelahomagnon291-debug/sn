const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["SUCCESS", "FAILED"],
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
