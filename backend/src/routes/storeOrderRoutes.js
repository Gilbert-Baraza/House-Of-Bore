const express = require("express");
const { createStoreOrder } = require("../controllers/storeOrderController");
const { optionalCustomer } = require("../middleware/customerAuthMiddleware");
const { trackOrderPublic } = require("../controllers/customerOrderController");

const router = express.Router();

router.get("/track", trackOrderPublic);
router.post("/", optionalCustomer, createStoreOrder);

module.exports = router;
