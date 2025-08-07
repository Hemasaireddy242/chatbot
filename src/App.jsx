import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Trash2, Save, History, Brain } from 'lucide-react'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your STUDY-ONLY AI assistant. I can ONLY help with EDUCATION and HEALTHCARE topics. For all other questions, I will ask you to study first. How can I assist you with your educational or healthcare studies today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userId, setUserId] = useState('default')
  const [userData, setUserData] = useState({})
  const [conversationLength, setConversationLength] = useState(0)
  const [showMemoryInfo, setShowMemoryInfo] = useState(false)
  const messagesEndRef = useRef(null)

  // Your Gemini API key
  const API_KEY = 'AIzaSyDLRbJZpt3AvuXphjrrzSaaRAWJJfZp788'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation history on component mount
  useEffect(() => {
    loadConversationHistory()
    loadUserData()
  }, [userId])

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/conversation/${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.conversation && data.conversation.length > 0) {
          // Convert conversation history to message format
          const historyMessages = data.conversation.map((msg, index) => ({
            id: index + 1,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.timestamp)
          }))
          setMessages(historyMessages)
          setConversationLength(data.messageCount)
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
    }
  }

  const loadUserData = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/user-data/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data.data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const storeUserData = async (data) => {
    try {
      const response = await fetch('http://localhost:3002/api/store-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          data
        })
      })
      if (response.ok) {
        const result = await response.json()
        setUserData(result.storedData)
        return result
      }
    } catch (error) {
      console.error('Error storing user data:', error)
    }
  }

  const clearConversation = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/conversation/${userId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setMessages([
          {
            id: 1,
            text: "Conversation history cleared! I'm ready for a fresh start. How can I help you?",
            sender: 'bot',
            timestamp: new Date()
          }
        ])
        setConversationLength(0)
      }
    } catch (error) {
      console.error('Error clearing conversation:', error)
    }
  }

  const generateBotResponse = async (userMessage) => {
    try {
      setIsTyping(true)
      
      console.log('Sending request to backend with message:', userMessage)
      
      const response = await fetch('http://localhost:3002/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          apiKey: API_KEY,
          userId
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      console.log('Backend response received (length):', data.response.length, 'characters')
      setConversationLength(data.conversationLength)
      
      setIsTyping(false)
      
      return {
        id: Date.now(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      }
    } catch (error) {
      console.error('API Error:', error)
      setIsTyping(false)
      
      let errorMessage = "Sorry, I'm having trouble responding right now. Please try again."
      
      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = "Invalid API key. Please check the API key configuration."
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        errorMessage = "API quota exceeded. Please check your Gemini API usage limits."
      } else if (error.message.includes('BLOCKED')) {
        errorMessage = "This request was blocked. Please try a different message."
      } else if (error.message.includes('SAFETY')) {
        errorMessage = "This request was blocked for safety reasons. Please try a different message."
      } else if (error.message.includes('fetch')) {
        errorMessage = "Cannot connect to server. Please make sure the backend server is running on port 3002."
      }
      
      return {
        id: Date.now(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    const botResponse = await generateBotResponse(inputValue)
    setMessages(prev => [...prev, botResponse])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStoreData = async () => {
    const dataToStore = prompt('Enter information you want me to remember (e.g., "My name is John, I like programming"):')
    if (dataToStore) {
      const result = await storeUserData({ personalInfo: dataToStore })
      if (result) {
        alert('Information stored successfully! I will remember this in our future conversations.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[600px] bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-purple-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Study-Only AI Assistant</h1>
              <p className="text-purple-100 text-sm">Education & Healthcare Only</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <button
                onClick={() => setShowMemoryInfo(!showMemoryInfo)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Memory Info"
              >
                <Brain className="w-4 h-4" />
              </button>
              <button
                onClick={handleStoreData}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Store Information"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={clearConversation}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">Memory</span>
              </div>
            </div>
          </div>
          
          {/* Memory Info Panel */}
          {showMemoryInfo && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span>Conversation Length: {conversationLength} messages</span>
                <span>User ID: {userId}</span>
              </div>
              {Object.keys(userData).length > 0 && (
                <div className="mt-2 text-xs">
                  <span>Stored Info: {Object.keys(userData).length} items</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-800">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/20 p-6 bg-gray-800">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask education or healthcare questions only... (Study first for other topics!)"
                className="w-full px-4 py-3 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-gray-700 text-white placeholder-gray-400"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 