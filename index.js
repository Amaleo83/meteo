const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('public'));

// Route pour l'API de chatbot
app.use(express.json());
app.post('/api/chatbot', (req, res) => {
    const userMessage = req.body.message.toLowerCase();

    let botResponse = "Je n'ai pas compris !";

    if (userMessage.includes("salut") || userMessage.includes("bonjour")) {
        botResponse = "Très bien et toi ?";
    } else if (userMessage.includes("comment ça va") || userMessage.includes("ça va")) {
        botResponse = "Je vais bien, merci !";
    }

    res.json({ response: botResponse });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});