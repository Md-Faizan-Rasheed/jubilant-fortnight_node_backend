// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//     company_name: {
//         type: String,
//         required: true,
//         trim: true, // Removes leading and trailing spaces
//     },
//     years_old: {
//         type: Number, // Changed to Number for better validation
//         required: true,
//         min: 0, // Ensures the number is non-negative
//     },
//     field_of_work: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true, // Ensures no duplicate email entries
//         trim: true,
//         match: [/.+@.+\..+/, "Please enter a valid email address"], // Basic email validation
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6, // Ensures the password has a minimum length
//     },
//     emp_size:{
//         type:Number,
//         required:true,
//         min:0 // Ensures the number is non-negative

//     },
//     interviewIntroVideo:{
//         type:String,
//     },
//     companyLocation:{
//         type:String,
//     },
//     city:{
//         type:String,
//     },
//     state:{
//         type:String,
//     },
//     plan: {
//     type: String,
//     enum: ['FREE', 'STARTER', 'PRO'],
//     default: 'FREE'
//   },

//   limits: {
//     maxJobs: {
//       type: Number,
//       default: 2
//     },
//     maxInterviews: {
//       type: Number,
//       default: 2
//     }
//   },

//   usage: {
//     jobsCreated: {
//       type: Number,
//       default: 0
//     },
//     interviewsCreated: {
//       type: Number,
//       default: 0
//     }
//   },


//   // ✅ Plan validity tracking
//   planStartDate: {
//     type: Date,
//     default: null
//   },
//   planEndDate: {
//     type: Date,
//     default: null
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },

//   // ✅ Last payment reference
//   lastPaymentId: {
//     type: String,
//     default: null
//   },


// }, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically


// // ✅ Method to check if user can create a job
// userSchema.methods.canCreateJob = function() {
//   if (!this.isActive) return false;
//   if (this.planEndDate && new Date() > this.planEndDate) return false;
//   if (this.limits.maxJobs === Infinity) return true;
//   return this.usage.jobsCreated < this.limits.maxJobs;
// };

// // ✅ Method to check if user can conduct interview
// userSchema.methods.canConductInterview = function() {
//   if (!this.isActive) return false;
//   if (this.planEndDate && new Date() > this.planEndDate) return false;
//   if (this.limits.maxInterviews === Infinity) return true;
//   return this.usage.interviewsUsed < this.limits.maxInterviews;
// };

// // ✅ Method to increment usage
// userSchema.methods.incrementJobUsage = async function() {
//   this.usage.jobsCreated += 1;
//   return this.save();
// };

// userSchema.methods.incrementInterviewUsage = async function() {
//   this.usage.interviewsUsed += 1;
//   return this.save();
// };

// // ✅ Check plan expiry before each operation
// userSchema.pre('save', function(next) {
//   if (this.planEndDate && new Date() > this.planEndDate) {
//     // Downgrade to FREE plan if expired
//     this.plan = 'FREE';
//     this.limits = { maxJobs: 1, maxInterviews: 2 };
//     this.isActive = true;
//     this.planEndDate = null;
//   }
//   next();
// });

// module.exports = mongoose.model('users', UserSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Existing fields (keep your current fields)
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },

  // ✅ Subscription & Plan Fields
  plan: {
    type: String,
    enum: ['FREE', 'STARTER', 'PRO'],
    default: 'FREE'
  },

  // ✅ Plan limits
  limits: {
    maxJobs: {
      type: Number,
      default: 1
    },
    maxInterviews: {
      type: Number,
      default: 2
    }
  },

  // ✅ Usage tracking (optional but recommended)
  usage: {
    jobsCreated: {
      type: Number,
      default: 0
    },
    interviewsUsed: {
      type: Number,
      default: 0
    }
  },

  // ✅ Plan validity tracking
  planStartDate: {
    type: Date,
    default: null
  },
  planEndDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // ✅ Last payment reference
  lastPaymentId: {
    type: String,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ✅ Method to check if user can create a job
userSchema.methods.canCreateJob = function() {
  if (!this.isActive) return false;
  if (this.planEndDate && new Date() > this.planEndDate) return false;
  if (this.limits.maxJobs === Infinity) return true;
  return this.usage.jobsCreated < this.limits.maxJobs;
};

// ✅ Method to check if user can conduct interview
userSchema.methods.canConductInterview = function() {
  if (!this.isActive) return false;
  if (this.planEndDate && new Date() > this.planEndDate) return false;
  if (this.limits.maxInterviews === Infinity) return true;
  return this.usage.interviewsUsed < this.limits.maxInterviews;
};

// ✅ Method to increment usage
userSchema.methods.incrementJobUsage = async function() {
  this.usage.jobsCreated += 1;
  return this.save();
};

userSchema.methods.incrementInterviewUsage = async function() {
  this.usage.interviewsUsed += 1;
  return this.save();
};

// ✅ Check plan expiry before each operation
userSchema.pre('save', function(next) {
  if (this.planEndDate && new Date() > this.planEndDate) {
    // Downgrade to FREE plan if expired
    this.plan = 'FREE';
    this.limits = { maxJobs: 1, maxInterviews: 2 };
    this.isActive = true;
    this.planEndDate = null;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);