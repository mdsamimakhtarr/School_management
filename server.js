const dotenv = require("dotenv");
const connectMongo = require("./databases/mongo.js");
const app = require("./app.js");

dotenv.config();

// // Routes
// const authRoutes = require("./routes/auth.routes");
// const achievementRoutes = require("./routes/achievement.routes");
// const adminAuthRoutes = require("./routes/admin.auth.routes");
// const attendanceRoutes = require("./routes/attendance.routes");

// app.use("/api/auth", authRoutes);
// app.use("/api/features/achievements", achievementRoutes);
// app.use("/api/admin/auth", adminAuthRoutes);
// app.use("/api/attendance", attendanceRoutes);

// Test
// app.get("/", (req, res) => {
//   res.send("API is running...");
// });

// DB

const port = process.env.PORT || 3000;

connectMongo()
  .then(() => {
    try {
      app.on("error", (error) => {
        console.log("ERROR:", error);
        throw error;
      });
      app.listen(port, () => {
        console.log(`Server is running in: ${port}`);
      });
    } catch (error) {
      console.log("ERROR:", error);
      throw error;
    }
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
