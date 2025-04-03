const mongoose = require('mongoose');

const TRANSPORT_MODES = {
  PUBLIC_TRANSPORT: 'PUBLIC_TRANSPORT',
  CARPOOL: 'CARPOOL',
  RIDESHARE: 'RIDESHARE',
  WORK_FROM_HOME: 'WORK_FROM_HOME'
};

const POINTS_PER_MILE = {
  PUBLIC_TRANSPORT: 3,
  CARPOOL: 2,
  RIDESHARE: 1.5,
  WORK_FROM_HOME: 4
};

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  transportMode: {
    type: String,
    enum: Object.values(TRANSPORT_MODES),
    required: true
  },
  startLocation: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  endLocation: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  distance: {
    type: Number,
    required: true // in miles
  },
  carbonCreditsEarned: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  verificationMethod: {
    type: String,
    enum: ['GPS', 'TICKET_UPLOAD', 'MANUAL_REVIEW'],
    required: true
  },
  verificationData: {
    gpsTrack: [{
      timestamp: Date,
      latitude: Number,
      longitude: Number
    }],
    ticketImage: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verificationNotes: String
  }
}, {
  timestamps: true
});

// Calculate carbon credits before saving
tripSchema.pre('save', function(next) {
  if (this.isModified('distance') || this.isModified('transportMode')) {
    this.carbonCreditsEarned = this.distance * POINTS_PER_MILE[this.transportMode];
  }
  next();
});

tripSchema.statics.TRANSPORT_MODES = TRANSPORT_MODES;
tripSchema.statics.POINTS_PER_MILE = POINTS_PER_MILE;

module.exports = mongoose.model('Trip', tripSchema); 