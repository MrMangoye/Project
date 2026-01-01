require('dotenv').config();
const { OpenAI } = require('openai');

console.log('Testing OpenAI key...');
console.log('Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10));

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Simple test
async function test() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }],
      max_tokens: 5
    });
    console.log('✅ OpenAI key works! Response:', completion.choices[0].message.content);
  } catch (error) {
    console.log('❌ OpenAI error:', error.message);
  }
}

test();