from sentiment_analysis import analyze_sentiment
from face_emotion import analyze_facial_emotion

# from langchain_openai import OpenAI
from  langchain_openai.chat_models.base import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from dotenv import load_dotenv
import os

openai_api_key = os.getenv("OPENAI_API_KEY")
# print(openai_api_key) 
# llm = OpenAI(model="gpt-3.5-turbo")
llm = ChatOpenAI(model='gpt-3.5-turbo')


def generate_chatbot_response(user_text, face_emotion_value):
    """Generates chatbot response based on text sentiment and face emotion."""
    sentiment, confidence = analyze_sentiment(user_text)

    dominant_emotion = face_emotion_value if face_emotion_value else sentiment

    if dominant_emotion == "happy" or sentiment == "POSITIVE":
        response_prompt = f"The user is happy. Respond in a cheerful way: {user_text}"
    elif dominant_emotion == "sad" or sentiment == "NEGATIVE":
        response_prompt = f"The user is feeling down. Respond with empathy and encouragement: {user_text}"
    elif dominant_emotion == "angry":
        response_prompt = f"The user is angry. Respond calmly and try to de-escalate: {user_text}"
    else:
        response_prompt = f"The user is neutral. Respond normally: {user_text}"


    system_message = SystemMessage(
        content=(
            "You are a compassionate mental health therapy assistant. "
            "Your responses should be empathetic, patient, and supportive. "
            "Ask open-ended questions, provide validation, and avoid giving direct medical advice."
        )
    )

    user_message = HumanMessage(
        content=f"The user feels {response_prompt}"
    )
    
    messages = [
        system_message,
        user_message
    ]

    ai_response = llm.invoke(messages)

    return ai_response.content


