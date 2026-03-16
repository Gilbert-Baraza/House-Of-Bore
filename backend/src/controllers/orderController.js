const Order = require("../models/Order");

const listOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("customer")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
};

const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (status && status !== order.status) {
    order.status = status;
    order.statusTimeline.push({
      status,
      note: req.body.statusNote || ""
    });
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();

  res.json({ success: true, data: order });
};

const updateOrderDetails = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  const {
    deliveryMethod,
    trackingNumber,
    fulfillmentNotes,
    internalNote,
    shippingAddress
  } = req.body;

  if (deliveryMethod) {
    order.deliveryMethod = deliveryMethod;
  }

  if (typeof trackingNumber === "string") {
    order.trackingNumber = trackingNumber;
  }

  if (typeof fulfillmentNotes === "string") {
    order.fulfillmentNotes = fulfillmentNotes;
  }

  if (typeof internalNote === "string") {
    order.internalNote = internalNote;
  }

  if (shippingAddress) {
    order.shippingAddress = {
      ...(order.shippingAddress?.toObject?.() || order.shippingAddress || {}),
      ...shippingAddress
    };
  }

  await order.save();

  res.json({ success: true, data: order });
};

module.exports = { listOrders, updateOrderStatus, updateOrderDetails };
