const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

const ask = async (prompt = "") => {
  const res = await openai.chat.completions.create({
    model: process.env.AI_MODEL, 
    messages: [
      { role: "system", content: "You are a helpful assistant. you should act like agriculture assistant and give only agriculture related information" },
      { role: "user", content: `${prompt}` }
    ],
    temperature: 0.9,
    top_p: 0.95,
    max_tokens: 20
  });

  return res; // caller can read res.choices[0].message.content
};

module.exports = { ask };
