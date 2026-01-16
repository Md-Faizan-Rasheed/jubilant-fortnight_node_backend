const express = require("express");
const router = express.Router();
const InterviewSessionSchema = require("../Models/InterviewSession.Models");


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

module.exports = router;
