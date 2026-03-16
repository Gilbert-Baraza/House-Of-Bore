const Customer = require("../models/Customer");

const normalizeCartItem = (item) => ({
  productId: item.productId || item.id || item._id || item.product,
  title: item.title,
  image: item.image,
  category: item.category,
  discountedPrice: Number(item.discountedPrice),
  oldPrice: Number(item.oldPrice),
  quantity: Number(item.quantity || 1),
  selectedColor: item.selectedColor || "",
  selectedSize: item.selectedSize || ""
});

const serializeCartItem = (item) => ({
  id: String(item.productId),
  productId: String(item.productId),
  title: item.title,
  image: item.image,
  category: item.category,
  discountedPrice: item.discountedPrice,
  oldPrice: item.oldPrice,
  quantity: item.quantity,
  selectedColor: item.selectedColor,
  selectedSize: item.selectedSize
});

const getMyCart = async (req, res) => {
  const customer = await Customer.findById(req.customer._id);

  res.json({
    success: true,
    data: (customer?.cartItems || []).map(serializeCartItem)
  });
};

const replaceMyCart = async (req, res) => {
  const cartItems = Array.isArray(req.body.items) ? req.body.items.map(normalizeCartItem) : [];
  const customer = await Customer.findById(req.customer._id);

  if (!customer) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  customer.cartItems = cartItems;
  await customer.save();

  res.json({
    success: true,
    data: customer.cartItems.map(serializeCartItem)
  });
};

module.exports = {
  getMyCart,
  replaceMyCart
};
