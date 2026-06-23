import { useState } from 'react'
import axios from 'axios'
import MessageList from './components/MessageList'
import ChatInput from './components/ChatInput'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Tell me your start location, destination, and battery percentage — I will plan your EV route.' }
  ])

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { role: 'user', text }])

    try {
      const response = await axios.post('http://localhost:5000/api/plan-route', {
        startLocation: text,  
        destination: 'TBD',
        batteryPercent: 50
      })

      setMessages((prev) => [...prev, { role: 'ai', text: response.data.recommendation }])
    } catch (error) {
      console.error('Error calling backend:', error)
      setMessages((prev) => [...prev, { role: 'ai', text: 'Something went wrong. Please try again.' }])
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
        <p>Map coming soon...</p>
      </div>
    </div>
  )
}

export default App