const express = require("express");
const { listOrders, updateOrderStatus, updateOrderDetails } = require("../controllers/orderController");
const { protectAdmin, authorizePermissions } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

router.get("/", protectAdmin, authorizePermissions(PERMISSIONS.ORDERS_READ), listOrders);
router.patch("/:id", protectAdmin, authorizePermissions(PERMISSIONS.ORDERS_WRITE), updateOrderDetails);
router.patch("/:id/status", protectAdmin, authorizePermissions(PERMISSIONS.ORDERS_WRITE), updateOrderStatus);

module.exports = router;
