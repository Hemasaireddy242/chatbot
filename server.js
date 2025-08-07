import express from 'express'
import cors from 'cors'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const app = express()
const PORT = 3002

app.use(cors())
app.use(express.json())

// In-memory storage for conversations (in production, use a database)
let conversations = {}
let userData = {}

// File paths for persistent storage
const conversationsFile = './data/conversations.json'
const userDataFile = './data/userData.json'

// Ensure data directory exists
const dataDir = './data'
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Load existing data from files
function loadData() {
  try {
    if (fs.existsSync(conversationsFile)) {
      conversations = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'))
    }
    if (fs.existsSync(userDataFile)) {
      userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'))
    }
    console.log('Data loaded successfully')
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// Save data to files
function saveData() {
  try {
    fs.writeFileSync(conversationsFile, JSON.stringify(conversations, null, 2))
    fs.writeFileSync(userDataFile, JSON.stringify(userData, null, 2))
    console.log('Data saved successfully')
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

// Load data on startup
loadData()

app.post('/api/chat', async (req, res) => {
  try {
    const { message, apiKey, userId = 'default' } = req.body
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' })
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }
    
    console.log('Received request:', { message, userId, apiKey: apiKey.substring(0, 10) + '...' })
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    console.log('Sending to Gemini API...')
    
    // Get conversation history
    if (!conversations[userId]) {
      conversations[userId] = []
    }
    
    // Add user message to history
    conversations[userId].push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })
    
    // Create context from conversation history (last 10 messages)
    const recentHistory = conversations[userId].slice(-10)
    const context = recentHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    
    // Create a better prompt with memory context and completely open education
    const enhancedPrompt = `You are an AI assistant for EDUCATION and HEALTHCARE. 

    EDUCATION - COMPLETELY OPEN:
    - Answer ANY question that could be considered educational
    - No restrictions on educational topics
    - Include: all academic subjects, technology, science, math, history, literature, programming, AI, Machine Learning (ML), ML algorithms, deep learning, neural networks, data science, computer science, definitions, explanations, tutorials, learning methods, career guidance, research, teaching, student skills, and ANY topic that teaches or explains something
    - Machine Learning (ML) is a key educational topic - answer all ML questions
    - If someone asks about ANY topic that could be educational, answer it
    - Be very broad in what you consider educational
    - Only say "study first" for clearly non-educational topics like entertainment, sports, politics, or personal gossip
    
    HEALTHCARE:
    - Answer all health and medical questions
    - Include: wellness, nutrition, exercise, mental health, medical conditions, preventive care
    
    RESTRICTIONS (ONLY for clearly non-educational topics):
    - Only restrict: politics, entertainment, sports, personal gossip, non-educational personal advice
    - For ANY educational content: ANSWER IT
    - For ANY healthcare content: ANSWER IT
    
    Here is our recent conversation history:
    ${context}
    
    Current Question/Request: ${message}
    
    IMPORTANT: If this question could be considered educational or healthcare-related in ANY way, provide a detailed answer. Only use the "study first" response for clearly non-educational topics like entertainment or politics.`
    
    // Retry mechanism for temporary errors
    let result
    let retries = 0
    const maxRetries = 3
    
    while (retries < maxRetries) {
      try {
        result = await model.generateContent(enhancedPrompt)
        break // Success, exit retry loop
      } catch (error) {
        retries++
        console.log(`Attempt ${retries} failed:`, error.message)
        
        if (retries >= maxRetries) {
          throw error // Re-throw if all retries failed
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    }
    
    const response = await result.response
    const text = response.text()
    
    // Clean up the response - remove asterisks and other formatting artifacts
    const cleanedText = text
      .replace(/\*\*/g, '') // Remove double asterisks
      .replace(/\*/g, '')   // Remove single asterisks
      .replace(/\n\s*\n/g, '\n\n') // Clean up extra line breaks
      .replace(/^\s+|\s+$/g, '') // Remove leading/trailing whitespace
      .trim()
    
    // Add bot response to history
    conversations[userId].push({
      role: 'assistant',
      content: cleanedText,
      timestamp: new Date().toISOString()
    })
    
    // Save conversation history
    saveData()
    
    console.log('Gemini response received (full length):', cleanedText.length, 'characters')
    console.log('Conversation history for user', userId, ':', conversations[userId].length, 'messages')
    
    res.json({ 
      response: cleanedText,
      conversationLength: conversations[userId].length,
      hasMemory: true
    })
  } catch (error) {
    console.error('Gemini API Error:', error.message)
    
    let errorMessage = 'Failed to get response from Gemini'
    
    if (error.message.includes('404')) {
      errorMessage = 'Invalid API key or API endpoint not found. Please check your Gemini API key.'
    } else if (error.message.includes('403')) {
      errorMessage = 'API key is invalid or has insufficient permissions.'
    } else if (error.message.includes('429')) {
      errorMessage = 'API quota exceeded. Please check your usage limits.'
    } else if (error.message.includes('503')) {
      errorMessage = 'Gemini service is temporarily overloaded. Please try again in a few moments.'
    } else if (error.message.includes('BLOCKED')) {
      errorMessage = 'This request was blocked for safety reasons.'
    } else if (error.message.includes('overloaded')) {
      errorMessage = 'Gemini servers are currently busy. Please try again in 1-2 minutes.'
    }
    
    res.status(500).json({ error: errorMessage })
  }
})

// Store user information
app.post('/api/store-user-data', (req, res) => {
  try {
    const { userId = 'default', data } = req.body
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' })
    }
    
    if (!userData[userId]) {
      userData[userId] = {}
    }
    
    // Merge new data with existing data
    userData[userId] = { ...userData[userId], ...data }
    
    saveData()
    
    console.log('User data stored for user:', userId)
    res.json({ 
      success: true, 
      message: 'Data stored successfully',
      storedData: userData[userId]
    })
  } catch (error) {
    console.error('Error storing user data:', error)
    res.status(500).json({ error: 'Failed to store data' })
  }
})

// Get user information
app.get('/api/user-data/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const data = userData[userId] || {}
    
    res.json({ 
      success: true, 
      data: data
    })
  } catch (error) {
    console.error('Error retrieving user data:', error)
    res.status(500).json({ error: 'Failed to retrieve data' })
  }
})

// Get conversation history
app.get('/api/conversation/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const conversation = conversations[userId] || []
    
    res.json({ 
      success: true, 
      conversation: conversation,
      messageCount: conversation.length
    })
  } catch (error) {
    console.error('Error retrieving conversation:', error)
    res.status(500).json({ error: 'Failed to retrieve conversation' })
  }
})

// Clear conversation history
app.delete('/api/conversation/:userId', (req, res) => {
  try {
    const { userId } = req.params
    conversations[userId] = []
    saveData()
    
    res.json({ 
      success: true, 
      message: 'Conversation history cleared'
    })
  } catch (error) {
    console.error('Error clearing conversation:', error)
    res.status(500).json({ error: 'Failed to clear conversation' })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    features: ['chat', 'memory', 'data-storage', 'conversation-history']
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Health check available at http://localhost:3002/health')
  console.log('Features: Conversation memory, Data storage, Persistent history')
}) 