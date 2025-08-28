const { GoogleGenerativeAI } = require("@google/generative-ai");
const { FSDB } = require("file-system-db");
const { downloadImage } = require("./utilities.service");
// To set the key go to: https://aistudio.google.com/apikey
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

async function ask(chatId, message){
    try {
        // Load chat from local database
        const db = new FSDB(`./db/${chatId}.json`, false);
        const history = db.get("history") || [];
        // Initialize user message that includes text and/or image
        const newMessage = {
            role: "user",
            parts: [],
        };
        if (message.text) {
            newMessage.parts.push({ text: message.text });
        };
        if (message.image_url) {
            // Makes the image into a form that is compatible with Gemini
            const { data, mimeType } = await downloadImage(message.image_url);
            newMessage.parts.push({ 
                inlineData: {
                    data,
                    mimeType,
                },
            });
        }
        // Add new user message to history
        history.push(newMessage);
        // Start chat with Gemini model
        const chat = model.startChat({
            history: history.slice(),
            generationConfig: {
                maxOutoutTokens: 1000,
            },
        });
        // Send the new message to gemini
        const result = await chat.sendMessage(newMessage.parts);
        const response = await result.response;
        const text = response.text();
        // Save models response to history
        history.push({
            role: "model",
            parts: [{ text }]
        });
        db.set("history", history);
        return text;
    }catch (error) {
        console.log(error);
        return error.message || "An error occured.";
    }
}

module.exports = { ask };