
const express = require("express");

const router = express.Router();
// const saveInterviewReport = require("../Controllers/InterviewReport");
const { saveInterviewReport } = require("../Controllers/InterviewReport");


router.post("/", async (req, res) => {
  try {
    const {
      aiContent,
      sessionId,
      candidateId,
      jobId,
      jobTitle
    } = req.body;

    const report = await saveInterviewReport({
      aiContent,
      sessionId,
      candidateId,
      jobId,
      jobTitle
    });

    res.status(201).json({
      success: true,
      reportId: report._id,
    });
  } catch (err) {
    console.error("Interview report save error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to save interview report",
    });
  }
});

module.exports = router;
