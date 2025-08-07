import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyDLRbJZpt3AvuXphjrrzSaaRAWJJfZp788'

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...')
    console.log('API Key:', API_KEY.substring(0, 10) + '...')
    
    const genAI = new GoogleGenerativeAI(API_KEY)
    
    // Try different models
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    
    for (const modelName of models) {
      try {
        console.log(`\nTesting model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        
        const result = await model.generateContent("Hello, how are you?")
        const response = await result.response
        const text = response.text()
        
        console.log(`✅ ${modelName} works! Response:`, text.substring(0, 100) + '...')
        return modelName // Return the working model
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message)
      }
    }
    
    console.log('\n❌ All models failed. Please check your API key.')
    return null
    
  } catch (error) {
    console.error('Test failed:', error.message)
    return null
  }
}

testGeminiAPI() 