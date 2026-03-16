const express = require("express");
const { listCustomers, getCustomerOrders, updateCustomer } = require("../controllers/customerController");
const { protectAdmin, authorizePermissions } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

router.get("/", protectAdmin, authorizePermissions(PERMISSIONS.CUSTOMERS_READ), listCustomers);
router.get("/:id/orders", protectAdmin, authorizePermissions(PERMISSIONS.CUSTOMERS_READ), getCustomerOrders);
router.put("/:id", protectAdmin, authorizePermissions(PERMISSIONS.CUSTOMERS_WRITE), updateCustomer);

module.exports = router;
