const express = require('express');
const router = express.Router();

console.log('🚀 Loading routes...');

// Always load these routes
router.use('/auth', require('./authRoutes'));
console.log('✅ Auth routes loaded');

router.use('/families', require('./familyRoutes'));
console.log('✅ Family routes loaded');

router.use('/finance', require('./financeRoutes'));
console.log('✅ Finance routes loaded');

router.use('/analytics', require('./analyticsRoutes'));
console.log('✅ Analytics routes loaded');

router.use('/relationships', require('./relationshipRoutes'));
console.log('✅ Relationship routes loaded');

// Conditionally load AI routes
const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';

if (hasOpenAIKey) {
  console.log('✅ AI Routes enabled (OPENAI_API_KEY found)');
  router.use('/ai', require('./aiRoutes'));
} else {
  console.log('⚠️ AI Routes disabled (OPENAI_API_KEY not found)');
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

console.log('✅ All routes loaded successfully');

module.exports = router;