const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { buildOrderNumber, reserveOrderStock, syncCustomerMetrics } = require("../utils/orderHelpers");
const { normalizeTimelineStatus } = require("../utils/orderStatus");

const createStoreOrder = async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    items,
    deliveryMethod = "standard",
    shippingAddress,
    isSubscribed = true
  } = req.body;

  if (!customerName || !customerEmail || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Customer details and at least one order item are required"
    });
  }

  const normalizedItems = await reserveOrderStock(items);
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  let customer = req.customer || (await Customer.findOne({ email: customerEmail.toLowerCase().trim() }));

  if (req.customer && String(req.customer.email).toLowerCase() !== String(customerEmail).toLowerCase()) {
    return res.status(400).json({ success: false, message: "Checkout email must match the signed-in account" });
  }

  if (!customer) {
    customer = await Customer.create({
      name: customerName,
      email: customerEmail.toLowerCase().trim(),
      phone: customerPhone || "",
      isSubscribed,
      defaultAddress: shippingAddress || {}
    });
  } else {
    customer.name = customerName;
    customer.email = customer.email || customerEmail.toLowerCase().trim();
    customer.phone = customerPhone || customer.phone || "";
    if (typeof isSubscribed === "boolean") {
      customer.isSubscribed = isSubscribed;
    }
    customer.defaultAddress = {
      ...(customer.defaultAddress?.toObject?.() || customer.defaultAddress || {}),
      ...(shippingAddress || {})
    };
    await customer.save();
  }

  const order = await Order.create({
    orderNumber: await buildOrderNumber(),
    customer: customer._id,
    customerName,
    customerEmail: customer.email,
    customerPhone: customerPhone || "",
    status: "unpaid",
    paymentStatus: "pending",
    deliveryMethod,
    shippingAddress: shippingAddress || {},
    totalAmount,
    items: normalizedItems,
    statusTimeline: [{ status: normalizeTimelineStatus("unpaid"), note: "Order placed from storefront checkout" }]
  });

  await syncCustomerMetrics(customer._id);

  res.status(201).json({
    success: true,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerId: customer._id
    }
  });
};

module.exports = { createStoreOrder };
