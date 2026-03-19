const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { buildOrderNumber, reserveOrderStock, syncCustomerMetrics } = require("../utils/orderHelpers");
const { normalizeTimelineStatus } = require("../utils/orderStatus");
const { initiateMpesaPayment, normalizeMpesaPhoneNumber } = require("../services/mpesaService");

const createStoreOrder = async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    items,
    deliveryMethod = "standard",
    shippingAddress,
    isSubscribed = true,
    paymentMethod = "mpesa",
    mpesaPhoneNumber = ""
  } = req.body;

  if (!customerName || !customerEmail || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Customer details and at least one order item are required"
    });
  }

  if (!["mpesa", "paypal"].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: "Selected payment method is not supported" });
  }

  const normalizedMpesaPhone =
    paymentMethod === "mpesa"
      ? normalizeMpesaPhoneNumber(mpesaPhoneNumber || customerPhone)
      : "";

  if (paymentMethod === "mpesa" && !normalizedMpesaPhone) {
    return res.status(400).json({ success: false, message: "A valid M-Pesa phone number is required" });
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
    paymentMethod,
    deliveryMethod,
    shippingAddress: shippingAddress || {},
    totalAmount,
    items: normalizedItems,
    mpesaPayment: paymentMethod === "mpesa" ? { phoneNumber: normalizedMpesaPhone } : {},
    statusTimeline: [{ status: normalizeTimelineStatus("unpaid"), note: "Order placed from storefront checkout" }]
  });

  let paymentInitiation = null;

  if (paymentMethod === "mpesa") {
    try {
      paymentInitiation = await initiateMpesaPayment({
        orderNumber: order.orderNumber,
        amount: totalAmount,
        phoneNumber: normalizedMpesaPhone
      });

      order.mpesaPayment = {
        ...(order.mpesaPayment?.toObject?.() || order.mpesaPayment || {}),
        phoneNumber: paymentInitiation.phoneNumber,
        merchantRequestId: paymentInitiation.merchantRequestId,
        checkoutRequestId: paymentInitiation.checkoutRequestId,
        customerMessage: paymentInitiation.customerMessage,
        resultDesc: paymentInitiation.responseDescription
      };

      order.statusTimeline.push({
        status: normalizeTimelineStatus("unpaid"),
        note:
          paymentInitiation.mode === "live"
            ? `M-Pesa payment request sent to ${paymentInitiation.phoneNumber}`
            : "Demo M-Pesa payment request prepared. Live credentials are not configured yet."
      });
    } catch (error) {
      order.paymentStatus = "failed";
      order.statusTimeline.push({
        status: normalizeTimelineStatus("unpaid"),
        note: `M-Pesa request failed: ${error.message}`
      });
      await order.save();

      return res.status(502).json({
        success: false,
        message: error.message || "Unable to initiate M-Pesa payment"
      });
    }
  }

  await order.save();

  await syncCustomerMetrics(customer._id);

  res.status(201).json({
    success: true,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerId: customer._id,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      mpesaPhoneNumber: order.mpesaPayment?.phoneNumber || "",
      paymentInitiation
    }
  });
};

const handleMpesaCallback = async (req, res) => {
  const callback = req.body?.Body?.stkCallback;

  if (!callback?.CheckoutRequestID) {
    return res.json({ ResultCode: 0, ResultDesc: "Ignored" });
  }

  const order = await Order.findOne({ "mpesaPayment.checkoutRequestId": callback.CheckoutRequestID });

  if (!order) {
    return res.json({ ResultCode: 0, ResultDesc: "Order not found" });
  }

  const metadata = Array.isArray(callback.CallbackMetadata?.Item)
    ? callback.CallbackMetadata.Item
    : [];
  const findMetadataValue = (name) => metadata.find((item) => item.Name === name)?.Value;
  const resultCode = Number(callback.ResultCode ?? 1);
  const resultDescription = callback.ResultDesc || "";
  const receiptNumber = findMetadataValue("MpesaReceiptNumber") || "";
  const transactionDate = findMetadataValue("TransactionDate") || "";
  const callbackPhone = normalizeMpesaPhoneNumber(findMetadataValue("PhoneNumber") || order.mpesaPayment?.phoneNumber || "");

  order.mpesaPayment = {
    ...(order.mpesaPayment?.toObject?.() || order.mpesaPayment || {}),
    phoneNumber: callbackPhone || order.mpesaPayment?.phoneNumber || "",
    merchantRequestId: callback.MerchantRequestID || order.mpesaPayment?.merchantRequestId || "",
    checkoutRequestId: callback.CheckoutRequestID || order.mpesaPayment?.checkoutRequestId || "",
    receiptNumber,
    transactionDate: transactionDate ? String(transactionDate) : "",
    resultCode,
    resultDesc: resultDescription
  };

  if (resultCode === 0) {
    order.paymentStatus = "paid";
    order.status = "to_be_shipped";
    order.statusTimeline.push({
      status: normalizeTimelineStatus("to_be_shipped"),
      note: receiptNumber
        ? `M-Pesa payment confirmed. Receipt ${receiptNumber}`
        : "M-Pesa payment confirmed successfully"
    });
  } else {
    order.paymentStatus = "failed";
    order.statusTimeline.push({
      status: normalizeTimelineStatus(order.status),
      note: `M-Pesa payment failed: ${resultDescription || "Customer cancelled or payment was not completed"}`
    });
  }

  await order.save();
  await syncCustomerMetrics(order.customer);

  return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
};

module.exports = { createStoreOrder, handleMpesaCallback };
