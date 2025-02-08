# Install required dependencies if not already installed
import subprocess
import sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

# List of necessary libraries
required_libraries = [
    "pandas", "transformers", "scikit-learn", "torch", "nltk", "tqdm", "numpy"
]

# Install libraries
for lib in required_libraries:
    install(lib)

# Importing necessary libraries
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.model_selection import train_test_split
import torch
from torch.utils.data import TensorDataset, DataLoader
from nltk.corpus import stopwords
import nltk
from nltk.stem.porter import PorterStemmer
import re
from tqdm import tqdm
import numpy as np

# Download necessary NLTK resources
nltk.download('stopwords')


# Function to train sentiment analysis model
def train_sentiment_model(dataset_path, output_model_dir='./sentiment_model'):
    # Load dataset
    column_names = ["target", "ids", "date", "flag", "user", "text"]
    data = pd.read_csv(dataset_path, names=column_names, encoding='ISO-8859-1')

    # Sample 500 positive and 500 negative tweets
    positive_tweets = data[data["target"] == 4][:1000]
    negative_tweets = data[data["target"] == 0][:1000]
    sampled_data = pd.concat([positive_tweets, negative_tweets])

    # Preprocess target values
    sampled_data.replace({'target': {4: 1}}, inplace=True)

    # Preprocess text (stemming and cleaning)
    stem = PorterStemmer()
    def stemming(content):
        content = re.sub('[^a-zA-Z]', ' ', content)  # Remove non-alphabetic characters
        content = content.lower().split()  # Convert to lowercase and split into words
        content = [stem.stem(word) for word in content if word not in stopwords.words('english')]  # Stemming
        return ' '.join(content)

    sampled_data["stemmed_contents"] = sampled_data['text'].apply(stemming)

    # Split data into training and testing sets
    train_data, test_data = train_test_split(sampled_data, test_size=0.3, random_state=42)

    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)

    # Move model to GPU if available
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model.to(device)

    # Tokenize the data
    train_encodings = tokenizer(train_data["stemmed_contents"].tolist(), truncation=True, padding=True, max_length=128)
    test_encodings = tokenizer(test_data["stemmed_contents"].tolist(), truncation=True, padding=True, max_length=128)

    # Create PyTorch datasets
    train_dataset = TensorDataset(torch.tensor(train_encodings["input_ids"]), 
                                   torch.tensor(train_encodings["attention_mask"]), 
                                   torch.tensor(train_data["target"].values))
    test_dataset = TensorDataset(torch.tensor(test_encodings["input_ids"]), 
                                  torch.tensor(test_encodings["attention_mask"]), 
                                  torch.tensor(test_data["target"].values))

    # Create DataLoader
    train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=16)

    # Define optimizer, loss function, and early stopping parameters
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    loss_fn = torch.nn.CrossEntropyLoss()
    patience = 2  # Early stopping patience
    best_loss = np.inf
    epochs = 10
    counter = 0

    # Training the model
    for epoch in range(epochs):
        model.train()
        running_loss = 0
        for batch in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}", leave=False):
            input_ids = batch[0].to(device)
            attention_mask = batch[1].to(device)
            labels = batch[2].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss

            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        avg_loss = running_loss / len(train_loader)

        # Early stopping logic
        if avg_loss < best_loss:
            best_loss = avg_loss
            counter = 0
        else:
            counter += 1

        if counter >= patience:
            break

    # Save the model and tokenizer
    model.save_pretrained(output_model_dir)
    tokenizer.save_pretrained(output_model_dir)

    # Save the optimizer state
    torch.save(optimizer.state_dict(), f"{output_model_dir}/optimizer.pth")

    print(f"Model saved to {output_model_dir}")

# Call the function with dataset path
train_sentiment_model('path_to_your_dataset.csv')  # Replace with your dataset file path
