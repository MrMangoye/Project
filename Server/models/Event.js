const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['birthday', 'anniversary', 'reunion', 'holiday', 'custom'],
    required: true
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  relatedPersons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reminders: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reminded: { type: Boolean, default: false }
  }],
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { type: String },
  attachments: [{ type: String }],
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, { timestamps: true });

eventSchema.index({ familyId: 1, date: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);