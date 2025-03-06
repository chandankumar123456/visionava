from sentiment_analysis import analyze_sentiment
from face_emotion import analyze_facial_emotion
from voice_emotion import analyze_voice_emotion

# from langchain_openai import OpenAI
from  langchain_openai.chat_models.base import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv
import os

openai_api_key = os.getenv("OPENAI_API_KEY")
# print(openai_api_key) 
# llm = OpenAI(model="gpt-3.5-turbo")
llm = ChatOpenAI(model='gpt-3.5-turbo')

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

def generate_chatbot_response(user_text, face_emotion, voice_emotion):
    """Generates chatbot response based on text sentiment, face emotion and voice tone."""
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
            "You are a compassionate mental health therapy assistant. "
            "Your responses should be empathetic, patient, and supportive. "
            "Ask open-ended questions, provide validation, and avoid giving direct medical advice. "
            "If emotions appear mixed (e.g., happy face but sad voice), acknowledge that they might be hiding emotions."
        )
    )

    user_message = HumanMessage(content=f"{mixed_emotion_prompt}\nUser's input: {user_text}")
    
    messages = [
        system_message,
        user_message
    ]

    ai_response = llm.invoke(messages)

    return ai_response.content


