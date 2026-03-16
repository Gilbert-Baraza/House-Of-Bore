const express = require("express");
const { loginAdmin, getProfile } = require("../controllers/authController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/me", protectAdmin, getProfile);

module.exports = router;
