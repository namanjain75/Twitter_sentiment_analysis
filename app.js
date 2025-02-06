const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

app.post("/analyze", (req, res) => {
    const tweets = req.body.tweets;
    console.log("Received tweets:", tweets); // Debugging line to log received tweets
    if (!tweets || !Array.isArray(tweets)) {
        return res.status(400).json({ error: "Invalid input, expected an array of tweets" });
    }

    const pythonProcess = spawn("/opt/anaconda3/bin/python", ["sentiment.py", JSON.stringify(tweets)]);

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
            const sentiment = Object.values(sentimentResult)[0];  // Extract the sentiment value
            res.json({ sentiment });  // Return the sentiment as a separate key
        } else {
            res.status(500).json({ error: "Sentiment analysis failed" });
        }
    });
    
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
