const express = require('express');
const router = express.Router();

const Family = require('../models/Family');
const Person = require('../models/Person');
const auth = require('../middleware/authMiddleware');

/* -------------------- FAMILY ROUTES -------------------- */

// Create a new family (protected)
router.post('/create', auth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const family = await Family.create({
      name,
      description,
      createdBy: req.user._id
    });

    // ✅ Update the user with familyId
    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { familyId: family._id },
      { new: true }
    ).select('-password');

    // ✅ Ensure the user is added to the family members list
    if (!family.members.includes(updatedUser._id)) {
      family.members.push(updatedUser._id);
      await family.save();
    }

    res.json({ message: 'Family created successfully', family, user: updatedUser });
  } catch (err) {
    console.error("Create family error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to create family' });
  }
});

// Get a family by ID (with members populated)
router.get('/families/:id', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.id).populate('members');
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (err) {
    console.error("Fetch family error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch family' });
  }
});

// Update family details
router.put('/families/:id', auth, async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (err) {
    console.error("Update family error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to update family' });
  }
});

// Delete a family
router.delete('/families/:id', auth, async (req, res) => {
  try {
    const family = await Family.findByIdAndDelete(req.params.id);
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json({ message: 'Family deleted successfully' });
  } catch (err) {
    console.error("Delete family error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete family' });
  }
});

/* -------------------- MEMBER ROUTES -------------------- */

// Add a member to a family (protected)
router.post('/add-member', auth, async (req, res) => {
  const { name, dob, gender, occupation, familyId, relationships, business } = req.body;

  try {
    const person = await Person.create({
      name,
      dob,
      gender,
      occupation,
      familyId,
      relationships,
      business,
      createdBy: req.user._id
    });

    // Add to family
    await Family.findByIdAndUpdate(familyId, { $addToSet: { members: person._id } });

    // Handle parent relationships
    if (relationships?.parent?.length) {
      for (let parentId of relationships.parent) {
        await Person.findByIdAndUpdate(parentId, { $addToSet: { child: person._id } });

        const parent = await Person.findById(parentId).populate('child');
        if (parent?.child?.length) {
          for (let sibling of parent.child) {
            if (sibling._id.toString() !== person._id.toString()) {
              await Person.findByIdAndUpdate(person._id, { $addToSet: { sibling: sibling._id } });
              await Person.findByIdAndUpdate(sibling._id, { $addToSet: { sibling: person._id } });
            }
          }
        }
      }
    }

    // Handle spouse relationships
    if (relationships?.spouse?.length) {
      for (let spouseId of relationships.spouse) {
        await Person.findByIdAndUpdate(spouseId, { $addToSet: { spouse: person._id } });
        await Person.findByIdAndUpdate(person._id, { $addToSet: { spouse: spouseId } });
      }
    }

    // ✅ Handle sibling relationships
    if (relationships?.sibling?.length) {
      for (let siblingId of relationships.sibling) {
        await Person.findByIdAndUpdate(siblingId, { $addToSet: { sibling: person._id } });
        await Person.findByIdAndUpdate(person._id, { $addToSet: { sibling: siblingId } });
      }
    }

    res.json(person);
  } catch (err) {
    console.error("Add member error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get a member by ID (with relationships populated)
router.get('/members/:id', auth, async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('familyId')
      .populate('relationships.parent')
      .populate('relationships.child')
      .populate('relationships.spouse')
      .populate('relationships.sibling');

    if (!person) return res.status(404).json({ error: 'Member not found' });
    res.json(person);
  } catch (err) {
    console.error("Fetch member error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Update member details
router.put('/members/:id', auth, async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!person) return res.status(404).json({ error: 'Member not found' });
    res.json(person);
  } catch (err) {
    console.error("Update member error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete a member
router.delete('/members/:id', auth, async (req, res) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error("Delete member error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Join an existing family (protected)
router.post('/join/:familyId', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { familyId: family._id },
      { new: true }
    ).select('-password');

    if (!family.members.includes(updatedUser._id)) {
      family.members.push(updatedUser._id);
      await family.save();
    }

    res.json({ message: 'Joined family successfully', user: updatedUser });
  } catch (err) {
    console.error("Join family error:", err.message, err.stack);
    res.status(500).json({ error: 'Failed to join family' });
  }
});

module.exports = router;