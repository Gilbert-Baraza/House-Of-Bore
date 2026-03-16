const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    selectedColor: { type: String, default: "", trim: true },
    selectedSize: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const orderTimelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "", trim: true },
    line1: { type: String, default: "", trim: true },
    line2: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    customerPhone: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "packed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    deliveryMethod: {
      type: String,
      enum: ["standard", "express", "pickup"],
      default: "standard"
    },
    trackingNumber: { type: String, default: "", trim: true },
    fulfillmentNotes: { type: String, default: "", trim: true },
    internalNote: { type: String, default: "", trim: true },
    shippingAddress: { type: shippingAddressSchema, default: () => ({}) },
    statusTimeline: { type: [orderTimelineSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    items: { type: [orderItemSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
