const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  type: { 
    type: String, 
    enum: ['appointment', 'medication', 'condition', 'vaccination', 'test_result'],
    required: true 
  },
  appointment: {
    date: Date,
    doctor: String,
    specialty: String,
    location: String,
    reason: String,
    notes: String,
    followUpRequired: Boolean,
    followUpDate: Date
  },
  medication: {
    name: String,
    dosage: String,
    frequency: String,
    purpose: String,
    prescribingDoctor: String,
    pharmacy: String,
    refills: Number,
    startDate: Date,
    endDate: Date,
    sideEffects: [String],
    reminders: [{
      time: String,
      days: [String],
      enabled: Boolean
    }]
  },
  condition: {
    name: String,
    diagnosed: Date,
    severity: String,
    status: String,
    symptoms: [String],
    treatment: String,
    specialist: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    deductible: {
      individual: Number,
      family: Number,
      met: Number
    },
    outOfPocket: {
      max: Number,
      met: Number
    },
    copay: {
      primary: Number,
      specialist: Number,
      emergency: Number
    }
  },
  emergencyInfo: {
    allergies: [String],
    bloodType: String,
    organDonor: Boolean,
    dnr: Boolean,
    primaryContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  caregivers: [{
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    relationship: String,
    responsibilities: [String],
    schedule: {
      days: [String],
      hours: String
    },
    contact: {
      phone: String,
      email: String
    }
  }],
  privacy: {
    level: { type: String, enum: ['private', 'family', 'caregivers', 'emergency'], default: 'private' },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);