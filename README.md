# AI-Powered Mental Health Therapy Bot

## Overview
The AI-Powered Mental Health Therapy Bot is designed to provide empathetic, personalized mental health support by analyzing user emotions through text, voice, and facial expressions. The system integrates NLP-based sentiment analysis, facial emotion detection, voice tone analysis, and an AI chatbot with therapy recommendations. Additionally, it supports Speech-to-Text (SST) capabilities.

## Features
- **Sentiment Analysis:** NLP-based analysis of text input to detect user emotions.
- **Facial Emotion Detection:** Analyzes facial expressions to determine emotional state.
- **Voice Tone Analysis:** Detects emotions based on voice tone.
- **AI Chatbot:** Provides personalized therapy recommendations based on detected emotions.
- **Speech-to-Text (SST):** Converts voice input into text.

## Tech Stack
- **API:** Python (Flask)
- **Backend:** Node.js with Express
- **Frontend:** React.js
- **Machine Learning:** TensorFlow, OpenCV, Transformers
- **Speech Processing:** DeepSpeech / Whisper API
- **Database:** MongoDB

## Installation & Setup
### API
1. Navigate to the API directory:
   ```bash
   cd api
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `api` directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Run the API server:
   ```bash
   python app.py
   ```

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend server:
   ```bash
   nodemon index.js
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Usage
1. Start the API server.
2. Start the backend server.
3. Start the frontend client.
4. Access the application in the browser.
5. Interact with the chatbot using text, voice, or facial expressions.

## Future Improvements
- **Text-to-Speech (TTS)** integration to enhance accessibility.
- **Real-time voice tone analysis** for better emotional understanding.
- **Integration with therapy professionals** for enhanced assistance.
- **Mobile app support** for wider accessibility.
- **Integration with wearable devices** for physiological data tracking.
- **Enhanced recommendation system** with personalized activity suggestions.
- **Daily mood tracking feature** with progress visualization.
- **Secure user authentication** for personalized therapy sessions.

## Contributing
Feel free to contribute by submitting pull requests or reporting issues. Your contributions are highly valued!