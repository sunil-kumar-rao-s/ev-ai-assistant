import { useState } from 'react'

function ChatInput({ onSend }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() === '') return
    onSend(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. I'm in Koramangala with 30% battery, need to reach Whitefield"
      />
      <button type="submit">Send</button>
    </form>
  )
}

export default ChatInput