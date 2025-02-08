require("dotenv").config(); // Load environment variables from .env file


const express = require("express"); // Import Express framework
const bodyParser = require("body-parser"); // Middleware for parsing request bodies
const { spawn } = require("child_process"); // Used to run external Python script
const path = require("path"); // Utility module for handling file paths
const cors = require('cors');

const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Use port from .env file or default to 3000

app.use(cors()); // Allow all origins (for development)
// Serve static files (like HTML, CSS, JS) from the folder specified in .env
app.use(express.static(path.join(__dirname, process.env.PUBLIC_FOLDER)));

app.use(express.json()); // Enable JSON parsing for incoming requests

// Endpoint for home sentiment analysis
app.post("/analyze_home", (req, res) => {
  const tweets = req.body.tweets; // Extract tweets array from request body
  console.log("Received tweets:", tweets); // Log received tweets for debugging

  if (!tweets || !Array.isArray(tweets)) {
    return res.status(400).json({ error: "Invalid input, expected an array of tweets" });
  }

  // Spawn a child process to execute the sentiment analysis Python script
  const pythonProcess = spawn(process.env.PYTHON_PATH, [
    process.env.SENTIMENT_SCRIPT_PATH,
    JSON.stringify(tweets), // Pass tweets as a JSON string
  ]);

  let result = "";
  
  // Capture script output
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  // Capture errors from script execution
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  // Process completed
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      console.log("Sentiment analysis result:", result); // Debugging result
      const sentimentResult = JSON.parse(result); // Parse JSON result from Python script
      const sentiment = Object.values(sentimentResult)[0]; // Extract the sentiment value
      res.json({ sentiment }); // Return the sentiment as response
    } else {
      res.status(500).json({ error: "Sentiment analysis failed" });
    }
  });
});

// Endpoint for report sentiment analysis
app.post("/analyze", (req, res) => {
  const tweets = req.body.tweets; // Extract tweets array from request body
  console.log("Received tweets:", tweets); // Log received tweets for debugging

  if (!tweets || !Array.isArray(tweets)) {
    return res.status(400).json({ error: "Invalid input, expected an array of tweets" });
  }

  // Spawn a child process to execute the sentiment analysis Python script
  const pythonProcess = spawn(process.env.PYTHON_PATH, [
    process.env.SENTIMENT_SCRIPT_PATH,
    JSON.stringify(tweets), // Pass tweets as a JSON string
  ]);

  let result = "";
  
  // Capture script output
  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  // Capture errors from script execution
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  // Process completed
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      console.log("Sentiment analysis result:", result); // Debugging result
      const sentimentResult = JSON.parse(result); // Parse JSON result from Python script
      
      // Extract positive and negative tweets separately
      const positiveTweets = Object.entries(sentimentResult)
        .filter(([tweet, sentiment]) => sentiment === "positive")
        .map(([tweet]) => tweet);

      const negativeTweets = Object.entries(sentimentResult)
        .filter(([tweet, sentiment]) => sentiment === "negative")
        .map(([tweet]) => tweet);

      // Return the analysis data including sentiment count
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

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
