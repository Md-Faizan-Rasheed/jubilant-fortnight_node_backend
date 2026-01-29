// const router = require("express").Router();
// // const razorpay = require("../config/razorpay");
// const crypto = require("crypto");
// const User = require("../Models/User.Models");
// const Payment = require("../Models/Payment");

// const Razorpay = require("razorpay");

// console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// router.post("/create-order", async (req, res) => {
//     try {
//      const { plan } = req.body;

//         console.log("razorpay:", razorpay);
//         console.log("razorpay.orders:", razorpay?.orders);

//         const PLAN_PRICES = {
//       FREE: 0,
//       STARTER: 999,
//       PRO: 3999,
//     };

//      if (!PLAN_PRICES[plan]) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid plan",
//       });
//     }

//     const amount = PLAN_PRICES[plan] * 100; // paise

//         const order = await razorpay.orders.create({
//             amount: amount, // ₹100 in paise
//             currency: "INR",
//             receipt: `receipt_${Date.now()}`,
//              notes: {
//         plan,
//       },
//         });

//         return res.status(200).json({
//             success: true,
//             order
//         });

//     } catch (error) {
//         console.error("Razorpay Order Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to create order"
//         });
//     }
// });



// // router.post("/verify", async (req, res) => {
// //     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId,plan } = req.body;
// //     console.log("Verifying payment for order:", razorpay_order_id);
// //     console.log("Received signature:", razorpay_signature);
// //     console.log("Payment ID:", razorpay_payment_id);
// //     console.log("User ID:", userId); //69711a1844db2fbdf8f3198e
// //     console.log("Plan:", plan);
    
    
// //     const body = razorpay_order_id + "|" + razorpay_payment_id;
// //     const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");


// //     if (expected !== razorpay_signature) return res.status(400).send("Invalid");


// //     await User.findByIdAndUpdate(userId, {
// //         plan: plan,
// //         limits: { maxJobs: 5, maxSessionsPerUser: 10 }
// //     });


// //     res.json({ success: true });
// // });

// const PLAN_CONFIG = {
//   FREE: {
//     limits: {
//       maxJobs: 1,
//       maxInterviews: 2
//     },
//     amount: 0
//   },
//   STARTER: {
//     limits: {
//       maxJobs: 5,
//       maxInterviews: 10
//     },
//     amount: 999
//   },
//   PRO: {
//     limits: {
//       maxJobs: Infinity, // or a very high number
//       maxInterviews: 50
//     },
//     amount: 3999
//   }
// };


// router.post("/verify", async (req, res) => {
//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     userId,
//     plan
//   } = req.body;

//   try {
//     // 1️⃣ Validate plan
//     if (!PLAN_CONFIG[plan]) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid plan"
//       });
//     }

//     // 2️⃣ Verify Razorpay signature
//     const body = `${razorpay_order_id}|${razorpay_payment_id}`;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature"
//       });
//     }

//     // 3️⃣ Prevent duplicate payment processing (idempotency)
//     const existingPayment = await Payment.findOne({
//       razorpayPaymentId: razorpay_payment_id
//     });

//     if (existingPayment) {
//       return res.json({
//         success: true,
//         message: "Payment already processed"
//       });
//     }

//     const planConfig = PLAN_CONFIG[plan];

//     // 4️⃣ Save payment record
//     await Payment.create({
//       userId,
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       razorpaySignature: razorpay_signature,
//       amount: planConfig.amount,
//       currency: "INR",
//       status: "PAID"
//     });

//     // 5️⃣ Update user subscription + limits
//     await User.findByIdAndUpdate(
//       userId,
//       {
//         plan,
//         limits: {
//           maxJobs: planConfig.limits.maxJobs,
//           maxInterviews: planConfig.limits.maxInterviews
//         },
//         // optional: reset usage on upgrade
//         // usage: { jobsCreated: 0, interviewsUsed: 0 }
//       },
//       { new: true }
      
//     );

//     return res.json({
//       success: true,
//       message: "Payment verified and subscription updated"
//     });

//   } catch (err) {
//     console.error("Payment verification error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Payment verification failed"
//     });
//   }
// });


// module.exports = router;




const router = require("express").Router();
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = require("../Models/User.Models");
const Payment = require("../Models/Payment");
const Razorpay = require("razorpay");
const jwt = require('jsonwebtoken');

