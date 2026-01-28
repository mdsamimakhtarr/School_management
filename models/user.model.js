const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ROLE MANAGEMENT
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // EMAIL OTP
    emailOtp: {
      type: String,
    },
    emailOtpExpire: {
      type: Date,
    },


    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
