const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Family = require('../models/Family');
const Person = require('../models/Person');
const User = require('../models/User');
const { validateFamilyCreate, validateMemberAdd } = require('../middleware/validation');

// Helper function to update relationships bidirectionally
async function updateRelationships(person, relationships) {
  if (!relationships) return;

  // Update parents (and their children)
  if (relationships.parents && relationships.parents.length > 0) {
    for (const parentId of relationships.parents) {
      await Person.findByIdAndUpdate(parentId, {
        $addToSet: { 'relationships.children': person._id }
      });
    }
  }

  // Update spouses (bidirectional)
  if (relationships.spouses && relationships.spouses.length > 0) {
    for (const spouseId of relationships.spouses) {
      await Person.findByIdAndUpdate(spouseId, {
        $addToSet: { 'relationships.spouses': person._id }
      });
    }
  }

  // Update siblings (bidirectional)
  if (relationships.siblings && relationships.siblings.length > 0) {
    for (const siblingId of relationships.siblings) {
      await Person.findByIdAndUpdate(siblingId, {
        $addToSet: { 'relationships.siblings': person._id }
      });
    }
  }

  // Update children (and their parents)
  if (relationships.children && relationships.children.length > 0) {
    for (const childId of relationships.children) {
      await Person.findByIdAndUpdate(childId, {
        $addToSet: { 'relationships.parents': person._id }
      });
    }
  }
}

// === ADD DEBUGGING LOGS FOR ALL ROUTES ===

// Create family
router.post('/create', auth, validateFamilyCreate, async (req, res) => {
  try {
    console.log('Creating family with data:', req.body);
    
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
    
    console.log('Family created successfully:', family._id);
    
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

// Get family with details
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Getting family:', req.params.id);
    
    const family = await Family.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('admins', 'name email')
      .populate({
        path: 'members',
        populate: [
          { path: 'relationships.parents', select: 'name dob' },
          { path: 'relationships.spouses', select: 'name dob' },
          { path: 'relationships.children', select: 'name dob' },
          { path: 'relationships.siblings', select: 'name dob' }
        ]
      });
    
    if (!family) {
      console.log('Family not found:', req.params.id);
      return res.status(404).json({ error: 'Family not found' });
    }
    
    const user = await User.findById(req.user._id);
    if (user.familyId.toString() !== family._id.toString()) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ error: 'Access denied' });
    }
    
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
    console.log('Joining family:', req.params.familyId);
    
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
    
    console.log('User joined family:', user._id);
    
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

// Add member - WITH ENHANCED DEBUGGING
router.post('/add-member', auth, (req, res, next) => {
  console.log('🚨 === ADD MEMBER REQUEST START === 🚨');
  console.log('Request received at:', new Date().toISOString());
  console.log('User ID:', req.user?._id);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('=== END REQUEST LOG ===');
  next();
}, validateMemberAdd, async (req, res) => {
  try {
    console.log('✅ Validation passed, processing add member...');
    
    const {
      name, dob, gender, occupation, bio,
      familyId, relationships, business, contactInfo,
      education, achievements
    } = req.body;
    
    console.log('Processing data:', {
      name, familyId, hasRelationships: !!relationships
    });
    
    // Additional validation
    if (!name || name.trim().length < 2) {
      console.log('❌ Name validation failed');
      return res.status(400).json({ 
        error: 'Name must be at least 2 characters' 
      });
    }
    
    if (!familyId) {
      console.log('❌ Family ID missing');
      return res.status(400).json({ 
        error: 'Family ID is required' 
      });
    }
    
    console.log('Looking for family:', familyId);
    const family = await Family.findById(familyId);
    if (!family) {
      console.log('❌ Family not found:', familyId);
      return res.status(404).json({ error: 'Family not found' });
    }
    
    console.log('Family found:', family.name);
    
    console.log('Checking user access...');
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User familyId:', user.familyId);
    console.log('Target familyId:', familyId);
    
    if (user.familyId.toString() !== familyId.toString()) {
      console.log('❌ Access denied: user not in family');
      return res.status(403).json({ 
        error: 'You can only add members to your own family' 
      });
    }
    
    console.log('✅ Access granted. Creating person...');
    
    // Prepare person data
    const personData = {
      name: name.trim(),
      familyId,
      createdBy: req.user._id,
      addedBy: req.user._id,
      isSelf: false
    };
    
    // Add optional fields
    if (dob) {
      personData.dob = new Date(dob);
      console.log('Adding DOB:', personData.dob);
    }
    if (gender) personData.gender = gender;
    if (occupation && occupation.trim()) personData.occupation = occupation.trim();
    if (bio && bio.trim()) personData.bio = bio.trim();
    if (relationships) {
      personData.relationships = relationships;
      console.log('Relationships:', relationships);
    }
    if (business && Object.keys(business).length > 0) personData.business = business;
    if (contactInfo && Object.keys(contactInfo).length > 0) personData.contactInfo = contactInfo;
    if (education && education.length > 0) personData.education = education;
    if (achievements && achievements.length > 0) personData.achievements = achievements;
    
    console.log('Creating person with data:', personData);
    
    const person = await Person.create(personData);
    console.log('✅ Person created:', person._id);
    
    // Add to family
    family.members.push(person._id);
    await family.save();
    console.log('✅ Added to family members');
    
    // Update relationships if provided
    if (relationships) {
      console.log('Updating relationships...');
      await updateRelationships(person, relationships);
    }
    
    // Populate response
    const populatedPerson = await Person.findById(person._id)
      .populate('relationships.parents', 'name dob gender')
      .populate('relationships.spouses', 'name dob gender')
      .populate('relationships.children', 'name dob gender')
      .populate('relationships.siblings', 'name dob gender');
    
    console.log('✅ Sending success response');
    
    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      person: populatedPerson
    });
    
  } catch (err) {
    console.error('❌ Add member error:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
    
    // Handle specific errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      console.log('Mongoose validation errors:', errors);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }
    
    if (err.code === 11000) {
      console.log('Duplicate key error:', err.keyValue);
      return res.status(400).json({ 
        error: 'Duplicate entry',
        details: err.keyValue
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to add member',
      details: err.message 
    });
  }
});