// ✅ FIXED: No secret logging in production
if (process.env.NODE_ENV !== "production") {
  console.log("Razorpay credentials loaded");
}

// ✅ Environment-aware Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.NODE_ENV === "production" 
    ? process.env.RAZORPAY_KEY_ID_LIVE 
    : process.env.RAZORPAY_KEY_ID_TEST,
  key_secret: process.env.NODE_ENV === "production" 
    ? process.env.RAZORPAY_KEY_SECRET_LIVE 
    : process.env.RAZORPAY_KEY_SECRET_TEST
});

// ✅ Plan configuration with proper limits
const PLAN_CONFIG = {
  FREE: {
    limits: {
      maxJobs: 1,
      maxInterviews: 2
    },
    amount: 0,
    duration: null // lifetime
  },
  STARTER: {
    limits: {
      maxJobs: 5,
      maxInterviews: 10
    },
    amount: 999,
    duration: 30 // days
  },
  PRO: {
    limits: {
      maxJobs: Infinity,
      maxInterviews: 50
    },
    amount: 3999,
    duration: 30 // days
  }
};

// ✅ FIXED: Authentication middleware (you need to create this)
// Example middleware - adjust based on your auth setup

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: JWT token is required",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ SAME OUTPUT AS ABOVE MIDDLEWARE
    req.userId = decoded._id;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: JWT token is invalid or expired",
    });
  }
};



// ✅ Audit log helper
const createAuditLog = async (eventType, data) => {
  try {
    // You can create an AuditLog model or use console with proper logging service
    const logEntry = {
      timestamp: new Date(),
      eventType,
      ...data
    };
    
    // In production, use proper logging service (Winston, DataDog, etc.)
    if (process.env.NODE_ENV === "production") {
      // await AuditLog.create(logEntry);
      console.log('[AUDIT]', JSON.stringify(logEntry));
    } else {
      console.log('[AUDIT]', logEntry);
    }
  } catch (error) {
    console.error('Audit log failed:', error);
  }
};

// ✅ FIXED: FREE plan doesn't need Razorpay
router.post("/activate-free-plan", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // ✅ From authenticated user, not request body
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update to FREE plan
    await User.findByIdAndUpdate(userId, {
      plan: "FREE",
      limits: PLAN_CONFIG.FREE.limits,
      planStartDate: new Date(),
      planEndDate: null, // FREE is lifetime
      isActive: true
    });

    await createAuditLog('FREE_PLAN_ACTIVATED', { userId });

    return res.json({
      success: true,
      message: "FREE plan activated"
    });

  } catch (error) {
    console.error("Free plan activation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to activate FREE plan"
    });
  }
});

// ✅ FIXED: Protected with auth, validates plan
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.userId; // ✅ From authenticated user

    // Validate plan
    if (!PLAN_CONFIG[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan"
      });
    }

    // ✅ FREE plan should not create Razorpay order
    if (plan === "FREE") {
      return res.status(400).json({
        success: false,
        message: "Use /activate-free-plan for FREE plan"
      });
    }

    const planConfig = PLAN_CONFIG[plan];
    const amount = planConfig.amount * 100; // Convert to paise
    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;



    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: receipt,
      notes: {
        userId,
        plan,
        planAmount: planConfig.amount
      }
    });

    // ✅ Save pending payment record for tracking
    await Payment.create({
      userId,
      razorpayOrderId: order.id,
      amount: planConfig.amount,
      currency: "INR",
      plan,
      status: "PENDING"
    });

    await createAuditLog('ORDER_CREATED', { userId, plan, orderId: order.id, amount: planConfig.amount });

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error("Razorpay Order Error:", error);
    await createAuditLog('ORDER_CREATION_FAILED', { userId: req.userId, error: error });

    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
});

