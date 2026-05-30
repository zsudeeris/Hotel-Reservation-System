import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import * as api from '../services/api.js'

const SUGGESTIONS = ['Find hotels in Kyrenia', 'Best beachfront hotels', 'Hotels with casino', 'Family-friendly resorts', 'Luxury spa hotels']

const INITIAL_MESSAGES = [
  { role: 'bot', text: 'Hello! I\'m your hotel assistant. I can help you find the perfect hotel in Northern Cyprus. How can I help you today?' }
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const msgsRef = useRef()

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const data = await api.sendChatMessage(text)
      const reply = data.reply || data.message || data.response || 'I can help you find great hotels in Northern Cyprus!'
      setMessages(prev => [...prev, { role: 'bot', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {!open && (
        <button className="chat-fab" onClick={() => setOpen(true)} title="Chat with AI assistant">
          <MessageCircle style={{ width: 24, height: 24 }} />
        </button>
      )}
      {open && (
        <div className="chatbot-panel open">
          <div className="chat-head">
            <div className="chat-head-avatar">
              <Bot />
            </div>
            <div>
              <div className="chat-head-name">Hotel Assistant</div>
              <div className="chat-head-status">Online · AI-powered</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div className="chat-msgs" ref={msgsRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && <div className="chat-msg bot">Typing...</div>}
          </div>

          <div className="chat-sugs">
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button key={i} className="chat-sug" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send" onClick={() => sendMessage(input)}>
              <Send />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
