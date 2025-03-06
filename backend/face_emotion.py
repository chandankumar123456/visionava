from deepface import DeepFace

def analyze_facial_emotion(image_path):
    """
    Detects emotion from a face in the given image using DeepFace.
    """

    try:
        result = DeepFace.analyze(image_path, actions=['emotion'])
        emotion = result[0]['dominant_emotion']
        return emotion
    except Exception as e:
        return f"Error : {str(e)}"

