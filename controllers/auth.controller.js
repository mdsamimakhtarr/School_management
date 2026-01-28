// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
// controllers/auth.controller.js
const { sendOtpEmail } = require("../services/sendEmail");


const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashed,
    });

    res.status(201).json({ success: true, msg: "Registered successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ================= SEND EMAIL OTP =================
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = generateOTP();

    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ success: true, msg: "OTP sent to email" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ================= LOGIN WITH EMAIL OTP =================
exports.loginWithEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (
      !user.emailOtp ||
      user.emailOtp !== otp ||
      user.emailOtpExpire < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



// ================= VERIFY EMAIL OTP =================
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

  
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ OTP validation
    if (!user.emailOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated",
      });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.emailOtpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 4️⃣ Clear OTP
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6️⃣ Success response
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
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

    //  Validate
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    //  Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  Generate new OTP
    const otp = generateOTP();

    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    //  Send email
    await sendOtpEmail(email, otp);

    //  Response
    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};


//==============================================  FORGOT PASSWORD (send Otp ) ================================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.emailOtp = otp;
    user.emailOtpExpire = Date.now() + 1 * 60 * 1000; // 5 min
    await user.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // OTP check
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};
