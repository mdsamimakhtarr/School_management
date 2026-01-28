const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.routes");
const achievementRoutes = require("./routes/achievement.routes"); 

app.use("/api/auth", authRoutes);
app.use("/api/features/achievements", achievementRoutes);

// Test
app.get("/", (req, res) => {
  res.send("API is running...");
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
