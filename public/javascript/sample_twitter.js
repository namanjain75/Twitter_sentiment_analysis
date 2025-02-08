
import { tweets } from "./Sample_dataset.js";

async function fetchSentimentData() {
    // This function fetches sentiment data from the API and updates the UI with the results.
    // In place of this static tweets, we can use Twitter API also 
   

    // Show loading screen
    document.getElementById("loading-screen").style.display = "flex";

    try {
        // Fetch sentiment data from the backend
        const response = await fetch("http://localhost/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tweets })
        });

        const data = await response.json();
        console.log("Received sentiment analysis data:", data);

        // Update the UI with the positive and negative tweets
        const topPositiveTweets = data.positiveTweets.slice(0, 5);
        const topNegativeTweets = data.negativeTweets.slice(0, 5);

        document.getElementById("positive-tweets").innerHTML = topPositiveTweets.map(tweet => `<li>${tweet}</li>`).join('');
        document.getElementById("negative-tweets").innerHTML = topNegativeTweets.map(tweet => `<li>${tweet}</li>`).join('');

        // Display sentiment count (this remains the full count)
        document.getElementById("positive-count").textContent = data.sentimentCount.positive;
        document.getElementById("negative-count").textContent = data.sentimentCount.negative;

        // Create sentiment distribution chart to visualize sentiment analysis results
        const ctx = document.getElementById('sentiment-chart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Positive', 'Negative'],
                datasets: [{
                    data: [data.sentimentCount.positive, data.sentimentCount.negative],
                    backgroundColor: ['#4caf50', '#f44336']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.raw + ' tweets';
                            }
                        }
                    }
                }
            }
        });

        // Hide loading screen and show content
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("analysis-report").style.display = "block";
    } catch (error) {
        console.error("Error fetching sentiment data:", error);
        // Handle error gracefully
        document.getElementById("loading-screen").textContent = "Failed to load data, please try again later.";
    }
}

window.onload = fetchSentimentData; // Call the function when the window loads
