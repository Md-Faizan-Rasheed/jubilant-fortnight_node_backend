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
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json());
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
"http://localhost:5174",
  "http://localhost:4173",
  "https://gemini-frontend-sigma.vercel.app"
];
// http://localhost:8080/
app.use(cors({
    origin: allowedOrigins,
    // allow_origins:["*"], 
    credentials: true, // ✅ Allow cookies
    // credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors({
  origin: "https://gemini-frontend-sigma.vercel.app",
  credentials: true
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
app.use("/api/billing", require("./Routes/Payment"));
app.use("/api", require("./Routes/Feedback.Routes"));
app.use("/admin", require("./Routes/AdminRoutes"));


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});



// const express = require('express');
// const { v4: uuidv4 } = require('uuid');
// const http = require("http");            // ✅ ADD
// const { Server } = require("socket.io"); // ✅ ADD

// const app = express();
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');

// const AuthRouter = require('./Routes/AuthRouter.Routes');
// const ProductRouter = require('./Routes/ProductRouter');
// const JobRouter = require('./Routes/JobRoutes');
// const interviewSessionRoutes = require("./Routes/interviewSession.routes");
// const interviewReportsRoutes  = require("./Routes/InterviewReport.Routes");
// const recentInterviewRoutes = require("./Routes/RecentInterview.Routes");
// const StudentRouter = require('./Routes/Student.Routes');

// require('dotenv').config();
// require('./Models/db');

// const PORT = process.env.PORT || 8080;

// /* ================================
//    ✅ Create HTTP server
// ================================ */
// const server = http.createServer(app);

// /* ================================
//    ✅ Setup Socket.IO
// ================================ */
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "https://gemini-frontend-sigma.vercel.app"
//     ],
//     credentials: true
//   }
// });

// /* Make io globally available */
// global.io = io;

// /* ================================
//    Socket Connection
// ================================ */
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   // join user room
//   socket.on("join", (userId) => {
//     socket.join(userId);
//     console.log("User joined room:", userId);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// /* ================================
//    Middlewares
// ================================ */

// app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// app.use(bodyParser.json());
// app.use(cookieParser());

// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "https://gemini-frontend-sigma.vercel.app"
// ];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// app.options("*", cors({
//   origin: "https://gemini-frontend-sigma.vercel.app",
//   credentials: true
// }));

// /* ================================
//    Routes
// ================================ */

// app.get('/ping', (req, res) => {
//   res.send("Pong");
// });

// app.use('/auth', AuthRouter);
// app.use('/products', ProductRouter);
// app.use('/jobs', JobRouter);
// app.use("/api/interview-sessions", interviewSessionRoutes);
// app.use("/api/interview-report", interviewReportsRoutes);
// app.use("/api", recentInterviewRoutes);
// app.use('/students', StudentRouter);
// app.use("/api/billing", require("./Routes/Payment"));

// /* ================================
//    Start Server
// ================================ */
// server.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`);
// });
