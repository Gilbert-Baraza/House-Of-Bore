const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true
    },
    image: { type: String, required: true, trim: true },
    galleryImages: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    discountedPrice: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    care: { type: String, required: true, trim: true },
    fit: { type: String, required: true, trim: true },
    pattern: { type: String, required: true, trim: true },
    colors: { type: [colorSchema], default: [] },
    sizes: { type: [String], default: [] },
    isNewArrival: { type: Boolean, default: false },
    isTopSelling: { type: Boolean, default: false },
    stock: { type: Number, default: 0, min: 0 }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);
