from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2Processor
import torch
import librosa
import numpy as np

MODEL_NAME = "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim"
processor = Wav2Vec2Processor.from_pretrained(MODEL_NAME)
model = Wav2Vec2ForSequenceClassification.from_pretrained(MODEL_NAME)

emotion_labels = ["Neutral", "Happy", "Sad", "Angry", "Fearful", "Disgusted", "Surprised"]

def analyze_voice_emotion(audio_path):
    """
    Predicts emotion from voice tone using a Wav2Vec2-based model.
    """
    try:
        speech, sr = librosa.load(audio_path, sr=16000)
        inputs = processor(speech, sampling_rate=16000, return_tensors="pt", padding=True)

        # Running the model
        with torch.no_grad():
            logits = model(**inputs).logits
        
        # Prediction
        predicted_class = torch.argmax(logits, dim=-1).item()
        return emotion_labels[predicted_class]
    except Exception as e:
        return f"Error : {e}"