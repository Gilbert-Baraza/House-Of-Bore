const Order = require("../models/Order");
const { normalizeOrderStatus, normalizeTimelineStatus } = require("../utils/orderStatus");

const appendTimelineEntry = (order, note, statusOverride) => {
  const trimmedNote = typeof note === "string" ? note.trim() : "";

  if (!trimmedNote) {
    return;
  }

  order.statusTimeline.push({
    status: normalizeTimelineStatus(statusOverride || order.status),
    note: trimmedNote
  });
};

const serializeOrder = (order) => {
  const source = order.toObject ? order.toObject() : order;

  return {
    ...source,
    status: normalizeOrderStatus(source.status, source.paymentStatus),
    statusTimeline: (source.statusTimeline || []).map((item) => ({
      ...item,
      status: normalizeTimelineStatus(item.status)
    }))
  };
};

const listOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("customer")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders.map(serializeOrder) });
};

const updateOrderStatus = async (req, res) => {
  const { status, paymentStatus, statusNote, paymentNote, customerUpdate } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  order.status = normalizeOrderStatus(order.status, order.paymentStatus);
  order.statusTimeline = (order.statusTimeline || []).map((item) => ({
    ...item,
    status: normalizeTimelineStatus(item.status)
  }));

  const normalizedCustomerUpdate = typeof customerUpdate === "string" ? customerUpdate.trim() : "";
  const statusChanged = Boolean(status && status !== order.status);
  const paymentChanged = Boolean(paymentStatus && paymentStatus !== order.paymentStatus);

  if (status && status !== order.status) {
    order.status = status;
    appendTimelineEntry(order, statusNote || normalizedCustomerUpdate || `Order marked as ${status}`, status);
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  if (paymentChanged) {
    appendTimelineEntry(
      order,
      paymentNote || (!statusChanged ? normalizedCustomerUpdate : "") || `Payment status updated to ${paymentStatus}`
    );
  }

  if (!statusChanged && !paymentChanged && normalizedCustomerUpdate) {
    appendTimelineEntry(order, normalizedCustomerUpdate);
  }

  await order.save();

  res.json({ success: true, data: serializeOrder(order) });
};

const updateOrderDetails = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  order.status = normalizeOrderStatus(order.status, order.paymentStatus);
  order.statusTimeline = (order.statusTimeline || []).map((item) => ({
    ...item,
    status: normalizeTimelineStatus(item.status)
  }));

  const {
    deliveryMethod,
    courierName,
    trackingNumber,
    courierTrackingUrl,
    estimatedDeliveryDate,
    fulfillmentNotes,
    internalNote,
    shippingAddress,
    customerUpdate
  } = req.body;
  const normalizedCustomerUpdate = typeof customerUpdate === "string" ? customerUpdate.trim() : "";
  const existingAddress = order.shippingAddress?.toObject?.() || order.shippingAddress || {};
  let timelineUpdated = false;

  if (deliveryMethod && deliveryMethod !== order.deliveryMethod) {
    order.deliveryMethod = deliveryMethod;
    appendTimelineEntry(order, `Delivery method updated to ${deliveryMethod}`);
    timelineUpdated = true;
  }

  if (typeof courierName === "string" && courierName !== order.courierName) {
    order.courierName = courierName;
    appendTimelineEntry(
      order,
      courierName ? `Courier updated to ${courierName}` : "Courier assignment cleared while shipment is being reviewed"
    );
    timelineUpdated = true;
  }

  if (typeof trackingNumber === "string" && trackingNumber !== order.trackingNumber) {
    order.trackingNumber = trackingNumber;
    appendTimelineEntry(
      order,
      trackingNumber
        ? `Tracking number updated to ${trackingNumber}`
        : "Tracking number cleared while delivery is being reviewed"
    );
    timelineUpdated = true;
  }

  if (typeof courierTrackingUrl === "string" && courierTrackingUrl !== order.courierTrackingUrl) {
    order.courierTrackingUrl = courierTrackingUrl;
    appendTimelineEntry(
      order,
      courierTrackingUrl
        ? "Courier tracking link updated for customer access"
        : "Courier tracking link removed while shipment details are being updated"
    );
    timelineUpdated = true;
  }

  if (estimatedDeliveryDate !== undefined) {
    const nextEstimatedDate = estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null;
    const currentEstimatedDate = order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate) : null;
    const isValidDate = nextEstimatedDate ? !Number.isNaN(nextEstimatedDate.getTime()) : true;
    const hasChanged =
      (!currentEstimatedDate && nextEstimatedDate) ||
      (currentEstimatedDate && !nextEstimatedDate) ||
      (currentEstimatedDate && nextEstimatedDate && currentEstimatedDate.getTime() !== nextEstimatedDate.getTime());

    if (!isValidDate) {
      return res.status(400).json({ success: false, message: "Estimated delivery date is invalid" });
    }

    if (hasChanged) {
      order.estimatedDeliveryDate = nextEstimatedDate;
      appendTimelineEntry(
        order,
        nextEstimatedDate
          ? `Estimated delivery updated to ${nextEstimatedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            })}`
          : "Estimated delivery date cleared while the delivery schedule is being updated"
      );
      timelineUpdated = true;
    }
  }

  if (typeof fulfillmentNotes === "string" && fulfillmentNotes !== order.fulfillmentNotes) {
    order.fulfillmentNotes = fulfillmentNotes;
    appendTimelineEntry(order, normalizedCustomerUpdate || fulfillmentNotes || "Fulfillment instructions updated");
    timelineUpdated = true;
  }

  if (typeof internalNote === "string") {
    order.internalNote = internalNote;
  }

  if (shippingAddress) {
    order.shippingAddress = {
      ...existingAddress,
      ...shippingAddress
    };
  }

  if (!timelineUpdated && normalizedCustomerUpdate) {
    appendTimelineEntry(order, normalizedCustomerUpdate);
  }

  await order.save();

  res.json({ success: true, data: serializeOrder(order) });
};

module.exports = { listOrders, updateOrderStatus, updateOrderDetails };
