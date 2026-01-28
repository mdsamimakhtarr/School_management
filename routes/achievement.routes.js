const express = require("express");
const router = express.Router();

const upload = require("../middlewares/multer.middleware");
const {
  createAchievement,
  getAchievements,
} = require("../controllers/achievement.controller");

router.post("/create", upload.single("profileImage"), createAchievement);
router.get("/all", getAchievements);

module.exports = router;
