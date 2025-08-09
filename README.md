# AI Chatbot with Gemini Integration

A modern, responsive chatbot application built with React, Vite, and Tailwind CSS. Features a beautiful UI with smooth animations, realistic typing indicator, and integration with Google's Gemini AI API.

## Features

- 🎨 **Modern UI**: Clean, responsive design with gradient backgrounds and smooth animations
- 💬 **Real-time Chat**: Interactive chat interface with message history
- 🤖 **Gemini AI Integration**: Powered by Google's Gemini 1.5 Flash model
- 🧠 **Conversation Memory**: Maintains context across conversations
- ⏱️ **Typing Indicator**: Realistic typing animation when the bot is responding
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 🎯 **User-friendly**: Intuitive interface with keyboard shortcuts (Enter to send)
- 🔄 **Auto-scroll**: Automatically scrolls to the latest message
- 🎭 **Message Types**: Different styling for user and bot messages
- 💾 **Data Persistence**: Saves conversation history and user data locally
- 🔧 **Educational Focus**: Optimized for educational and healthcare content

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   npm run server
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. Enter your Gemini API key in the chat interface to start using the AI chatbot

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Usage

1. **Get API Key**: Obtain a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Enter API Key**: When you first open the app, enter your Gemini API key
3. **Start Chatting**: Type your message and press Enter or click the send button
4. **AI Responses**: The bot will respond using Google's Gemini AI with educational and healthcare focus
5. **Conversation Memory**: The bot remembers your conversation history for context
6. **Data Persistence**: Your conversations are saved locally for future sessions

## Customization

### Styling
The application uses Tailwind CSS for styling. You can customize the appearance by modifying:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Custom CSS classes
- Component files - Individual component styles

### Bot Responses
To customize the bot's responses, edit the `responses` array in `src/App.jsx`:

```javascript
const responses = [
  "Your custom response here...",
  "Another custom response...",
  // Add more responses
]
```

### Adding Real AI Integration
To integrate with a real AI service (like OpenAI, Claude, etc.):

1. Replace the `generateBotResponse` function in `src/App.jsx`
2. Add your API key and endpoint
3. Handle the API response and error cases

Example:
```javascript
const generateBotResponse = async (userMessage) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    })
    const data = await response.json()
    return {
      id: Date.now(),
      text: data.response,
      sender: 'bot',
      timestamp: new Date()
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      id: Date.now(),
      text: "Sorry, I'm having trouble responding right now.",
      sender: 'bot',
      timestamp: new Date()
    }
  }
}
```

## Project Structure

```
chatbot/
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx
│   │   └── TypingIndicator.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── data/
│   ├── conversations.json
│   └── userData.json
├── server.js
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Express.js** - Backend server
- **Google Gemini AI** - AI model integration
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **PostCSS** - CSS processing
- **CORS** - Cross-origin resource sharing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on the repository.