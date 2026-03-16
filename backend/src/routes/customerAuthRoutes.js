const express = require("express");
const {
  signupCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile
} = require("../controllers/customerAuthController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.post("/signup", signupCustomer);
router.post("/login", loginCustomer);
router.get("/me", protectCustomer, getCustomerProfile);
router.put("/me", protectCustomer, updateCustomerProfile);

module.exports = router;
