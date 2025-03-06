from flask import Flask, request, jsonify
from flask_cors import CORS

from sentiment_analysis import analyze_sentiment
from face_emotion import analyze_facial_emotion

from chatbot_response import generate_chatbot_response
import os
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
    Analyzes both face emotion and text sentiment
    """
    user_text = request.form.get("text", "")
    file = request.files.get("file")

    face_emotion = None
    if file:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(file_path)
        face_emotion = analyze_facial_emotion(file_path)

    chatbot_response = generate_chatbot_response(user_text, face_emotion)

    return jsonify({
        "text_sentiment": analyze_sentiment(user_text)[0],
        "face_emotion": face_emotion,
        "chatbot_response": chatbot_response
    })


if __name__ == "__main__":
    app.run(debug=True)

    