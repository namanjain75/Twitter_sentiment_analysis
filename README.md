
# Twitter Sentiment Analysis using BERT
This project implements a sentiment analysis model using a **custom-trained transformer model**. The model was trained using Hugging Face's `transformers` library, specifically with an uncased BERT model on a dataset of 1.6 million tweets. The model classifies tweets into "positive" or "negative" sentiments. and the code allows for processing tweet data in a JSON format.

## Requirements

Before running the project, make sure you have the following installed:

- **Python 3.6+**
- **Node.js** (for server-side application)
- **NPM** (for managing Node.js packages)

### Python Dependencies

Install the required Python dependencies using `pip`:

```bash
pip install gdown torch transformers nltk scikit-learn pandas matplotlib tqdm
```

### Node.js Dependencies

You also need to install the necessary Node.js dependencies for running the backend server.

1. Install the dependencies by running the following command:

```bash
npm install
```

This will install the required Node.js packages including `express`, `body-parser`, and others.

## Setup and Installation

### 1. Download and Set Up the Model

The sentiment analysis model is pre-trained and hosted on Google Drive. You can download the model using the Python script.

- The model is automatically downloaded to a folder named `sentiment_model` in the current directory if it doesn't exist already.
- The model is a `.zip` file, which will be unzipped to the `sentiment_model` directory.

### 2. Create a `.env` File

Create a `.env` file in the root directory of the project and include the following content to configure paths and settings for the project:

```ini
PYTHON_PATH=/opt/anaconda3/bin/python
SENTIMENT_SCRIPT_PATH=./Agent/sentiment.py
PUBLIC_FOLDER=public
PORT=3000
```

- `PYTHON_PATH`: The path to the Python executable.
- `SENTIMENT_SCRIPT_PATH`: The path to the sentiment analysis script (`sentiment.py`).
- `PUBLIC_FOLDER`: The folder where static files are served from (default is `public`).
- `PORT`: The port number where the Express server will run.

### 3. Running the Python Script

Once you've installed the necessary Python dependencies, you can run the script to classify tweet sentiments. The script will download the model and process the input tweet data.

1. Run the script with the following command, passing a JSON array of tweets as an argument:

```bash
python sentiment_analysis.py '[ "This is a great product!", "I hate this." ]'
```

The output will be a JSON object with each tweet classified as either "positive" or "negative":

```json
{
  "This is a great product!": "positive",
  "I hate this.": "negative"
}
```

### 4. Running the Express Server

To start the backend server, use `npm`:

```bash
npm start
```

This will run the `app.js` file using `nodemon`, which watches for changes and restarts the server automatically.

### 5. Using the API

The backend server is designed to accept tweet data and return sentiment analysis results. You can send tweets via HTTP POST requests.

#### Example using `curl`:

```bash
curl -X POST http://localhost:3000/analyze -H "Content-Type: application/json" -d '{"tweets": ["I love this!", "This is terrible!"]}'
```

This will return a response with the sentiment of each tweet.

## Directory Structure

```
twitter_sentiment_analysis/
├── app.js                   # Node.js application entry point
├── sentiment_analysis.py    # Python script for sentiment analysis
├── sentiment_model/         # Folder containing the sentiment analysis model
├── Agent/                   # # Sentiment analysis script
├── package.json             # Node.js dependencies and scripts
├── .env                     # Environment variables for configuration
└── README.md                # Project documentation


Agent/
  └── sentiment.py              # Sentiment analysis script
Model/
  ├── Model.ipynb               # Jupyter notebook for model training
  └── Twitter_Client_side.ipynb # Client-side interaction for Twitter API
```

## Additional Information

- The model used in this project is based on Hugging Face's `transformers` library and fine-tuned for sentiment analysis tasks.
- The project uses `gdown` to download the model from Google Drive (Our pretrained model).
- The Python script processes tweets and returns the sentiment classification for each tweet using the trained model.
- The Node.js server provides an API to send tweet data and retrieve sentiment analysis results.



## Author

- Naman Jain
- Kaustubh

## Acknowledgments

- [Hugging Face Transformers](https://huggingface.co/transformers/)
- [Google Drive API](https://developers.google.com/drive)
