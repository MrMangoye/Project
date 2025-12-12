const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Family name is required'],
    trim: true,
    unique: true
  },
  description: { type: String, maxlength: 500 },
  motto: { type: String, maxlength: 100 },
  origin: {
    country: String,
    region: String,
    city: String
  },
  established: { type: Number },
  familyTreeData: { type: mongoose.Schema.Types.Mixed },
  coverImage: { type: String },
  profileImage: { type: String },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingMembers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  }],
  settings: {
    privacy: { 
      type: String, 
      enum: ['private', 'public', 'invite-only'],
      default: 'private'
    },
    allowMemberAdd: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false }
  },
  statistics: {
    totalMembers: { type: Number, default: 0 },
    averageAge: { type: Number, default: 0 },
    oldestMember: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    youngestMember: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' }
  },
  invitations: [{
    email: String,
    token: String,
    role: String,
    expires: Date,
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' }
  }],
  accessCode: { type: String, unique: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate access code before saving
familySchema.pre('save', function(next) {
  if (!this.accessCode) {
    this.accessCode = require('crypto').randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

// Virtual for member count
familySchema.virtual('memberCount').get(function() {
  return this.members?.length || 0;
});

// Indexes
familySchema.index({ name: 'text', description: 'text' });
familySchema.index({ createdBy: 1 });
familySchema.index({ 'settings.privacy': 1 });
familySchema.index({ createdAt: -1 });
familySchema.index({ accessCode: 1 }, { unique: true });

module.exports = mongoose.model('Family', familySchema);