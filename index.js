const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter.Routes');
const ProductRouter = require('./Routes/ProductRouter');
const JobRouter = require('./Routes/JobRoutes');
const cookieParser = require('cookie-parser');
const interviewSessionRoutes = require("./Routes/interviewSession.routes");
const interviewReportsRoutes  = require("./Routes/InterviewReport.Routes");
const recentInterviewRoutes = require("./Routes/RecentInterview.Routes")
const StudentRouter = require('./Routes/Student.Routes');

require('dotenv').config();
require('./Models/db');
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors());
app.use(cors({
    origin: "http://localhost:5173",  // Allows all domains
    credentials: true, // ✅ Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Ping route
app.get('/ping', (req, res) => {
    res.send("Pong");
});

// Routes
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/jobs', JobRouter);
// app.use('/interview', interviewRouter);const interviewSessionRoutes = require("./routes/interviewSession.routes");

app.use("/api/interview-sessions", interviewSessionRoutes);
app.use("/api/interview-report", interviewReportsRoutes);
app.use("/api",recentInterviewRoutes)
app.use('/students',StudentRouter);



app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});