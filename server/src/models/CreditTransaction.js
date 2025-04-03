const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  fromOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  toOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  credits: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerCredit: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  paymentDetails: {
    method: {
      type: String,
      enum: ['BANK_TRANSFER', 'CREDIT_CARD', 'CRYPTO'],
      required: true
    },
    transactionId: String,
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    }
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
creditTransactionSchema.pre('save', function(next) {
  if (this.isModified('credits') || this.isModified('pricePerCredit')) {
    this.totalAmount = this.credits * this.pricePerCredit;
  }
  next();
});

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema); 