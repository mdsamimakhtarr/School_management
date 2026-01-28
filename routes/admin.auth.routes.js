const express = require("express");
const router = express.Router();

const {
  adminLogin,
  createAdmin,
} = require("../controllers/admin.auth.controller");

router.post("/create", createAdmin); // one-time
router.post("/login", adminLogin);

module.exports = router;
