const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const resolveCustomerFromHeader = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(
    token,
    process.env.CUSTOMER_JWT_SECRET || process.env.JWT_SECRET || "change-me"
  );

  if (decoded.type !== "customer") {
    return null;
  }

  return Customer.findById(decoded.id);
};

const protectCustomer = async (req, res, next) => {
  try {
    const customer = await resolveCustomerFromHeader(req.headers.authorization);

    if (!customer) {
      return res.status(401).json({ success: false, message: "Please sign in to continue" });
    }

    req.customer = customer;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid customer session" });
  }
};

const optionalCustomer = async (req, res, next) => {
  try {
    const customer = await resolveCustomerFromHeader(req.headers.authorization);

    if (customer) {
      req.customer = customer;
    }
  } catch (error) {
    req.customer = null;
  }

  return next();
};

module.exports = {
  protectCustomer,
  optionalCustomer
};
