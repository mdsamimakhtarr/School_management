const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require ("cookie-parser")

const app = express();

// Middlewares
app.use(cors( {
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(morgan("dev"));

// Routes

const authRoutes = require("./routes/auth.routes");
const achievementRoutes = require("./routes/achievement.routes"); 
const adminAuthRoutes = require("./routes/admin.auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");

app.use("/api/auth", authRoutes);
app.use("/api/features/achievements", achievementRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/attendance", attendanceRoutes);



module.exports = app;
