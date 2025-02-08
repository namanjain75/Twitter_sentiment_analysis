async function analyzeSentiment() {
    const tweet = document.getElementById("tweetInput").value;
    if (!tweet) {
        alert("Please enter a tweet.");
        return;
    }

    const tweets = [tweet];  // Wrap the single tweet in an array
    console.log("Sending tweets to backend:", tweets);  // Debugging line to log the tweets being sent

    const response = await fetch("http://localhost/analyze_home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets })  // Send the array instead of a single tweet
    });

    const data = await response.json();
    console.log("Received response:", data);  // Debugging line to log the response from backend
    
    // Assuming the response is like { "this is a good one": "positive" }
    const sentiment = Object.values(data)[0];  // Extract the sentiment value
    document.getElementById("result").innerText = `Sentiment: ${sentiment}`;
}