const { chatWithAI } = require('../../ai/flows/chat');

exports.handler = async (event, context) => {
  try {
    const { history, message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing message" })
      };
    }

    const result = await chatWithAI(history || [], message);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("Chat Flow Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to contact AI" })
    };
  }
};
