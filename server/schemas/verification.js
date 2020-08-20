const mongoose = require("mongoose");

mongoose.set("useCreateIndex", true);

// verification codes last for 1 hour
const VerificationSchema = new mongoose.Schema({
  link: { type: String, required: true, unique: true},
  user_id: {type: mongoose.Types.ObjectId, required: true, unique: true},
  createdAt: { type: Date, expires: 3600, default: Date.now }
});

module.exports = mongoose.model('Verification', VerificationSchema);