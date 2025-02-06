require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Serve static files from the "public" folder defined in .env
app.use(express.static(path.join(__dirname, process.env.PUBLIC_FOLDER)));

app.use(express.json());

// For home sentiment analysis
app.post("/analyze_home", (req, res) => {
  const tweets = req.body.tweets;
  console.log("Received tweets:", tweets); // Debugging line to log received tweets
  if (!tweets || !Array.isArray(tweets)) {
    return res
      .status(400)
      .json({ error: "Invalid input, expected an array of tweets" });
  }

  const pythonProcess = spawn(process.env.PYTHON_PATH, [
    process.env.SENTIMENT_SCRIPT_PATH,
    JSON.stringify(tweets),
  ]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      console.log("Sentiment analysis result:", result); // Debugging result
      const sentimentResult = JSON.parse(result);
      const sentiment = Object.values(sentimentResult)[0]; // Extract the sentiment value
      res.json({ sentiment }); // Return the sentiment as a separate key
    } else {
      res.status(500).json({ error: "Sentiment analysis failed" });
    }
  });
});

// For report sentiment analysis
app.post("/analyze", (req, res) => {
  const tweets = req.body.tweets;
  console.log("Received tweets:", tweets); // Debugging line to log received tweets
  if (!tweets || !Array.isArray(tweets)) {
    return res
      .status(400)
      .json({ error: "Invalid input, expected an array of tweets" });
  }

  const pythonProcess = spawn(process.env.PYTHON_PATH, [
    process.env.SENTIMENT_SCRIPT_PATH,
    JSON.stringify(tweets),
  ]);

  let result = "";
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      console.log("Sentiment analysis result:", result); // Debugging result
      const sentimentResult = JSON.parse(result);

      const positiveTweets = Object.entries(sentimentResult)
        .filter(([tweet, sentiment]) => sentiment === "positive")
        .map(([tweet, sentiment]) => tweet);

      const negativeTweets = Object.entries(sentimentResult)
        .filter(([tweet, sentiment]) => sentiment === "negative")
        .map(([tweet, sentiment]) => tweet);

      // Return the analysis data and sentiment count
      res.json({
        positiveTweets,
        negativeTweets,
        sentimentCount: {
          positive: positiveTweets.length,
          negative: negativeTweets.length,
        },
      });
    } else {
      res.status(500).json({ error: "Sentiment analysis failed" });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
