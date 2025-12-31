const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const familyRoutes = require('./familyRoutes');
const financeRoutes = require('./financeRoutes');
const aiRoutes = require('./aiRoutes');
const analyticsRoutes = require('./analyticsRoutes');

// Use the routes
router.use('/auth', authRoutes);
router.use('/families', familyRoutes);
router.use('/finance', financeRoutes);
router.use('/ai', aiRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;