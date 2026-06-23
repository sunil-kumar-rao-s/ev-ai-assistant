const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/plan-route', (req, res) => {
  const { startLocation, destination, batteryPercent } = req.body

 //ai goes here, soon
  res.json({
    recommendation: `Test response for trip from ${startLocation} to ${destination} with ${batteryPercent}% battery`
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})