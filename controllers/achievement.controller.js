
const Achievement = require("../models/admin.achievements.model");

const cloudinary = require("../config/cloudinary");

exports.createAchievement = async (req, res) => {
  try {
    const { profileName, age, contactNumber, designation } = req.body;

    if (!profileName || !age || !contactNumber || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let imageData = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "achievements" }
      );  

      imageData = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    const achievement = await Achievement.create({
      profileName,
      age,
      contactNumber,
      designation,
      profileImage: imageData,
      createdBy: req.user?.id || null, // future admin/user
    });

    res.status(201).json({
      success: true,
      message: "Achievement created successfully",
      data: achievement,
    });
  } catch (error) {
    console.error("Achievement Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create achievement",
    });
  }
};

// ================= GET ALL ===============
exports.getAchievements = async (req, res) => {
  const achievements = await Achievement.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: achievements,
  });
};
