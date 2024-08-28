import ollama from "ollama"

import express from 'express';

const ejs = require('ejs');
const path = require('path');
require('dotenv').config()
const XMLHttpRequest = require('xhr2');

const port = 8080;

const apiKey = process.env.API_KEY;
const countrydata = require("./data/country_data.json")

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.set('views', __dirname+'/views')
app.set('view engine', 'ejs');

app.get('/', (req,res) => {
    res.redirect("/meteo")
})

app.get('/meteo', (req, res) => {
    res.render('meteo', {countrydata: JSON.stringify(countrydata), port:port, weatherdata: 'null'});
});

app.get('/meteo/:coords', (req, res) => {
    let latAndLong = req.params.coords.split(";")
    let weatherdata;

    let xhr = new XMLHttpRequest;
    xhr.open('GET',
    'https://api.tomorrow.io/v4/weather/forecast?location='+latAndLong[0]+','+latAndLong[1]+'&apikey='+apiKey,
    true);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            weatherdata = xhr.responseText;
        }
    };
    xhr.send();
    xhr.onload = () => {
        weatherDataToday = []
        weatherDataTomorrow = []

        weatherDataToday = weatherdata
        weatherDataTomorrow = weatherdata

        res.render('meteo', {countrydata: JSON.stringify(countrydata), port: port, weatherdata: weatherdata})
    }

})
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

