const express = require("express");
const { createStoreOrder } = require("../controllers/storeOrderController");
const { optionalCustomer } = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.post("/", optionalCustomer, createStoreOrder);

module.exports = router;
