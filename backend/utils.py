import whisper
import os
from pydub import AudioSegment

def transcribe_voice(voice_file):
    # Convert to WAV if necessary
    converted_file = voice_file  # Default to original file

    if not voice_file.endswith(".wav"):
        converted_file = os.path.splitext(voice_file)[0] + ".wav"
        audio = AudioSegment.from_file(voice_file)
        audio.export(converted_file, format="wav")

    # Load Whisper model
    model = whisper.load_model("base")  # Use "small", "medium", or "large" for better accuracy

    try:
        # Transcribe the audio
        result = model.transcribe(converted_file)
        return result["text"]
    except Exception as e:
        return f"Error in transcription: {str(e)}"

# import speech_recognition as sr
# from pydub import AudioSegment
# import os

# def transcribe_voice(voice_file):
#     converted_file = voice_file  # Default is the original file

#     # Convert to WAV if necessary
#     if not voice_file.endswith(".wav"):
#         converted_file = os.path.splitext(voice_file)[0] + ".wav"
#         audio = AudioSegment.from_file(voice_file)
#         audio.export(converted_file, format="wav")

#     recognizer = sr.Recognizer()

#     try:
#         with sr.AudioFile(converted_file) as source:
#             audio_data = recognizer.record(source)
#             return recognizer.recognize_google(audio_data)
#     except Exception as e:
#         return f"Error in transcription: {str(e)}"

# def transcribe_voice(voice_file):
#     # Convert to WAV if necessary
#     if not voice_file.endswith(".wav"):
#         audio = AudioSegment.from_file(voice_file)
#         voice_file = "converted.wav"
#         audio.export(voice_file, format="wav")

#     recognizer = sr.Recognizer()
#     with sr.AudioFile(voice_file) as source:
#         audio_data = recognizer.record(source)
#         return recognizer.recognize_google(audio_data)
# def transcribe_voice(voice_file):
#     """Transcribes voice input into text"""
#     recognizer = sr.Recognizer()
#     with sr.AudioFile(voice_file) as source:
#         audio = recognizer.record(source)
#         try:
#             return recognizer.recognize_google(audio)  # ✅ Convert speech to text
#         except sr.UnknownValueError:
#             return "Could not understand voice input."
#         except sr.RequestError:
#             return "Speech recognition service is unavailable."