// ✅ FIXED: Protected, validates amount, uses transactions
router.post("/verify", authMiddleware, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan
  } = req.body;

  const userId = req.userId; // ✅ From authenticated user
  const session = await mongoose.startSession();

  try {
    // 1️⃣ Validate plan
    if (!PLAN_CONFIG[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan"
      });
    }

    // 2️⃣ Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.NODE_ENV === "production" 
        ? process.env.RAZORPAY_KEY_SECRET_LIVE 
        : process.env.RAZORPAY_KEY_SECRET_TEST)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await createAuditLog('PAYMENT_VERIFICATION_FAILED', { 
        userId, 
        orderId: razorpay_order_id,
        reason: 'Invalid signature'
      });

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // 3️⃣ Prevent duplicate payment processing
    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id
    });

    if (existingPayment && existingPayment.status === "PAID") {
      return res.json({
        success: true,
        message: "Payment already processed"
      });
    }

    // 4️⃣ ✅ FIXED: Verify order amount matches plan amount
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmount = PLAN_CONFIG[plan].amount * 100;

    if (razorpayOrder.amount !== expectedAmount) {
      await createAuditLog('PAYMENT_AMOUNT_MISMATCH', { 
        userId, 
        orderId: razorpay_order_id,
        expected: expectedAmount,
        received: razorpayOrder.amount
      });

      return res.status(400).json({
        success: false,
        message: "Payment amount mismatch"
      });
    }

    const planConfig = PLAN_CONFIG[plan];

    // 5️⃣ ✅ FIXED: Use transaction for atomicity
    session.startTransaction();

    try {
      // Update or create payment record
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          userId,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          amount: planConfig.amount,
          currency: "INR",
          plan,
          status: "PAID",
          paidAt: new Date()
        },
        { upsert: true, new: true, session }
      );

      // FIXED: Add plan validity dates
      const planStartDate = new Date();
      const planEndDate = planConfig.duration 
        ? new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000)
        : null;

      // Update user subscription
      await User.findByIdAndUpdate(
        userId,
        {
          plan,
          limits: {
            maxJobs: planConfig.limits.maxJobs,
            maxInterviews: planConfig.limits.maxInterviews
          },
          planStartDate,
          planEndDate,
          isActive: true,
          lastPaymentId: razorpay_payment_id
        },
        { new: true, session }
      );

      await session.commitTransaction();

      await createAuditLog('PAYMENT_VERIFIED', { 
        userId, 
        plan,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: planConfig.amount
      });

      return res.json({
        success: true,
        message: "Payment verified and subscription updated",
        planEndDate
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    }

  } catch (err) {
    console.error("Payment verification error:", err);
    await createAuditLog('PAYMENT_VERIFICATION_ERROR', { 
      userId, 
      orderId: razorpay_order_id,
      error: err.message
    });

    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  } finally {
    session.endSession();
  }
});

// ✅ CRITICAL: Razorpay Webhook for production reliability
router.post("/webhook", require("express").raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      await createAuditLog('WEBHOOK_SIGNATURE_INVALID', { signature });
      return res.status(400).send("Invalid webhook signature");
    }

    const event = JSON.parse(req.body.toString());
    
    await createAuditLog('WEBHOOK_RECEIVED', { event: event.event, paymentId: event.payload?.payment?.entity?.id });

    // Handle payment captured
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { user_id: userId, plan } = payment.notes;

      if (!userId || !plan || !PLAN_CONFIG[plan]) {
        console.error("Invalid webhook data:", payment.notes);
        return res.status(400).send("Invalid payment data");
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const planConfig = PLAN_CONFIG[plan];
        const planStartDate = new Date();
        const planEndDate = planConfig.duration 
          ? new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000)
          : null;

        // Update payment
        await Payment.findOneAndUpdate(
          { razorpayPaymentId: payment.id },
          {
            userId,
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
            plan,
            status: "PAID",
            paidAt: new Date()
          },
          { upsert: true, new: true, session }
        );

        // Update user
        await User.findByIdAndUpdate(
          userId,
          {
            plan,
            limits: planConfig.limits,
            planStartDate,
            planEndDate,
            isActive: true,
            lastPaymentId: payment.id
          },
          { new: true, session }
        );
        // global.io.to("userId4344334").emit("paymentSuccess", {
        //     message: "Payment successful",
        //     plan,
        //     });

        await session.commitTransaction();
        
        await createAuditLog('WEBHOOK_PAYMENT_CAPTURED', { 
          userId, 
          plan,
          paymentId: payment.id,
          amount: payment.amount / 100
        });

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    // Handle payment failed
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      
      await Payment.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          status: "FAILED",
          failureReason: payment.error_description
        }
      );

      await createAuditLog('WEBHOOK_PAYMENT_FAILED', { 
        orderId: payment.order_id,
        reason: payment.error_description
      });
    }

    res.json({ status: "ok" });

  } catch (error) {
    console.error("Webhook error:", error);
    await createAuditLog('WEBHOOK_ERROR', { error: error.message });
    res.status(500).send("Webhook processing failed");
  }
});

module.exports = router;
