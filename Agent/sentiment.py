import gdown
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import sys
import json

# Download the model from Google Drive 
google_drive_link = 'https://drive.google.com/file/d/10Ak1NyXBM_nTlcN7y8xauVCjd_KGvOFo/view?usp=sharing'
output_path = './sentiment_model.zip'

if not os.path.exists('./sentiment_model'):
    gdown.download(google_drive_link, output_path, quiet=False)

    # Unzip the downloaded file (if it's a zip file)
    import zipfile
    with zipfile.ZipFile(output_path, 'r') as zip_ref:
        zip_ref.extractall('./sentiment_model')

# Load pre-trained model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("./sentiment_model")
model = AutoModelForSequenceClassification.from_pretrained("./sentiment_model")

def predict_sentiment(tweet):
    inputs = tokenizer(tweet, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    prediction = torch.argmax(logits, dim=1).item()
    return "positive" if prediction == 1 else "negative"

if __name__ == "__main__":
    tweets = json.loads(sys.argv[1])  # Receive tweets as a JSON array
    results = {tweet: predict_sentiment(tweet) for tweet in tweets}
    print(json.dumps(results))
