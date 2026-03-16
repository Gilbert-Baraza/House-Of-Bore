const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
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

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    discountedPrice: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String, default: "", trim: true },
    selectedSize: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    phone: { type: String, default: "", trim: true },
    tier: { type: String, enum: ["new", "returning", "vip"], default: "new" },
    isSubscribed: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "", trim: true },
    totalSpent: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: Date },
    defaultAddress: { type: addressSchema, default: () => ({}) },
    cartItems: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
