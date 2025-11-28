const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: Date,
  gender: String,
  occupation: String,
  relationships: {
    parent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    child: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    spouse: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    sibling: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
  },
  // ✅ Added business field
  business: {
    name: String,
    industry: String,
    contact: String
  },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

personSchema.index({ familyId: 1 });

module.exports = mongoose.model('Person', personSchema);