const Product = require("../models/Product");
const slugify = require("../utils/slugify");

const listAdminProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, data: products });
};

const createAdminProduct = async (req, res) => {
  const product = await Product.create({
    ...req.body,
    galleryImages: req.body.galleryImages || [],
    slug: slugify(req.body.title)
  });

  res.status(201).json({ success: true, data: product });
};

const updateAdminProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      galleryImages: req.body.galleryImages || [],
      slug: slugify(req.body.title)
    },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
};

const deleteAdminProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, message: "Product deleted" });
};

module.exports = {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
};
