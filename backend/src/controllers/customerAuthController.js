const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const createCustomerToken = (customer) =>
  jwt.sign(
    { id: customer._id, type: "customer" },
    process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || "change-me",
    { expiresIn: "7d" }
  );

const sanitizeCustomer = (customer) => ({
  id: customer._id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  tier: customer.tier,
  isSubscribed: customer.isSubscribed,
  orderCount: customer.orderCount,
  totalSpent: customer.totalSpent,
  defaultAddress: customer.defaultAddress
});

const signupCustomer = async (req, res) => {
  const { name, email, password, phone, isSubscribed } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });

  if (existingCustomer && existingCustomer.password) {
    return res.status(409).json({ success: false, message: "An account already exists with that email" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let customer = existingCustomer;

  if (customer) {
    customer.name = name;
    customer.phone = phone || customer.phone || "";
    customer.isSubscribed = typeof isSubscribed === "boolean" ? isSubscribed : customer.isSubscribed;
    customer.password = hashedPassword;
    await customer.save();
  } else {
    customer = await Customer.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      isSubscribed: typeof isSubscribed === "boolean" ? isSubscribed : true
    });
  }

  res.status(201).json({
    success: true,
    token: createCustomerToken(customer),
    data: sanitizeCustomer(customer)
  });
};

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const customer = await Customer.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!customer || !customer.password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const passwordMatches = await bcrypt.compare(password, customer.password);

  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({
    success: true,
    token: createCustomerToken(customer),
    data: sanitizeCustomer(customer)
  });
};

const getCustomerProfile = async (req, res) => {
  res.json({ success: true, data: sanitizeCustomer(req.customer) });
};

const updateCustomerProfile = async (req, res) => {
  const customer = await Customer.findById(req.customer._id);

  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  const { name, phone, isSubscribed, defaultAddress } = req.body;

  if (typeof name === "string") customer.name = name;
  if (typeof phone === "string") customer.phone = phone;
  if (typeof isSubscribed === "boolean") customer.isSubscribed = isSubscribed;
  if (defaultAddress) {
    customer.defaultAddress = {
      ...(customer.defaultAddress?.toObject?.() || customer.defaultAddress || {}),
      ...defaultAddress
    };
  }

  await customer.save();

  res.json({ success: true, data: sanitizeCustomer(customer) });
};

module.exports = {
  signupCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile
};
