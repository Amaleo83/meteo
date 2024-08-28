import ollama from "ollama"

import express from 'express';
const app = express();
const port = 8080;

app.use(express.static('public'));

// Route pour l'API de chatbot
app.use(express.json());
app.post('/api/chatbot', async (req, res) => {

    
    const userMessage = req.body.message.toLowerCase();

    const weatherDataRegex = /(\w+):\s*([-\d.]+|"[^"]*")/g;
    const hasWeatherData = weatherDataRegex.test(userMessage);

    let finalMessage;

    if (hasWeatherData) {
        const weatherData = parseWeatherDataFromMessage(userMessage);
        const weatherDescription = interpretWeatherData(weatherData);

        finalMessage = `Les données météo fournies indiquent que le temps est ${weatherDescription}. Réponds toujours en français.`;
    } else {
        finalMessage = userMessage;
    }

    const response = await ollama.chat({
        model: 'gemma2:2b',
        messages: [{ role: 'user', content: finalMessage }],
      })
      console.log(response.message.content)

      let botResponse = response.message.content;

      
    res.json({ response: botResponse });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

function interpretWeatherData(data) {
    const cloudCoverAvg = data.get("cloudcoveravg");
    const precipitationProbabilityAvg = data.get('precipitationprobabilityavg');
    const rainAccumulationSum = data.get('rainaccumulationsum');
    const snowAccumulationSum = data.get('snowaccumulationsum');
    const temperatureAvg = data.get('temperatureavg');

    let description = '';

    if (snowAccumulationSum > 0) {
        description = 'neigeux';
    } else if (precipitationProbabilityAvg > 50 || rainAccumulationSum > 0) {
        description = 'pluvieux';
    } else if (cloudCoverAvg > 70) {
        description = 'nuageux';
    } else if (temperatureAvg > 30 && cloudCoverAvg < 20) {
        description = 'ensoleillé';
    } else {
        description = 'clair avec quelques nuages';
    }

    return description;
}

function parseWeatherDataFromMessage(message) {
    const data = new Map();
    const regex = /(\w+):\s*([-\d.]+|"[^"]*")/g;
    let match;

    while ((match = regex.exec(message)) !== null) {
        const key = match[1];
        let value = match[2];

        if (!isNaN(value)) {
            value = parseFloat(value);
        } else {
            value = value.replace(/"/g, ""); 
        }

        data.set(key, value);
    }

    return data;
}

