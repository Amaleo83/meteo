import ollama from "ollama"

import express from 'express';
const app = express();
const port = 8080;

// Middleware pour servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static('public'));

// Route pour l'API de chatbot
app.use(express.json());
app.post('/api/chatbot', async (req, res) => {

    
    const userMessage = req.body.message.toLowerCase();

    const response = await ollama.chat({
        model: 'gemma2:2b',
        messages: [{ role: 'user', content: userMessage }],
      })
      console.log(response.message.content)

      let botResponse = response.message.content;

      
    res.json({ response: botResponse });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});