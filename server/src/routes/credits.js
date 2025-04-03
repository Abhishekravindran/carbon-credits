const express = require('express');
const { body, validationResult } = require('express-validator');
const CreditTransaction = require('../models/CreditTransaction');
const Organization = require('../models/Organization');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Initiate credit transaction
router.post('/transactions',
  auth,
  authorize('EMPLOYER'),
  [
    body('toOrganization').isMongoId(),
    body('credits').isNumeric().isInt({ min: 1 }),
    body('pricePerCredit').isNumeric().isFloat({ min: 0 }),
    body('paymentDetails.method').isIn(['BANK_TRANSFER', 'CREDIT_CARD', 'CRYPTO'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const fromOrg = await Organization.findOne({
        _id: req.user.organization,
        admin: req.user._id
      });

      if (!fromOrg) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      if (fromOrg.carbonCredits.available < req.body.credits) {
        return res.status(400).json({ message: 'Insufficient credits' });
      }

      const toOrg = await Organization.findById(req.body.toOrganization);
      if (!toOrg) {
        return res.status(404).json({ message: 'Recipient organization not found' });
      }

      const transaction = new CreditTransaction({
        fromOrganization: fromOrg._id,
        toOrganization: toOrg._id,
        credits: req.body.credits,
        pricePerCredit: req.body.pricePerCredit,
        initiatedBy: req.user._id,
        paymentDetails: req.body.paymentDetails
      });

      await transaction.save();

      // Update organizations' credit balances
      fromOrg.carbonCredits.available -= req.body.credits;
      fromOrg.carbonCredits.traded += req.body.credits;
      await fromOrg.save();

      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
  }
);

// Approve credit transaction
router.post('/transactions/:id/approve',
  auth,
  authorize('EMPLOYER'),
  async (req, res) => {
    try {
      const transaction = await CreditTransaction.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      const toOrg = await Organization.findOne({
        _id: transaction.toOrganization,
        admin: req.user._id
      });

      if (!toOrg) {
        return res.status(404).json({ message: 'Organization not found' });
      }

      transaction.status = 'COMPLETED';
      transaction.approvedBy = req.user._id;
      await transaction.save();

      // Update recipient organization's credits
      toOrg.carbonCredits.total += transaction.credits;
      toOrg.carbonCredits.available += transaction.credits;
      await toOrg.save();

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Error approving transaction', error: error.message });
    }
  }
);

// Get organization's transactions
router.get('/transactions/organization',
  auth,
  authorize('EMPLOYER'),
  async (req, res) => {
    try {
      const transactions = await CreditTransaction.find({
        $or: [
          { fromOrganization: req.user.organization },
          { toOrganization: req.user.organization }
        ]
      })
        .populate('fromOrganization', 'name')
        .populate('toOrganization', 'name')
        .populate('initiatedBy', 'email profile')
        .populate('approvedBy', 'email profile')
        .sort({ createdAt: -1 });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
  }
);

// Get market statistics
router.get('/market-stats',
  auth,
  async (req, res) => {
    try {
      const stats = await CreditTransaction.aggregate([
        {
          $match: {
            status: 'COMPLETED'
          }
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalCreditsTraded: { $sum: '$credits' },
            averagePrice: { $avg: '$pricePerCredit' },
            totalValue: {
              $sum: { $multiply: ['$credits', '$pricePerCredit'] }
            }
          }
        }
      ]);

      res.json(stats[0] || {
        totalTransactions: 0,
        totalCreditsTraded: 0,
        averagePrice: 0,
        totalValue: 0
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching market statistics', error: error.message });
    }
  }
);

module.exports = router; 