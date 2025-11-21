const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
}, { timestamps: true });

module.exports = mongoose.model('Family', familySchema);