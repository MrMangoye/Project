const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Family = require('../models/Family');
const Person = require('../models/Person');
const User = require('../models/User');
const Event = require('../models/Event');
const Story = require('../models/Story');
const { validateFamilyCreate, validateMemberAdd } = require('../middleware/validation');

// Create family
router.post('/create', auth, validateFamilyCreate, async (req, res) => {
  try {
    const { name, description, motto, origin } = req.body;
    
    const existingUser = await User.findById(req.user._id);
    if (existingUser.familyId) {
      return res.status(400).json({ 
        error: 'You already belong to a family' 
      });
    }

    const family = await Family.create({
      name,
      description,
      motto,
      origin,
      createdBy: req.user._id,
      admins: [req.user._id]
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        familyId: family._id,
        role: 'admin',
        isFamilyAdmin: true,
        familyJoinDate: new Date()
      },
      { new: true }
    ).select('-password');

    const person = await Person.create({
      name: updatedUser.name,
      email: updatedUser.email,
      contactInfo: {
        email: updatedUser.email,
        phone: updatedUser.phone
      },
      familyId: family._id,
      createdBy: req.user._id,
      isSelf: true
    });

    family.members.push(person._id);
    await family.save();

    res.status(201).json({
      success: true,
      message: 'Family created successfully',
      family,
      user: updatedUser,
      person
    });
  } catch (err) {
    console.error('Create family error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Family name already exists' });
    }
    res.status(500).json({ error: 'Failed to create family' });
  }
});

// Get family with details - FIXED PATH: remove "/families" prefix
router.get('/:id', auth, async (req, res) => {
  try {
    console.log(`GET /api/families/${req.params.id} called`);
    console.log('User:', req.user._id);
    
    const family = await Family.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('admins', 'name email')
      .populate({
        path: 'members',
        populate: [
          { path: 'relationships.parents', select: 'name dob' },
          { path: 'relationships.spouses', select: 'name dob' },
          { path: 'relationships.children', select: 'name dob' }
        ]
      });

    if (!family) {
      console.log('Family not found:', req.params.id);
      return res.status(404).json({ error: 'Family not found' });
    }

    console.log('Family found:', family.name);
    
    const user = await User.findById(req.user._id);
    if (user.familyId.toString() !== family._id.toString()) {
      console.log('Access denied - user not in family');
      return res.status(403).json({ error: 'Access denied' });
    }

    // Format the response for frontend
    const response = {
      _id: family._id,
      name: family.name,
      description: family.description || '',
      motto: family.motto || '',
      origin: family.origin || '',
      memberCount: family.members?.length || 0,
      members: family.members || [],
      createdBy: family.createdBy,
      admins: family.admins,
      createdAt: family.createdAt,
      updatedAt: family.updatedAt
    };

    console.log('Sending family response:', response);
    
    res.json({
      success: true,
      family: response
    });
  } catch (err) {
    console.error('Get family error:', err);
    res.status(500).json({ error: 'Failed to fetch family', details: err.message });
  }
});

// Join family
router.post('/join/:familyId', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const user = await User.findById(req.user._id);
    
    if (family.settings?.requireApproval) {
      family.pendingMembers = family.pendingMembers || [];
      family.pendingMembers.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        requestedAt: new Date()
      });
      await family.save();
      
      return res.json({
        success: true,
        message: 'Request sent. Waiting for admin approval.',
        needsApproval: true
      });
    }

    user.familyId = family._id;
    user.familyJoinDate = new Date();
    await user.save();

    const person = await Person.create({
      name: user.name,
      email: user.email,
      familyId: family._id,
      createdBy: req.user._id,
      isSelf: true
    });

    family.members.push(person._id);
    await family.save();

    res.json({
      success: true,
      message: 'Successfully joined family',
      familyId: family._id,
      user: user
    });
  } catch (err) {
    console.error('Join family error:', err);
    res.status(500).json({ error: 'Failed to join family' });
  }
});

