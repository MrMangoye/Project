const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Family = require('../models/Family');
const Person = require('../models/Person');
const Event = require('../models/Event');

// Get family analytics
router.get('/families/:id/analytics', auth, async (req, res) => {
  try {
    console.log('Getting analytics for family:', req.params.id);
    
    const familyId = req.params.id;
    
    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    const members = await Person.find({ familyId });
    
    // Calculate age distribution
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '66+': 0
    };
    
    members.forEach(member => {
      if (member.dob) {
        const birthDate = new Date(member.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['66+']++;
      }
    });
    
    // Occupation distribution
    const occupations = {};
    members.forEach(member => {
      if (member.occupation) {
        occupations[member.occupation] = (occupations[member.occupation] || 0) + 1;
      }
    });
    
    // Business industry distribution
    const industries = {};
    members.forEach(member => {
      if (member.business?.industry) {
        industries[member.business.industry] = (industries[member.business.industry] || 0) + 1;
      }
    });
    
    // Upcoming events
    const upcomingEvents = await Event.countDocuments({
      familyId,
      date: { $gte: new Date() },
      status: 'upcoming'
    });
    
    // Gender distribution
    const maleCount = members.filter(m => m.gender === 'male').length;
    const femaleCount = members.filter(m => m.gender === 'female').length;
    
    // Calculate average age
    const ages = members
      .filter(m => m.dob)
      .map(m => {
        const birthDate = new Date(m.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      });
    
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b) / ages.length) : 0;
    
    res.json({
      success: true,
      analytics: {
        totalMembers: members.length,
        ageDistribution: ageGroups,
        occupationDistribution: occupations,
        industryDistribution: industries,
        upcomingEvents,
        averageAge,
        maleCount,
        femaleCount
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Timeline analytics
router.get('/families/:id/timeline', auth, async (req, res) => {
  try {
    console.log('Getting timeline for family:', req.params.id);
    
    const { year } = req.query;
    const familyId = req.params.id;
    
    const startDate = new Date(`${year || new Date().getFullYear()}-01-01`);
    const endDate = new Date(`${year || new Date().getFullYear()}-12-31`);
    
    const events = await Event.find({
      familyId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ date: 1 })
    .populate('relatedPersons', 'name');
    
    res.json({
      success: true,
      timeline: events
    });
  } catch (err) {
    console.error('Timeline error:', err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

module.exports = router;