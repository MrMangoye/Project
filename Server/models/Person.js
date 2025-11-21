const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: String,
  dob: Date,
  gender: String,
  occupation: String,
  relationships: {
    parent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    child: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    spouse: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    sibling: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
  },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' }
});

module.exports = mongoose.model('Person', personSchema);