import { useState } from 'react'
import axios from 'axios'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import MapView from './components/MapView'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Tell me your start location, destination, and battery percentage — I will plan your EV route.' }
  ])
  const [stations, setStations] = useState([])

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { role: 'user', text }])
    setMessages((prev) => [...prev, { role: 'ai', text: '...' }])

    try {
      const response = await axios.post('http://localhost:5000/api/plan-route', {
        userMessage: text
      })

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'ai',
          text: response.data.recommendation
        }
        return updated
      })

      if (response.data.stations && response.data.stations.length > 0) {
        setStations(response.data.stations)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'ai',
          text: 'Something went wrong. Please try again.'
        }
        return updated
      })
    }
  }

  return (
    <div className="app-container">
      <div className="chat-panel">
        <h2>EV AI Assistant</h2>
        <MessageList messages={messages} />
        <ChatInput onSend={handleSend} />
      </div>
      <div className="map-panel">
        <MapView stations={stations} />
      </div>
    </div>
  )
}

export default App