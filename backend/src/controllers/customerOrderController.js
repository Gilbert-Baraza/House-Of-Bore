const Order = require("../models/Order");
const { normalizeOrderStatus, normalizeTimelineStatus } = require("../utils/orderStatus");

const serializeTrackingOrder = (order) => ({
  id: order._id,
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  status: normalizeOrderStatus(order.status, order.paymentStatus),
  paymentStatus: order.paymentStatus,
  deliveryMethod: order.deliveryMethod,
  courierName: order.courierName,
  trackingNumber: order.trackingNumber,
  courierTrackingUrl: order.courierTrackingUrl,
  estimatedDeliveryDate: order.estimatedDeliveryDate,
  fulfillmentNotes: order.fulfillmentNotes,
  shippingAddress: order.shippingAddress,
  totalAmount: order.totalAmount,
  items: order.items,
  statusTimeline: (order.statusTimeline || []).map((item) => ({
    ...(item.toObject?.() || item),
    status: normalizeTimelineStatus(item.status)
  })),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

const listMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.customer._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders.map(serializeTrackingOrder) });
};

const getMyOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.customer._id });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, data: serializeTrackingOrder(order) });
};

const trackOrderPublic = async (req, res) => {
  const { orderNumber, email } = req.query;

  if (!orderNumber || !email) {
    return res.status(400).json({
      success: false,
      message: "Order number and email are required"
    });
  }

  const order = await Order.findOne({
    orderNumber: orderNumber.trim(),
    customerEmail: email.toLowerCase().trim()
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "No matching order was found" });
  }

  res.json({ success: true, data: serializeTrackingOrder(order) });
};

module.exports = { listMyOrders, getMyOrderById, trackOrderPublic };
