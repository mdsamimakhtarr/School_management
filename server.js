require("dotenv").config();   // ✅ SABSE UPAR

const express = require("express");
const mongoose = require("mongoose");

const app = express();

const authRoutes = require("./routes/auth.routes");

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// DB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
