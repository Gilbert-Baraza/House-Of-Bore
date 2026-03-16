const express = require("express");
const { listMyOrders } = require("../controllers/customerOrderController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.get("/me", protectCustomer, listMyOrders);

module.exports = router;
