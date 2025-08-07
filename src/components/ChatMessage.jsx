import React from 'react'
import { Bot, User } from 'lucide-react'

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot'
  
  // Function to format text with better line breaks and formatting
  const formatMessage = (text) => {
    // Split by double line breaks to preserve paragraphs
    const paragraphs = text.split('\n\n')
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-3 last:mb-0 leading-relaxed">
        {paragraph.trim()}
      </p>
    ))
  }
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} chat-message`}>
      <div className={`flex items-start space-x-3 max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot 
            ? 'bg-purple-100 text-purple-600' 
            : 'bg-purple-600 text-white'
        }`}>
          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isBot 
              ? 'bg-gray-700 border border-purple-500/20 text-gray-100 shadow-lg' 
              : 'bg-purple-600 text-white'
          }`}>
            <div className="text-sm">
              {formatMessage(message.text)}
            </div>
          </div>
          
          <div className={`text-xs text-gray-400 mt-1 ${isBot ? 'ml-4' : 'mr-4'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage 