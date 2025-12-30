const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['income', 'expense'],
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'housing', 'transportation', 'food', 'health', 'education',
      'entertainment', 'shopping', 'travel', 'utilities', 'other',
      'salary', 'business', 'investment', 'gift', 'other_income'
    ],
    default: 'other'
  },
  date: { type: Date, default: Date.now },
  description: { type: String },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  paidBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Person' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recurring: { type: Boolean, default: false },
  recurringFrequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'yearly'] 
  },
  splitBetween: [{
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    amount: Number,
    percentage: Number
  }],
  attachments: [{ type: String }],
  tags: [{ type: String }]
}, { timestamps: true });

const budgetSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: [
      'housing', 'transportation', 'food', 'health', 'education',
      'entertainment', 'shopping', 'travel', 'utilities', 'other'
    ],
    required: true 
  },
  amount: { type: Number, required: true },
  period: { 
    type: String, 
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: { type: String },
  notifications: { type: Boolean, default: true },
  exceeded: { type: Boolean, default: false }
}, { timestamps: true });

const financialGoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['savings', 'vacation', 'education', 'home', 'vehicle', 'wedding', 'retirement', 'other'],
    default: 'savings'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  contributors: [{
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    contributed: { type: Number, default: 0 }
  }],
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

const sharedExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  description: { type: String },
  splitType: { 
    type: String, 
    enum: ['equal', 'percentage', 'custom'],
    default: 'equal'
  },
  shares: [{
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
    amount: Number,
    percentage: Number,
    paid: { type: Boolean, default: false }
  }],
  date: { type: Date, default: Date.now },
  familyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Family', 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'partially_paid', 'paid', 'cancelled'],
    default: 'pending'
  },
  paidBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Person' 
  }
}, { timestamps: true });

// Indexes
transactionSchema.index({ familyId: 1, date: -1 });
transactionSchema.index({ familyId: 1, category: 1 });
transactionSchema.index({ familyId: 1, type: 1 });
transactionSchema.index({ paidBy: 1 });

budgetSchema.index({ familyId: 1, category: 1 });
budgetSchema.index({ familyId: 1, startDate: 1, endDate: 1 });

financialGoalSchema.index({ familyId: 1, deadline: 1 });
financialGoalSchema.index({ familyId: 1, status: 1 });

sharedExpenseSchema.index({ familyId: 1, status: 1 });
sharedExpenseSchema.index({ familyId: 1, date: -1 });

module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  Budget: mongoose.model('Budget', budgetSchema),
  FinancialGoal: mongoose.model('FinancialGoal', financialGoalSchema),
  SharedExpense: mongoose.model('SharedExpense', sharedExpenseSchema)
};