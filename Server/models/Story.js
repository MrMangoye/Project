const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['memory', 'achievement', 'history', 'recipe', 'tradition'],
    default: 'memory'
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  relatedPersons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  tags: [{ type: String }],
  images: [{ type: String }],
  videos: [{ type: String }],
  location: { type: String },
  year: { type: Number },
  privacy: { 
    type: String, 
    enum: ['public', 'family-only', 'private'],
    default: 'family-only'
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true }
    // removed createdAt since schema timestamps already handle this
  }]
}, { timestamps: true });

// Indexes (removed duplicate familyId-only index)
storySchema.index({ title: 'text', content: 'text' });
storySchema.index({ familyId: 1, createdAt: -1 });
storySchema.index({ type: 1 });
storySchema.index({ tags: 1 });

module.exports = mongoose.model('Story', storySchema);