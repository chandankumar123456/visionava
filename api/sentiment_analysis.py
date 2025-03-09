from transformers import pipeline # type: ignore

sentiment_pipeline = pipeline("sentiment-analysis", model = "cardiffnlp/twitter-roberta-base-sentiment-latest")

label_mapping = {
    "negative": "Negative",
    "neutral": "Neutral",
    "positive": "Positive"
}

def analyze_sentiment(text):
    result = sentiment_pipeline(text)[0]
    # print(f"Raw output: {result}")
    sentiment_label = label_mapping[result['label']] 
    return sentiment_label, result['score']

if __name__== '__main__':
    text = input("Enter a sentence: ")
    sentiment, confidence = analyze_sentiment(text)
    print(f"Sentiment: {sentiment}, Confidence: {confidence:.2f}")