const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Family = require('../models/Family');
const Person = require('../models/Person');
const auth = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validation');

// Register user
router.post('/register', validateRegister, async (req, res) => {
  try {
    console.log('Registering user:', req.body.email);
    
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    console.log('User registered successfully:', user._id);
    
    res.status(201).json({
      token,
      user: userWithoutPassword,
      needsFamily: !user.familyId
    });
  } catch (err) {
    console.error("Registration error:", err.message, err.stack);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Register with family setup
router.post('/register-with-family', async (req, res) => {
  try {
    console.log('Register with family:', req.body);
    
    const { name, email, password, familyChoice, familyName, familyCode } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    let familyId = null;
    let familyDetails = null;
    
    if (familyChoice === 'create') {
      const family = new Family({
        name: familyName,
        createdBy: user._id,
        admins: [user._id],
        settings: {
          privacy: 'private',
          allowMemberAdd: true,
          requireApproval: false
        }
      });
      await family.save();
      familyId = family._id;
      familyDetails = family;
      
      user.familyId = familyId;
      user.role = 'admin';
      user.isFamilyAdmin = true;
      await user.save();
      
      const person = new Person({
        name: user.name,
        email: user.email,
        familyId: familyId,
        createdBy: user._id,
        isSelf: true,
        role: 'admin'
      });
      await person.save();
      
      family.members.push(person._id);
      await family.save();
      
      console.log('Family created:', familyId);
    } else if (familyChoice === 'join' && familyCode) {
      const family = await Family.findById(familyCode);
      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }
      
      if (family.settings.privacy === 'private' && family.settings.requireApproval) {
        family.pendingMembers = family.pendingMembers || [];
        family.pendingMembers.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          requestedAt: new Date()
        });
        await family.save();
        
        res.json({
          token,
          user: userWithoutPassword,
          familyId: family._id,
          needsApproval: true,
          message: 'Your request to join the family is pending approval'
        });
        return;
      }
      
      familyId = family._id;
      familyDetails = family;
      user.familyId = familyId;
      await user.save();
      
      const person = new Person({
        name: user.name,
        email: user.email,
        familyId: familyId,
        createdBy: user._id,
        isSelf: true
      });
      await person.save();
      
      family.members.push(person._id);
      await family.save();
      
      console.log('User joined family:', familyId);
    }
    
    res.json({
      token,
      user: { ...userWithoutPassword, familyId },
      family: familyDetails,
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body.email);
    
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Login failed for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    user.lastLogin = new Date();
    await user.save();
    
    console.log('Login successful:', user._id);
    
    res.json({
      token,
      user: userWithoutPassword,
      needsFamily: !user.familyId
    });
  } catch (err) {
    console.error("Login error:", err.message, err.stack);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Getting profile for:', req.user._id);
    
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let family = null;
    if (user.familyId) {
      family = await Family.findById(user.familyId).select('name description');
    }
    
    res.json({ user, family });
  } catch (err) {
    console.error("Profile error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;