const Order = require("../models/Order");

const listOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
};

const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, paymentStatus },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: order });
};

module.exports = { listOrders, updateOrderStatus };
