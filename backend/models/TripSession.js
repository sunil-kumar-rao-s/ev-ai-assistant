const mongoose = require('mongoose')

const tripSessionSchema = new mongoose.Schema({
  startLocation: { type: String, required: true },
  destination: { type: String, required: true },
  batteryPercent: { type: Number, required: true },
  aiRecommendation: { type: String },
  recommendedStations: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('TripSession', tripSessionSchema)