// Get family tree with relationships
router.get('/:id/tree-with-relations', auth, async (req, res) => {
  try {
    console.log('Getting family tree:', req.params.id);
    
    const family = await Family.findById(req.params.id).populate('members');
    
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    const user = await User.findById(req.user._id);
    if (user.familyId.toString() !== family._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Helper function for this route
    const getRelationshipLabel = (person1, person2, allMembers) => {
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
        
        const person1ParentIds = person1.relationships?.parents || [];
        const person2ParentIds = m.relationships?.parents || [];
        
        return person1ParentIds.some(p1Id =>
          person2ParentIds.some(p2Id => p2Id.toString() === p1Id.toString())
        );
      });
      
      if (person1Siblings.some(s => s._id.toString() === person2._id.toString())) {
        return person2.gender === 'male' ? 'Brother' : 'Sister';
      }
      
      if (person1.relationships?.spouses?.some(s => s.toString() === person2._id.toString())) {
        return person2.gender === 'male' ? 'Husband' : 'Wife';
      }
      
      return null;
    };
    
    const membersWithRelations = await Promise.all(
      family.members.map(async (member) => {
        const allMembers = family.members;
        const relationships = {
          parents: [],
          children: [],
          siblings: [],
          spouses: []
        };
        
        if (member.relationships?.parents) {
          relationships.parents = member.relationships.parents;
        }
        
        if (member.relationships?.spouses) {
          relationships.spouses = member.relationships.spouses;
        }
        
        // Calculate children
        relationships.children = allMembers.filter(m =>
          m.relationships?.parents?.some(pId => pId.toString() === member._id.toString())
        ).map(m => m._id);
        
        // Calculate siblings
        if (member.relationships?.parents?.length > 0) {
          relationships.siblings = allMembers.filter(m => {
            if (m._id.toString() === member._id.toString()) return false;
            return m.relationships?.parents?.some(parentId =>
              member.relationships.parents.some(pId => pId.toString() === parentId.toString())
            );
          }).map(m => m._id);
        }
        
        const relationLabels = {};
        for (const otherMember of allMembers) {
          if (otherMember._id.toString() === member._id.toString()) continue;
          
          const relation = getRelationshipLabel(member, otherMember, allMembers);
          if (relation) {
            relationLabels[otherMember._id] = relation;
          }
        }
        
        return {
          ...member.toObject(),
          relationships: relationships,
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

// Get member
router.get('/members/:id', auth, async (req, res) => {
  try {
    console.log('Getting member:', req.params.id);
    
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
    console.log('Searching members:', req.query);
    
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
    console.log('Updating relationships for:', req.params.id);
    
    const { relationships } = req.body;
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    // First, remove old relationships bidirectionally
    const oldRelationships = person.relationships || {};
    
    // Remove from old parents' children
    if (oldRelationships.parents) {
      for (const parentId of oldRelationships.parents) {
        await Person.findByIdAndUpdate(parentId, {
          $pull: { 'relationships.children': person._id }
        });
      }
    }
    
    // Remove from old spouses
    if (oldRelationships.spouses) {
      for (const spouseId of oldRelationships.spouses) {
        await Person.findByIdAndUpdate(spouseId, {
          $pull: { 'relationships.spouses': person._id }
        });
      }
    }
    
    // Remove from old siblings
    if (oldRelationships.siblings) {
      for (const siblingId of oldRelationships.siblings) {
        await Person.findByIdAndUpdate(siblingId, {
          $pull: { 'relationships.siblings': person._id }
        });
      }
    }
    
    // Remove from old children's parents
    if (oldRelationships.children) {
      for (const childId of oldRelationships.children) {
        await Person.findByIdAndUpdate(childId, {
          $pull: { 'relationships.parents': person._id }
        });
      }
    }
    
    // Update person's relationships
    person.relationships = relationships || {};
    await person.save();
    
    // Add new relationships bidirectionally
    await updateRelationships(person, relationships);
    
    const updatedPerson = await Person.findById(person._id)
      .populate('relationships.parents', 'name dob gender')
      .populate('relationships.spouses', 'name dob gender')
      .populate('relationships.children', 'name dob gender')
      .populate('relationships.siblings', 'name dob gender');
    
    res.json({
      success: true,
      message: 'Relationships updated successfully',
      person: updatedPerson
    });
  } catch (err) {
    console.error('Update relationships error:', err);
    res.status(500).json({ error: 'Failed to update relationships', details: err.message });
  }
});

module.exports = router;