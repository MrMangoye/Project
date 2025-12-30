const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { Transaction, Budget, FinancialGoal, SharedExpense } = require('../models/Finance');
const Family = require('../models/Family');
const Person = require('../models/Person');

// Get all finance data for family
router.get('/families/:id/finance', auth, async (req, res) => {
  try {
    const familyId = req.params.id;
    
    // Get family members
    const family = await Family.findById(familyId).populate('members');
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    // Get all data
    const [transactions, budgets, goals, sharedExpenses] = await Promise.all([
      Transaction.find({ familyId })
        .populate('paidBy', 'name')
        .populate('createdBy', 'name')
        .sort({ date: -1 })
        .limit(100),
      Budget.find({ familyId }),
      FinancialGoal.find({ familyId, status: 'active' })
        .populate('contributors.personId', 'name'),
      SharedExpense.find({ familyId })
        .populate('shares.personId', 'name')
        .populate('paidBy', 'name')
    ]);

    // Calculate statistics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = transactions.filter(t => 
      t.date >= startOfMonth && t.date <= endOfMonth
    );

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Calculate category breakdown
    const categoryBreakdown = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    res.json({
      success: true,
      data: {
        transactions,
        budgets,
        goals,
        sharedExpenses,
        summary: {
          totalIncome,
          totalExpenses,
          balance,
          savingsRate: Math.round(savingsRate),
          categoryBreakdown
        },
        members: family.members
      }
    });
  } catch (err) {
    console.error('Finance data error:', err);
    res.status(500).json({ error: 'Failed to fetch finance data' });
  }
});

// Create transaction
router.post('/transactions', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      createdBy: req.user._id
    });

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate('paidBy', 'name')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully',
      transaction: populated
    });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('paidBy', 'name');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user created the transaction or is admin
    if (transaction.createdBy.toString() !== req.user._id.toString()) {
      const family = await Family.findById(transaction.familyId);
      if (!family.admins.includes(req.user._id)) {
        return res.status(403).json({ error: 'Not authorized to delete this transaction' });
      }
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Create budget
router.post('/budgets', auth, async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      createdBy: req.user._id
    });

    await budget.save();

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (err) {
    console.error('Create budget error:', err);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Create financial goal
router.post('/goals', auth, async (req, res) => {
  try {
    const goal = new FinancialGoal({
      ...req.body,
      createdBy: req.user._id
    });

    await goal.save();

    const populated = await FinancialGoal.findById(goal._id)
      .populate('contributors.personId', 'name');

    res.status(201).json({
      success: true,
      message: 'Financial goal created successfully',
      goal: populated
    });
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal progress
router.put('/goals/:id/progress', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await FinancialGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.currentAmount = amount;
    
    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Goal progress updated',
      goal
    });
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Create shared expense
router.post('/shared-expenses', auth, async (req, res) => {
  try {
    const sharedExpense = new SharedExpense({
      ...req.body,
      createdBy: req.user._id
    });

    await sharedExpense.save();

    const populated = await SharedExpense.findById(sharedExpense._id)
      .populate('shares.personId', 'name')
      .populate('paidBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Shared expense created successfully',
      sharedExpense: populated
    });
  } catch (err) {
    console.error('Create shared expense error:', err);
    res.status(500).json({ error: 'Failed to create shared expense' });
  }
});

// Update shared expense payment
router.put('/shared-expenses/:id/pay', auth, async (req, res) => {
  try {
    const { personId, amount } = req.body;
    const sharedExpense = await SharedExpense.findById(req.params.id);

    if (!sharedExpense) {
      return res.status(404).json({ error: 'Shared expense not found' });
    }

    // Update payment status
    const share = sharedExpense.shares.find(s => 
      s.personId.toString() === personId
    );

    if (share) {
      share.paid = true;
      
      // Update overall status
      const allPaid = sharedExpense.shares.every(s => s.paid);
      sharedExpense.status = allPaid ? 'paid' : 'partially_paid';
      
      await sharedExpense.save();
    }

    res.json({
      success: true,
      message: 'Payment recorded',
      sharedExpense
    });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Get monthly analytics
router.get('/families/:id/analytics/monthly', auth, async (req, res) => {
  try {
    const familyId = req.params.id;
    const { year, month } = req.query;
    
    const startDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const transactions = await Transaction.find({
      familyId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate daily expenses
    const dailyData = {};
    for (let i = 1; i <= endDate.getDate(); i++) {
      const day = new Date(startDate.getFullYear(), startDate.getMonth(), i);
      dailyData[formatDate(day)] = 0;
    }

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const day = formatDate(t.date);
        dailyData[day] = (dailyData[day] || 0) + t.amount;
      });

    res.json({
      success: true,
      analytics: {
        dailyExpenses: Object.entries(dailyData).map(([date, amount]) => ({ date, amount })),
        totalTransactions: transactions.length,
        income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

module.exports = router;