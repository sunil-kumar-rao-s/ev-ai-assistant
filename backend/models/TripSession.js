const mongoose = require('mongoose')

const tripSessionSchema = new mongoose.Schema({
  userMessage: { type: String, required: true },
  aiRecommendation: { type: String },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('TripSession', tripSessionSchema)