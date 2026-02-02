// import InterviewFeedback from "../Models/InterviewFeedback";
const express = require("express");
const InterviewFeedback  = require("../Models/InterviewFeedback");

const router = express.Router();

/**
 * POST /api/feedback
 */
router.post("/interview-feedback", async (req, res) => {
  try {
    const {
      studentId,
      difficulty,
      fairness,
      aiQuality,
      overallExperience,
      technicalIssues,
      comments
    } = req.body;

    // basic validation
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const feedback = new InterviewFeedback({
      studentId,
      difficulty,
      fairness,
      aiQuality,
      overallExperience,
      technicalIssues,
      comments
    });

    await feedback.save();

    return res.status(201).json({
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    console.error("Feedback save error:", error);
    return res.status(500).json({
      message: "Failed to submit feedback",
      error: error.message
    });
  }
});

module.exports = router;
