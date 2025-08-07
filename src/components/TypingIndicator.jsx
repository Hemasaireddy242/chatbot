import React from 'react'
import { Bot } from 'lucide-react'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start chat-message">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        
        <div className="px-4 py-3 bg-gray-700 border border-purple-500/20 rounded-2xl shadow-lg">
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator 