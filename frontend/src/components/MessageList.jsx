function MessageList({ messages }) {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          {msg.text === '...' ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <span className="message-text">{msg.text}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default MessageList