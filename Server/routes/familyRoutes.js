const express = require('express');
const router = express.Router();

// ✅ Corrected import paths
const Family = require('../models/Family');
const Person = require('../models/Person');
const auth = require('../middleware/authMiddleware');

// Create a new family (protected)
router.post('/create', auth, async (req, res) => {
  const { name } = req.body;

  try {
    const family = await Family.create({ name, createdBy: req.user._id });
    res.json(family);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create family' });
  }
});

// Add a member to a family (protected)
router.post('/add-member', auth, async (req, res) => {
  const { name, dob, gender, occupation, familyId, relationships, business } = req.body;

  try {
    // Create the new person
    const person = await Person.create({
      name,
      dob,
      gender,
      occupation,
      familyId,
      relationships,
      business,
      createdBy: req.user.id
    });

    // Add to family
    await Family.findByIdAndUpdate(familyId, { $push: { members: person._id } });

    // Handle parent relationships
    if (relationships?.parent?.length > 0) {
      for (let parentId of relationships.parent) {
        await Person.findByIdAndUpdate(parentId, { $addToSet: { child: person._id } });

        const parent = await Person.findById(parentId).populate('child');
        for (let sibling of parent.child) {
          if (sibling._id.toString() !== person._id.toString()) {
            await Person.findByIdAndUpdate(person._id, { $addToSet: { sibling: sibling._id } });
            await Person.findByIdAndUpdate(sibling._id, { $addToSet: { sibling: person._id } });
          }
        }
      }
    }

    // Handle spouse relationships
    if (relationships?.spouse?.length > 0) {
      for (let spouseId of relationships.spouse) {
        await Person.findByIdAndUpdate(spouseId, { $addToSet: { spouse: person._id } });
        await Person.findByIdAndUpdate(person._id, { $addToSet: { spouse: spouseId } });
      }
    }

    res.json(person);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

/* -------------------- EXTRA ROUTES -------------------- */

// Get a family by ID (with members populated)
router.get('/families/:id', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.id).populate('members');
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch family' });
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
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Update family details
router.put('/families/:id', auth, async (req, res) => {
  try {
    const family = await Family.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json(family);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update family' });
  }
});

// Update member details
router.put('/members/:id', auth, async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!person) return res.status(404).json({ error: 'Member not found' });
    res.json(person);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete a family
router.delete('/families/:id', auth, async (req, res) => {
  try {
    const family = await Family.findByIdAndDelete(req.params.id);
    if (!family) return res.status(404).json({ error: 'Family not found' });
    res.json({ message: 'Family deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete family' });
  }
});

// Delete a member
router.delete('/members/:id', auth, async (req, res) => {
  try {
    const person = await Person.findByIdAndDelete(req.params.id);
    if (!person) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;