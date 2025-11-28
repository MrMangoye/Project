const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  description: { type: String }
}, { timestamps: true });

familySchema.index({ createdBy: 1 });
familySchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Family', familySchema);