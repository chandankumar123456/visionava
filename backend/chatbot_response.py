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

def store_chat_in_db(user_id, user_text, ai_response):
    """Stores user and AI messages in the database"""
    chat_entry = {
        "user_id": user_id,
        "timestamp": datetime.utcnow(),
        "user_message": user_text,
        "ai_response": ai_response
    }
    chat_collection.insert_one(chat_entry)

def get_chat_history_from_db(user_id):
    """Retrieves all chat history for a user"""
    chat_history = chat_collection.find({"user_id": user_id}).sort("timestamp", 1)
    return [{"user": entry["user_message"], "ai": entry["ai_response"]} for entry in chat_history]

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

def generate_chatbot_response(user_id, user_text, face_emotion, voice_emotion):
    """Generates chatbot response based on text sentiment, face emotion and voice tone."""

    # Retrieve previous conversation history from MongoDB Atlas
    chat_history = get_chat_history_from_db(user_id)

    # Convert chat history into LangChain-compatible format
    formatted_history = []
    for entry in chat_history:
        formatted_history.append(HumanMessage(content=entry["user"]))
        formatted_history.append(SystemMessage(content=entry["ai"]))

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
        "You are a compassionate mental health therapist. "
        "Before giving advice, always validate the user's feelings. "
        "If emotions conflict, acknowledge the contradiction and encourage self-reflection. "
        "Ask open-ended questions before suggesting solutions. "
        "Avoid generic responses—tailor your reply to the user's situation."
    )
)

    user_message = HumanMessage(
        content=f"The user feels {dominant_emotion}. They said: {user_text}. "
                "Please generate a thoughtful, empathetic response."
    )

    
    messages = formatted_history + [
        system_message,
        user_message
    ]

    ai_response = llm.invoke(messages)

    # # Store user input and AI response in memory (Modified here)
    # memory.save_context({"input": user_text}, {"output": ai_response.content})

    # Store the chat history in MongoDB Atlas under users_chat collection
    store_chat_in_db(user_id, user_text, ai_response.content)
    return ai_response.content


