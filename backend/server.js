const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config()

const TripSession = require('./models/TripSession')

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/plan-route', async (req, res) => {
  try {
    const { startLocation, destination, batteryPercent } = req.body

    const dummyRecommendation = `Test response for trip from ${startLocation} to ${destination} with ${batteryPercent}% battery`

    const session = await TripSession.create({
      startLocation,
      destination,
      batteryPercent,
      aiRecommendation: dummyRecommendation
    })

    res.json({
      sessionId: session._id,
      recommendation: dummyRecommendation
    })
  } catch (error) {
    console.error('Error in plan-route:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await TripSession.find().sort({ createdAt: -1 })
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch sessions' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})