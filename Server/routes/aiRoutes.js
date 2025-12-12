const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { OpenAI } = require('openai');
const multer = require('multer');
const Tesseract = require('tesseract.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/extract-family', auth, async (req, res) => {
  try {
    const { text, familyId } = req.body;
    
    const prompt = `
    Analyze this family history text and extract:
    1. People mentioned with names, birth years, death years if mentioned
    2. Relationships between them (parent, spouse, sibling, child)
    3. Locations mentioned
    4. Important events
    
    Text: ${text}
    
    Return as JSON with this structure:
    {
      "people": [{"name": "John Smith", "birthYear": 1935, "deathYear": 2010, "gender": "male"}],
      "relationships": [{"type": "parent", "from": "John Smith", "to": "Mary Smith"}],
      "locations": ["London", "New York"],
      "events": [{"type": "wedding", "people": ["John", "Mary"], "year": 1960}],
      "suggestions": ["Add Mary Smith as spouse of John Smith"]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (err) {
    console.error('AI extraction error:', err);
    res.status(500).json({ error: 'AI analysis failed' });
  }
});

router.post('/ocr-extract', auth, upload.single('image'), async (req, res) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      req.file.buffer,
      'eng'
    );
    
    res.json({ extractedText: text });
  } catch (err) {
    res.status(500).json({ error: 'OCR processing failed' });
  }
});

module.exports = router;