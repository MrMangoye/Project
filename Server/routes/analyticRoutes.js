const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Family = require('../models/Family');
const Person = require('../models/Person');
const Event = require('../models/Event');

router.get('/families/:id/analytics', auth, async (req, res) => {
  try {
    const familyId = req.params.id;
    
    const family = await Family.findById(familyId);
    const members = await Person.find({ familyId });
    
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '66+': 0
    };
    
    members.forEach(member => {
      if (member.dob) {
        const age = member.age;
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['66+']++;
      }
    });
    
    const occupations = {};
    members.forEach(member => {
      if (member.occupation) {
        occupations[member.occupation] = (occupations[member.occupation] || 0) + 1;
      }
    });
    
    const industries = {};
    members.forEach(member => {
      if (member.business?.industry) {
        industries[member.business.industry] = (industries[member.business.industry] || 0) + 1;
      }
    });
    
    const upcomingEvents = await Event.find({
      familyId,
      date: { $gte: new Date() }
    }).countDocuments();
    
    res.json({
      success: true,
      analytics: {
        totalMembers: members.length,
        ageDistribution: ageGroups,
        occupationDistribution: occupations,
        industryDistribution: industries,
        upcomingEvents,
        averageAge: family.statistics.averageAge || 0,
        maleCount: members.filter(m => m.gender === 'male').length,
        femaleCount: members.filter(m => m.gender === 'female').length
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;