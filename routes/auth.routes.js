const express = require("express");
const {
  register,
  sendEmailOTP,
  verifyEmailOtp,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/send-email-otp", sendEmailOTP);
router.post("/verify-email-otp", verifyEmailOtp);

module.exports = router;
