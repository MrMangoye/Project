const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// AI Family History Extraction
router.post('/extract-family', auth, async (req, res) => {
  try {
    console.log('AI extract-family called');
    return res.status(503).json({
      error: 'AI Feature Temporarily Disabled',
      message: 'The AI text analysis feature is currently unavailable.',
      instructions: 'To enable this feature: 1. Get an OpenAI API key from https://platform.openai.com/ 2. Add OPENAI_API_KEY to your .env file 3. Uncomment the OpenAI code in routes/aiRoutes.js'
    });
  } catch (err) {
    console.error('AI extraction error:', err);
    res.status(500).json({
      error: 'AI analysis service unavailable',
      details: err.message
    });
  }
});

// OCR Text Extraction
router.post('/ocr-extract', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('OCR extract called');
    return res.status(503).json({
      error: 'OCR Feature Temporarily Disabled',
      message: 'The OCR text extraction feature is currently unavailable.',
      instructions: 'To enable this feature: 1. Install Tesseract.js dependencies 2. Uncomment the Tesseract code in routes/aiRoutes.js'
    });
  } catch (err) {
    res.status(500).json({
      error: 'OCR processing service unavailable',
      details: err.message
    });
  }
});

module.exports = router;