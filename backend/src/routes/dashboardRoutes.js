const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protectAdmin, authorizePermissions } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

router.get("/stats", protectAdmin, authorizePermissions(PERMISSIONS.DASHBOARD_READ), getDashboardStats);

module.exports = router;
