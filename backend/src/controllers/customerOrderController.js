const Order = require("../models/Order");

const listMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
};

module.exports = { listMyOrders };
