const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getStudentAttendance,
  getAttendanceByDate,
  getMonthlyReport,
} = require("../controllers/attendance.controller");

router.post("/mark", markAttendance);
router.get("/student/:studentId", getStudentAttendance);
router.get("/by-date", getAttendanceByDate);
router.get("/monthly", getMonthlyReport);

module.exports = router;
