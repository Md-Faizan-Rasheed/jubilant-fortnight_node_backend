// const mongoose = require('mongoose');

// const PaymentSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true
//     },

//     razorpayOrderId: {
//       type: String,
//       required: true,
//       index: true
//     },

//     razorpayPaymentId: {
//       type: String,
//       index: true
//     },

//     razorpaySignature: {
//       type: String
//     },

//     amount: {
//       type: Number,
//       required: true
//     },

//     currency: {
//       type: String,
//       default: 'INR',
//       enum: ['INR']
//     },
// // Plan information
//   plan: {
//     type: String,
//     enum: ['FREE', 'STARTER', 'PRO'],
//     required: true
//   },
//     status: {
//       type: String,
//       enum: ['CREATED', 'PAID', 'FAILED','PENDING'],
//       default: 'CREATED',
//       index: true
//     },

//       // Timestamps
//   paidAt: {
//     type: Date,
//     default: null
//   },
  
//   // Failure tracking
//   failureReason: {
//     type: String,
//     default: null
//   },
  
//   // Additional metadata
//   metadata: {
//     type: Map,
//     of: String,
//     default: {}
//   }
//   },
//   {
//     timestamps: { createdAt: true, updatedAt: false }
//   }
// );

// // ✅ Indexes for better query performance
// paymentSchema.index({ userId: 1, status: 1 });
// paymentSchema.index({ createdAt: -1 });

// // ✅ Method to check if payment is successful
// paymentSchema.methods.isSuccessful = function() {
//   return this.status === 'PAID';
// };

// // ✅ Static method to get user's payment history
// paymentSchema.statics.getUserPayments = function(userId) {
//   return this.find({ userId })
//     .sort({ createdAt: -1 })
//     .exec();
// };

// // ✅ Static method to get successful payments count
// paymentSchema.statics.getSuccessfulPaymentsCount = function(userId) {
//   return this.countDocuments({ userId, status: 'PAID' });
// };

// module.exports = mongoose.model('Payment', PaymentSchema);



const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Razorpay identifiers
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values for pending payments
    index: true
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Plan information
  plan: {
    type: String,
    enum: ['FREE', 'STARTER', 'PRO'],
    required: true
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
    index: true
  },
  
  // Timestamps
  paidAt: {
    type: Date,
    default: null
  },
  
  // Failure tracking
  failureReason: {
    type: String,
    default: null
  },
  
  // Additional metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// ✅ Indexes for better query performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// ✅ Method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'PAID';
};

// ✅ Static method to get user's payment history
paymentSchema.statics.getUserPayments = function(userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .exec();
};

// ✅ Static method to get successful payments count
paymentSchema.statics.getSuccessfulPaymentsCount = function(userId) {
  return this.countDocuments({ userId, status: 'PAID' });
};

module.exports = mongoose.model('Payment', paymentSchema);