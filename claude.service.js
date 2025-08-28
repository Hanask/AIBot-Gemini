const { FSDB } = require("file-system-db");
const { downloadImage } = require("./utilities.service");
// To set the key go to: https://console.anthropic.com/dashboard
const Anthropic = require("@anthropic-ai/sdk");
const anthropic = new Anthropic();

async function ask(chatId, message) {
  try {
    const db = new FSDB(`./db/${chatId}.json`, false);
    const messages = db.get("messages") || [];

    const newMessage = {
      role: "user",
      content: [],
    };
    if (message.text) {
      newMessage.content.push({ text: message.text, type: "text" });
    }
    if (message.image_url) {
      const { data, mimeType } = await downloadImage(message.image_url);
      newMessage.content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data,
        },
      });
    }

    messages.push(newMessage);
    const response = await anthropic.messages.create({
      max_tokens: 1024,
      messages: messages.slice(),
      model: "claude-3-opus-20240229",
    });
    const answer = {
      role: response.role,
      content: response.content,
    };
    messages.push(answer);
    db.set("messages", messages);
    return response.content[0].text;
  } catch (error) {
    console.error(error);
    return error.message || "An error occurred";
  }
}

module.exports = { ask };