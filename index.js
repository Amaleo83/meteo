const express = require('express');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config()
const XMLHttpRequest = require('xhr2');

const app = express();
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


// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});