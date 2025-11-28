const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // ✅ return token + user object
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({ 
      token, 
      user: userWithoutPassword,
      needsFamily: !user.familyId   // ✅ added line
    });
  } catch (err) {
    console.error("Registration error:", err.message, err.stack);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({ 
      token, 
      user: userWithoutPassword,
      needsFamily: !user.familyId   // ✅ added line
    });
  } catch (err) {
    console.error("Login error:", err.message, err.stack);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;