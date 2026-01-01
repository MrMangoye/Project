// In your main routes/index.js or wherever routes are combined
const express = require('express');
const router = express.Router();

// Always load these routes
router.use('/auth', require('./authRoutes'));
router.use('/families', require('./familyRoutes'));
router.use('/finance', require('./financeRoutes'));
router.use('/analytics', require('./analyticsRoutes'));

// Conditionally load AI routes
const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
if (hasOpenAIKey) {
  console.log('✓ AI Routes enabled (OPENAI_API_KEY found)');
  router.use('/ai', require('./aiRoutes'));
} else {
  console.log('⚠ AI Routes disabled (OPENAI_API_KEY not found)');
  // Create placeholder route for AI endpoints
  router.post('/ai/extract-family', (req, res) => {
    res.status(503).json({
      error: 'AI Feature Disabled',
      message: 'OpenAI API key is required to use AI features. Please add OPENAI_API_KEY to your .env file.'
    });
  });
  router.post('/ai/ocr-extract', (req, res) => {
    res.status(503).json({
      error: 'OCR Feature Disabled',
      message: 'OpenAI API key is required to use OCR features. Please add OPENAI_API_KEY to your .env file.'
    });
  });
}

module.exports = router;