// Add member
router.post('/add-member', auth, validateMemberAdd, async (req, res) => {
  try {
    const { 
      name, dob, gender, occupation, bio, 
      familyId, relationships, business, contactInfo,
      education, achievements
    } = req.body;

    const family = await Family.findById(familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.familyId.toString() !== familyId.toString()) {
      return res.status(403).json({ error: 'You can only add members to your own family' });
    }

    const person = await Person.create({
      name,
      dob,
      gender,
      occupation,
      bio,
      familyId,
      relationships: relationships || {},
      business: business || {},
      contactInfo: contactInfo || {},
      education: education || [],
      achievements: achievements || [],
      createdBy: req.user._id,
      addedBy: req.user._id
    });

    family.members.push(person._id);
    await family.save();

    await updateRelationships(person, relationships);

    const populatedPerson = await Person.findById(person._id)
      .populate('relationships.parents', 'name dob gender')
      .populate('relationships.spouses', 'name dob gender')
      .populate('relationships.children', 'name dob gender')
      .populate('relationships.siblings', 'name dob gender');

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      person: populatedPerson
    });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Helper function to update relationships
async function updateRelationships(person, relationships) {
  if (!relationships) return;

  if (relationships.parents && relationships.parents.length > 0) {
    for (const parentId of relationships.parents) {
      await Person.findByIdAndUpdate(parentId, {
        $addToSet: { 'relationships.children': person._id }
      });
    }
  }

  if (relationships.spouses && relationships.spouses.length > 0) {
    for (const spouseId of relationships.spouses) {
      await Person.findByIdAndUpdate(spouseId, {
        $addToSet: { 'relationships.spouses': person._id }
      });
    }
  }

  if (relationships.siblings && relationships.siblings.length > 0) {
    for (const siblingId of relationships.siblings) {
      await Person.findByIdAndUpdate(siblingId, {
        $addToSet: { 'relationships.siblings': person._id }
      });
    }
  }
}

// Get family tree with relationships - FIXED PATH: remove "/families" prefix
router.get('/:id/tree-with-relations', auth, async (req, res) => {
  try {
    console.log(`GET /api/families/${req.params.id}/tree-with-relations called`);
    
    const family = await Family.findById(req.params.id).populate('members');
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Check if user belongs to this family
    const user = await User.findById(req.user._id);
    if (user.familyId.toString() !== family._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const membersWithRelations = await Promise.all(
      family.members.map(async (member) => {
        const relationships = await calculateRelationships(member._id, family.members);
        
        const relationLabels = {};
        for (const otherMember of family.members) {
          if (otherMember._id.toString() === member._id.toString()) continue;
          
          const relation = getRelationshipLabel(member, otherMember, family.members);
          if (relation) {
            relationLabels[otherMember._id] = relation;
          }
        }
        
        return {
          ...member.toObject(),
          calculatedRelationships: relationships,
          relationLabels,
          isSelf: member._id.toString() === req.user._id.toString()
        };
      })
    );

    res.json({
      success: true,
      members: membersWithRelations,
      familyId: family._id,
      familyName: family.name
    });
  } catch (err) {
    console.error('Tree with relations error:', err);
    res.status(500).json({ error: 'Failed to generate family tree with relations' });
  }
});

// Calculate relationships for a person
async function calculateRelationships(personId, allMembers) {
  const person = allMembers.find(m => m._id.toString() === personId.toString());
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

  if (person.relationships?.parents) {
    relationships.parents = person.relationships.parents;
  }

  relationships.children = allMembers.filter(member => 
    member.relationships?.parents?.some(parentId => 
      parentId.toString() === personId.toString()
    )
  ).map(m => m._id);

  if (person.relationships?.parents?.length > 0) {
    relationships.siblings = allMembers.filter(member => {
      if (member._id.toString() === personId.toString()) return false;
      return member.relationships?.parents?.some(parentId => 
        person.relationships.parents.some(pId => 
          pId.toString() === parentId.toString()
        )
      );
    }).map(m => m._id);
  }

  if (person.relationships?.spouses) {
    relationships.spouses = person.relationships.spouses;
  }

  return relationships;
}

// Get relationship label between two people
function getRelationshipLabel(person1, person2, allMembers) {
  if (person1.relationships?.parents?.some(p => p.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Father' : 'Mother';
  }
  
  const person1Children = allMembers.filter(m => 
    m.relationships?.parents?.some(p => p.toString() === person1._id.toString())
  );
  if (person1Children.some(c => c._id.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Son' : 'Daughter';
  }
  
  const person1Siblings = allMembers.filter(m => {
    if (m._id.toString() === person1._id.toString()) return false;
    return m.relationships?.parents?.some(p => 
      person1.relationships?.parents?.some(p1 => p1.toString() === p.toString())
    );
  });
  
  if (person1Siblings.some(s => s._id.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Brother' : 'Sister';
  }
  
  if (person1.relationships?.spouses?.some(s => s.toString() === person2._id.toString())) {
    return person2.gender === 'male' ? 'Husband' : 'Wife';
  }
  
  return null;
}

// Get member
router.get('/members/:id', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('familyId', 'name')
      .populate('relationships.parents')
      .populate('relationships.children')
      .populate('relationships.spouses')
      .populate('relationships.siblings')
      .populate('createdBy', 'name email');

    if (!person) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.familyId.toString() !== person.familyId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      person
    });
  } catch (err) {
    console.error('Get member error:', err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Search members
router.get('/members/search', auth, async (req, res) => {
  try {
    const { query, familyId } = req.query;
    
    if (!familyId) {
      return res.status(400).json({ error: 'Family ID is required' });
    }

    const searchConditions = {
      familyId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { occupation: { $regex: query, $options: 'i' } },
        { 'business.name': { $regex: query, $options: 'i' } }
      ]
    };

    const members = await Person.find(searchConditions)
      .select('name dob gender occupation business')
      .limit(20);

    res.json({
      success: true,
      results: members
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Update member relationships
router.post('/members/:id/update-relationships', auth, async (req, res) => {
  try {
    const { relationships } = req.body;
    const person = await Person.findById(req.params.id);
    
    person.relationships = relationships;
    await person.save();
    
    if (relationships.parents) {
      for (const parentId of relationships.parents) {
        await Person.findByIdAndUpdate(parentId, {
          $addToSet: { 'relationships.children': person._id }
        });
      }
    }
    
    if (relationships.spouses) {
      for (const spouseId of relationships.spouses) {
        await Person.findByIdAndUpdate(spouseId, {
          $addToSet: { 'relationships.spouses': person._id }
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Relationships updated successfully',
      person
    });
  } catch (err) {
    console.error('Update relationships error:', err);
    res.status(500).json({ error: 'Failed to update relationships' });
  }
});

module.exports = router;