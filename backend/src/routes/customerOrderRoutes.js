const express = require("express");
const { listMyOrders, getMyOrderById } = require("../controllers/customerOrderController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.get("/me", protectCustomer, listMyOrders);
router.get("/me/:id", protectCustomer, getMyOrderById);

module.exports = router;
