const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    profileName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    profileImage: {
      public_id: String,
      url: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", achievementSchema);
