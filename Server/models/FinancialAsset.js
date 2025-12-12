const mongoose = require('mongoose');

const financialAssetSchema = new mongoose.Schema({
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  type: { 
    type: String, 
    enum: ['property', 'vehicle', 'investment', 'bank_account', 'business', 'valuable'],
    required: true 
  },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  ownership: [{
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    percentage: { type: Number, min: 0, max: 100 }
  }],
  details: {
    address: String,
    mortgage: {
      lender: String,
      balance: Number,
      monthlyPayment: Number,
      interestRate: Number,
      term: Number
    },
    insurance: {
      provider: String,
      policyNumber: String,
      annualPremium: Number,
      renewalDate: Date
    },
    make: String,
    model: String,
    year: Number,
    vin: String,
    registration: {
      number: String,
      expiry: Date,
      state: String
    }
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date,
    encrypted: Boolean
  }],
  maintenance: [{
    task: String,
    frequency: String,
    lastCompleted: Date,
    nextDue: Date,
    cost: Number,
    provider: String
  }],
  taxImplications: {
    deductible: Boolean,
    depreciation: Number,
    taxBracket: String
  }
}, { timestamps: true });

module.exports = mongoose.model('FinancialAsset', financialAssetSchema);