require('dotenv').config();
const AIModel = require('./services/chatModels');

async function run() {
 
    const res = await AIModel.ask("best soil for weed in india");
    console.log(res);
    // Print assistant text (may vary by client version)
    // const text = res?.choices?.[0]?.message?.content ?? JSON.stringify(res, null, 2);
    // console.log("Assistant:", text);
}
run();


//Model: gemini-1.5-flash, gemini-2.0-flash, gemini-2.0-pro, gemini-2.5-pro
//Temperature - controls the randomness of the output
//     - value between 0 and 1
//     - closer to 0, the more focused and deterministic the output
//     - closer to 1, the more random and creative the output

//TopP - nucleus sampling
//     - models that controls the diversity and randomness of the output 
//     - cumulative probability threshold value between 0 and 1

//TopK - limits the number of highest probability vocabulary tokens to keep for generation
//     - value between 0 and infinity
//     - higher the value, more diverse the output

//MaxOutputTokens - maximum number of tokens to generate in the response
//     - token can be as short as one character or as long as one word
//     - value between 1 and 2048

//ResponseMimeType - format of the response -text/plain, text/markdown, application/json
