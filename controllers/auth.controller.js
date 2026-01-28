const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { sendOtpEmail } = require("../services/sendEmail");

// ================= UTILS =================
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 admin email rule (change if needed)
    const adminEmails = ["admin@gmail.com"];
    const role = adminEmails.includes(email) ? "admin" : "user";

    await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SEND EMAIL OTP =================
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY EMAIL OTP / LOGIN =================
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.emailOtp ||
      user.emailOtp !== otp ||
      user.emailOtpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      redirectTo:
        user.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

// ================= RESEND EMAIL OTP =================
exports.resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// ================= FORGOT PASSWORD (SEND OTP) =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: "Password reset OTP sent",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password required",
      });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (
      !user.emailOtp ||
      user.emailOtp !== otp ||
      user.emailOtpExpire < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed" });
  }
};
