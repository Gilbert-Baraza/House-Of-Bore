const Customer = require("../models/Customer");
const Order = require("../models/Order");

const listCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ lastOrderAt: -1, createdAt: -1 });
  res.json({ success: true, count: customers.length, data: customers });
};

const getCustomerOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
};

const updateCustomer = async (req, res) => {
  const { tier, isSubscribed, tags, notes, phone } = req.body;
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      tier,
      isSubscribed,
      tags,
      notes,
      phone
    },
    { new: true, runValidators: true }
  );

  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  res.json({ success: true, data: customer });
};

module.exports = {
  listCustomers,
  getCustomerOrders,
  updateCustomer
};
