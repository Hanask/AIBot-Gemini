const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { ask } = require("./gemini.service");
const app = express();
app.use(cors());
app.use(bodyParser.json());

(async () => {
    app.post("/chat", async (req, res) => {
        const chatId = req.body.chat_id;
        const message = req.body.message;
        if (!chatId){
            return res.status(400).json({ error: "Chat ID is missing."});
        }
        if(!message){
            return res.status(400).json({ error: "Message is missing."});
        }
        console.log(`Received message: ${JSON.stringify(message)} for chat ID: ${chatId}`);
        const response = await ask(chatId, message);
        return res.json({ response });
    });
})();