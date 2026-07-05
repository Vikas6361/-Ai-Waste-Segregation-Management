const mongoose = require('mongoose');

const classificationSchema = new mongoose.Schema({
  username: { type: String, required: true },
  wasteType: { type: String, required: true },
  confidence: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Classification', classificationSchema);
