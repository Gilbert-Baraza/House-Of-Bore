const express = require("express");
const { createStoreOrder, handleMpesaCallback } = require("../controllers/storeOrderController");
const { optionalCustomer } = require("../middleware/customerAuthMiddleware");
const { trackOrderPublic } = require("../controllers/customerOrderController");

const router = express.Router();

router.get("/track", trackOrderPublic);
router.post("/mpesa/callback", handleMpesaCallback);
router.post("/", optionalCustomer, createStoreOrder);

module.exports = router;
