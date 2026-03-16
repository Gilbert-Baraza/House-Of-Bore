const express = require("express");
const { getMyCart, replaceMyCart } = require("../controllers/customerCartController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.get("/me", protectCustomer, getMyCart);
router.put("/me", protectCustomer, replaceMyCart);

module.exports = router;
