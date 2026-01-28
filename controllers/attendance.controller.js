const Attendance = require("../models/attendance.model");
const User = require("../models/user.model");
const { sendAbsentEmail } = require("../services/sendEmail");
const mongoose = require("mongoose");

// ✅ MARK ATTENDANCE
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId",
      });
    }

    const attendance = await Attendance.create({
      studentId,
      date,
      status,
      remarks,
    });

    // 🔔 ABSENT EMAIL
    if (status === "absent") {
      const student = await User.findById(studentId);
      if (student?.email) {
        await sendAbsentEmail(student.email, student.firstName, date);
      }
    }

    res.status(201).json({
      success: true,
      message: "Attendance marked",
      data: attendance,
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
};

// ✅ GET ATTENDANCE OF ONE STUDENT
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.find({ studentId }).sort({ date: -1 });

    res.json({
      success: true,
      total: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET ATTENDANCE BY DATE
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59);

    const records = await Attendance.find({
      date: { $gte: start, $lte: end },
    }).populate("studentId", "firstName email");

    res.json({
      success: true,
      total: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ MONTHLY REPORT
exports.getMonthlyReport = async (req, res) => {
  try {
    const { studentId, month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const report = await Attendance.find({
      studentId,
      date: { $gte: start, $lte: end },
    });

    res.json({
      success: true,
      month,
      year,
      totalDays: report.length,
      present: report.filter(r => r.status === "present").length,
      absent: report.filter(r => r.status === "absent").length,
      late: report.filter(r => r.status === "late").length,
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
