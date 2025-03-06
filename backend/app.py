from flask import Flask, request, jsonify
from flask_cors import CORS

from sentiment_analysis import analyze_sentiment
from face_emotion import analyze_facial_emotion

from chatbot_response import generate_chatbot_response
import os

from voice_emotion import analyze_voice_emotion
from utils import transcribe_voice

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
CORS(app)

@app.route('/analyze_statement', methods=["POST"])
def analyze_statement():
    """
    Analyze the sentiment of the given text using roberta sentiment model
    """
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    result = analyze_sentiment(text)

    return jsonify(result)

@app.route('/analyze_face', methods=["POST"])
def analyze_face():
    """
    Analyze facial emotion from an uploaded image file.
    """
    if "files" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['files']
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    emotion = analyze_facial_emotion(file_path)
    
    return jsonify({"emotion": emotion})

@app.route('/unified_emotion', methods=['POST'])
def unified_emotion():
    """
    Analyzes both face emotion, text sentiment and voice tone
    """
    user_id = request.form.get("user_id", None)
    user_text = request.form.get("text", "")
    face_file = request.files.get("face")
    voice_file = request.files.get("voice")

    voice_text=None

    face_emotion = None
    voice_emotion = None

    if face_file:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], face_file.filename)
        face_file.save(file_path)
        face_emotion = analyze_facial_emotion(file_path)

    if voice_file:
        voice_path = os.path.join(app.config["UPLOAD_FOLDER"], voice_file.filename)
        voice_file.save(voice_path)
        voice_emotion = analyze_voice_emotion(voice_path)
        voice_text = transcribe_voice(voice_path)

    if not user_text and voice_text:
        user_text = voice_text

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    chatbot_response = generate_chatbot_response(user_id, user_text, face_emotion, voice_emotion, voice_text)

    return jsonify({
        "user_text": user_text,  # ✅ Final text used (either typed or transcribed)
        "text_sentiment": analyze_sentiment(user_text)[0],
        "face_emotion": face_emotion,
        "voice_emotion": voice_emotion,
        "voice_text": voice_text,  # ✅ Include transcribed voice text for debugging
        "chatbot_response": chatbot_response
    })

@app.route('/analyze_voice', methods=['POST'])
def analyze_voice():
    """
    Analyze voice tone from an uploaded audio file.
    """
    if "file" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400
    
    file = request.files["file"]
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(file_path)

    voice_emotion = analyze_voice_emotion(file_path)

    return jsonify({"voice_emotion": voice_emotion})

if __name__ == "__main__":
    app.run(debug=True)

    