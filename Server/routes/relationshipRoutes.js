const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Person = require('../models/Person');

// Helper function to calculate all relationships
async function calculateAllRelationships(person, allMembers) {
  const relationships = {
    parents: [],
    children: [],
    siblings: [],
    spouses: [],
    grandparents: [],
    grandchildren: [],
    unclesAunts: [],
    nephewsNieces: [],
    cousins: []
  };

  // Get direct relationships from person object
  if (person.relationships) {
    relationships.parents = person.relationships.parents || [];
    relationships.spouses = person.relationships.spouses || [];
    relationships.siblings = person.relationships.siblings || [];
  }

  // Calculate children (people who have this person as parent)
  relationships.children = allMembers
    .filter(member =>
      member.relationships?.parents?.some(pId =>
        pId.toString() === person._id.toString()
      )
    )
    .map(m => m._id);

  // Calculate siblings (people who share at least one parent)
  if (person.relationships?.parents?.length > 0) {
    relationships.siblings = allMembers
      .filter(member => {
        if (member._id.toString() === person._id.toString()) return false;
        return member.relationships?.parents?.some(parentId =>
          person.relationships.parents.some(pId =>
            pId.toString() === parentId.toString()
          )
        );
      })
      .map(m => m._id);
  }

  // Calculate grandparents (parents of parents)
  if (person.relationships?.parents?.length > 0) {
    const parentObjects = allMembers.filter(m => 
      person.relationships.parents.some(pId => pId.toString() === m._id.toString())
    );
    
    const grandparentIds = new Set();
    parentObjects.forEach(parent => {
      if (parent.relationships?.parents) {
        parent.relationships.parents.forEach(gpId => {
          grandparentIds.add(gpId.toString());
        });
      }
    });
    
    relationships.grandparents = Array.from(grandparentIds);
  }

  return relationships;
}

// Get user relationships
router.get('/user-relationships', auth, async (req, res) => {
  try {
    console.log('Getting user relationships for:', req.user._id);
    
    const user = await User.findById(req.user._id);
    
    if (!user || !user.familyId) {
      return res.json({ relationships: [] });
    }
    
    const person = await Person.findOne({
      email: user.email,
      familyId: user.familyId
    });
    
    if (!person) {
      return res.json({ relationships: [] });
    }
    
    const allMembers = await Person.find({ familyId: user.familyId });
    const relationships = await calculateAllRelationships(person, allMembers);
    
    // Get full person objects for relationships
    const populatedRelationships = {
      parents: await Person.find({ _id: { $in: relationships.parents } }).select('name dob gender'),
      children: await Person.find({ _id: { $in: relationships.children } }).select('name dob gender'),
      siblings: await Person.find({ _id: { $in: relationships.siblings } }).select('name dob gender'),
      spouses: await Person.find({ _id: { $in: relationships.spouses } }).select('name dob gender'),
      grandparents: await Person.find({ _id: { $in: relationships.grandparents } }).select('name dob gender')
    };
    
    res.json({
      success: true,
      relationships: populatedRelationships
    });
  } catch (err) {
    console.error('Get relationships error:', err);
    res.status(500).json({ error: 'Failed to get relationships' });
  }
});

// Get relationship between two members
router.get('/relationship-between/:member1Id/:member2Id', auth, async (req, res) => {
  try {
    console.log('Getting relationship between:', req.params.member1Id, req.params.member2Id);
    
    const { member1Id, member2Id } = req.params;
    
    const member1 = await Person.findById(member1Id);
    const member2 = await Person.findById(member2Id);
    
    if (!member1 || !member2) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    // Check if both belong to the same family
    if (member1.familyId.toString() !== member2.familyId.toString()) {
      return res.status(400).json({ error: 'Members belong to different families' });
    }
    
    const allMembers = await Person.find({ familyId: member1.familyId });
    const relationship = getRelationshipLabel(member1, member2, allMembers);
    
    res.json({
      success: true,
      relationship: relationship || 'No direct relationship found',
      member1: { name: member1.name, id: member1._id },
      member2: { name: member2.name, id: member2._id }
    });
  } catch (err) {
    console.error('Get relationship between error:', err);
    res.status(500).json({ error: 'Failed to get relationship' });
  }
});

// Helper function to get relationship label
function getRelationshipLabel(person1, person2, allMembers) {
  // Check if person2 is parent of person1
  if (person1.relationships?.parents?.some(p => p.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Father' : 'Mother';
  }

  // Check if person2 is child of person1
  const person1Children = allMembers.filter(m =>
    m.relationships?.parents?.some(p => p.toString() === person1._id.toString())
  );
  
  if (person1Children.some(c => c._id.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Son' : 'Daughter';
  }

  // Check if person2 is sibling of person1
  const person1Siblings = allMembers.filter(m => {
    if (m._id.toString() === person1._id.toString()) return false;
    
    const person1ParentIds = person1.relationships?.parents || [];
    const person2ParentIds = m.relationships?.parents || [];
    
    return person1ParentIds.some(p1Id =>
      person2ParentIds.some(p2Id => p2Id.toString() === p1Id.toString())
    );
  });

  if (person1Siblings.some(s => s._id.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Brother' : 'Sister';
  }

  // Check if person2 is spouse of person1
  if (person1.relationships?.spouses?.some(s => s.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Husband' : 'Wife';
  }

  // Check if person2 is grandparent of person1
  if (person1.relationships?.parents?.length > 0) {
    const parents = allMembers.filter(m => 
      person1.relationships.parents.some(pId => pId.toString() === m._id.toString())
    );
    
    const grandparents = new Set();
    parents.forEach(parent => {
      if (parent.relationships?.parents) {
        parent.relationships.parents.forEach(gpId => {
          grandparents.add(gpId.toString());
        });
      }
    });
    
    if (grandparents.has(person2._id.toString())) {
      return person2.gender === 'male' ? 'Grandfather' : 'Grandmother';
    }
  }

  return null;
}

module.exports = router;