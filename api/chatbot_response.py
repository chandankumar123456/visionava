from sentiment_analysis import analyze_sentiment
from face_emotion import analyze_facial_emotion
from voice_emotion import analyze_voice_emotion

# from langchain_openai import OpenAI
from  langchain_openai.chat_models.base import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv
import os

from langchain.memory import ConversationBufferMemory

# from models.database import store_chat_in_db, get_chat_history_from_db

from pymongo import MongoClient
from datetime import datetime

MONGO_URI = 'mongodb+srv://aj309430:Abhi.3094@cluster0.l8ana.mongodb.net/'
client = MongoClient(MONGO_URI)
db = client["visionava_users"]
chat_collection = db["users_chat"]

def store_chat_in_db(user_id, user_text, ai_response, voice_emotion):
    """Stores user and AI messages in the database"""
    chat_entry = {
        "timestamp": datetime.utcnow(),
        "user_message": user_text,
        "ai_response": ai_response,
        "voice_emotion": voice_emotion
    }

    # Check if user already has a chat history document
    existing_chat = chat_collection.find_one({"user_id": user_id})

    if existing_chat:
        # Append new message to the existing chat history
        chat_collection.update_one(
            {"user_id": user_id},
            {"$push": {"chat_history": chat_entry}}
        )
    else:
        # Create a new document for the user
        chat_collection.insert_one({
            "user_id": user_id,
            "chat_history": [chat_entry]
        })

def get_chat_history_from_db(user_id):
    """Retrieves all chat history for a user"""
    existing_chat = chat_collection.find_one({"user_id": user_id})
    if existing_chat:
        return existing_chat.get("chat_history", [])
    
    return []
    # chat_history = chat_collection.find({"user_id": user_id}).sort("timestamp", 1)
    # return [{"user": entry["user_message"], "ai": entry["ai_response"]} for entry in chat_history]

# the above code is for atlas 

openai_api_key = os.getenv("OPENAI_API_KEY")
# print(openai_api_key) 
# llm = OpenAI(model="gpt-3.5-turbo")
llm = ChatOpenAI(model='gpt-3.5-turbo')

# Create memory for storing chat history
memory = ConversationBufferMemory()

def determine_dominant_emotion(text_sentiment, voice_emotion, face_emotion):
    """
    Determines the most likely dominant emotion based on text, voice, and face.
    Priority: Voice > Text > Face (with conflict resolution).
    """
    
    if voice_emotion == text_sentiment:
        return voice_emotion


    if text_sentiment == face_emotion and voice_emotion != text_sentiment:
        return voice_emotion


    if voice_emotion == face_emotion and text_sentiment != voice_emotion:
        return voice_emotion  # Voice + Face = strongest evidence

    return voice_emotion or text_sentiment or face_emotion

def generate_chatbot_response(user_id, user_text, face_emotion, voice_emotion, voice_text):
    """Generates chatbot response based on text sentiment, face emotion and voice tone."""

    # Retrieve previous conversation history from MongoDB Atlas
    chat_history = get_chat_history_from_db(user_id)

    # Convert chat history into LangChain-compatible format
    formatted_history = []
    for entry in chat_history:
        formatted_history.append(HumanMessage(content=entry["user_message"]))
        formatted_history.append(SystemMessage(content=entry["ai_response"]))

    sentiment, confidence = analyze_sentiment(user_text)
    dominant_emotion = determine_dominant_emotion(sentiment, voice_emotion, face_emotion)

    if voice_emotion and face_emotion and voice_emotion != face_emotion:
        mixed_emotion_prompt = (
            f"The user’s voice suggests {voice_emotion}, but their face appears {face_emotion}. "
            "They might be masking their true emotions. Respond gently and encourage them to express how they truly feel."
        )
    else:
        mixed_emotion_prompt = f"The user feels {dominant_emotion}. Respond appropriately."


    system_message = SystemMessage(
    content=(
        "You are a compassionate AI mental health therapist, dedicated to helping users feel heard, understood, and supported. "
        "Your goal is to first recognize and acknowledge their emotions with empathy before offering any solutions. "
        "Avoid generic responses—each reply must be personalized to the user’s current emotional state.\n\n"
        
        "**Response structure:**\n"
        "1. **Acknowledge the user’s emotions**: Show empathy and understanding.\n"
        "2. **Provide personalized therapy**: Suggest coping mechanisms, mindfulness exercises, or supportive words.\n"
        "3. **If the user is sad or anxious, console them**: Offer emotional support and encouragement.\n"
        "4. **Recommend activities/tasks** based on their feelings: These can include relaxation techniques, engaging activities, or positive habits.\n\n"

        "**Format therapy suggestions as bullet points:**\n"
        "  - **Deep Breathing**: Take slow, deep breaths in and out.\n"
        "  - **Grounding Exercise**: Name 5 things you can see, 4 things you can touch, 3 things you can hear, etc.\n"
        "  - **Positive Distraction**: Listen to your favorite song or watch something funny.\n\n"

        "Responses should be **concise, engaging, and structured**. End each response with **a reassuring message**, such as reminding the user they are not alone and encouraging self-care."
    )
)

    user_message = HumanMessage(
        content=(
            f"The user is feeling **{dominant_emotion}**. They said: '{user_text}'.\n\n"
            "1. **Acknowledge their emotions with empathy** before offering any solutions.\n"
            "2. **Provide emotional support** and help them feel understood.\n"
            "3. **Suggest a therapy technique** such as deep breathing, mindfulness, or journaling.\n"
            "4. **Recommend activities/tasks based on their emotions**"

            "Ensure responses are **structured, warm, and encouraging**. Always conclude with a comforting message to make them feel supported and valued."
        )
    )





    
    messages = formatted_history + [
        system_message,
        user_message
    ]

    ai_response = llm.invoke(messages)

    # # Store user input and AI response in memory (Modified here)
    # memory.save_context({"input": user_text}, {"output": ai_response.content})

    # Store the chat history in MongoDB Atlas under users_chat collection
    store_chat_in_db(user_id, user_text, ai_response.content, voice_emotion)
    return ai_response.content


