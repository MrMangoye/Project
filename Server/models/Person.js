const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  dob: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  dod: { type: Date },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'other'
  },
  occupation: String,
  bio: { type: String, maxlength: 1000 },
  profileImage: { type: String },
  contactInfo: {
    email: { type: String, lowercase: true },
    phone: { type: String },
    address: { type: String }
  },
  education: [{
    institution: String,
    degree: String,
    year: Number
  }],
  achievements: [{
    title: String,
    description: String,
    year: Number
  }],
  relationships: {
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    spouses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
    siblings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }]
  },
  business: {
    name: String,
    industry: String,
    position: String,
    contact: String,
    website: String,
    description: String,
    founded: Number
  },
  socialMedia: {
    facebook: String,
    linkedin: String,
    twitter: String,
    instagram: String
  },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true,
    index: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isSelf: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relationshipVerified: { type: Boolean, default: false },
  relationshipNotes: String,
  isAlive: { type: Boolean, default: true },
  tags: [{ type: String }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age calculation
personSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for full address
personSchema.virtual('fullAddress').get(function() {
  return this.contactInfo?.address || 'Address not specified';
});

// Middleware to update isAlive based on dod
personSchema.pre('save', function(next) {
  if (this.dod) {
    this.isAlive = false;
  }
  next();
});

// Indexes
personSchema.index({ name: 'text', occupation: 'text', 'business.name': 'text' });
personSchema.index({ familyId: 1, dob: 1 });
personSchema.index({ tags: 1 });
personSchema.index({ isSelf: 1 });

module.exports = mongoose.model('Person', personSchema);