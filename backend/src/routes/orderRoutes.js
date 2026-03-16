const express = require("express");
const { listOrders, updateOrderStatus } = require("../controllers/orderController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, listOrders);
router.patch("/:id/status", protectAdmin, updateOrderStatus);

module.exports = router;
