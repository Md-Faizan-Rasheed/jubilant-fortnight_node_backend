const express = require("express");
const router = express.Router();
const InterviewSessionSchema = require("../Models/InterviewSession.Models");
const ensureAuthenticated = require('../Middlewares/Auth');
const Job = require("../Models/Job");
const User = require("../Models/User.Models");
// const Interview = require("../Models/Interview.Models");  

// POST /api/interview-sessions
router.post("/", async (req, res) => {
  try {
    const { studentId, jobId } = req.body;

    const session = await InterviewSessionSchema.create({
      studentId,
      jobId,
      status: "in_progress",
      startedAt: new Date()
    });
    console.log("sessions",session)

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/interview-sessions/:id/transcript
router.post("/:id/transcript", async (req, res) => {
  try {
    const { speaker, message } = req.body;

    await InterviewSessionSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          transcript: { speaker, message }
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// POST /api/interview-sessions/:id/complete
router.post("/:id/complete", async (req, res) => {
  try {
    await InterviewSessionSchema.findByIdAndUpdate(req.params.id, {
      status: "completed",
      endedAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/interview-sessions/:id
router.get("/:id", async (req, res) => {
  try {
    const session = await InterviewSessionSchema.findById(req.params.id);
    res.json(session);
  } catch (err) {
    res.status(404).json({ error: "Session not found" });
  }
});
// /api/interview-sessions
router.post("/verify_update", ensureAuthenticated, async (req, res) => {
  const { jobId } = req.body;
  console.log("jobId in verififcation of interview",jobId);

  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: "Job ID is required"
    });
  }

  try {
    // 1️⃣ Find job → get userId
    const job = await Job.findById(jobId).select("userId");
  
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const userId = job.userId;

    // 2️⃣ Atomically check & increment interview usage
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        $expr: {
          $lt: ["$usage.interviewsUsed", "$limits.maxInterviews"]
        }
      },
      {
        $inc: { "usage.interviewsUsed": 1 }
      },
      { new: true }
    );

    // 3️⃣ If limit exceeded
    if (!updatedUser) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to start this interview. Please contact your organisation team."
      });
    }
  console.log("updatedUser after starting interview",updatedUser);
    // // 4️⃣ (Optional) create interview record
    // await Interview.create({
    //   userId,
    //   jobId,
    //   status: "STARTED",
    //   startedAt: new Date()
    // });

    return res.json({
      success: true,
      message: "Interview access granted"
    });

  } catch (err) {
    console.error("Start interview error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to start interview"
    });
  }
});


module.exports = router;
