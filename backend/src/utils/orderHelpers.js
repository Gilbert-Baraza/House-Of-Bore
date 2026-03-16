const Product = require("../models/Product");
const Customer = require("../models/Customer");

const buildOrderNumber = async () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `HOB-${timestamp}${randomSuffix}`;
};

const syncCustomerMetrics = async (customerId) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    return null;
  }

  const Order = require("../models/Order");
  const orders = await Order.find({ customer: customerId });
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const lastOrderAt = orders.length ? orders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt : null;

  customer.totalSpent = totalSpent;
  customer.orderCount = orders.length;
  customer.lastOrderAt = lastOrderAt;
  customer.tier = totalSpent >= 150 ? "vip" : orders.length > 1 ? "returning" : "new";
  await customer.save();

  return customer;
};

const reserveOrderStock = async (items) => {
  const normalizedItems = [];
  const productEntries = [];

  for (const item of items) {
    const productId = item.productId || item.id || item._id || item.product;
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error(`Product not found for item ${item.title || productId}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.title} has only ${product.stock} left in stock`);
    }
    productEntries.push({ product, item });
  }

  for (const entry of productEntries) {
    entry.product.stock -= entry.item.quantity;
    await entry.product.save();

    normalizedItems.push({
      product: entry.product._id,
      title: entry.product.title,
      image: entry.product.image,
      quantity: entry.item.quantity,
      unitPrice: entry.product.discountedPrice,
      selectedColor: entry.item.selectedColor || "",
      selectedSize: entry.item.selectedSize || ""
    });
  }

  return normalizedItems;
};

module.exports = {
  buildOrderNumber,
  syncCustomerMetrics,
  reserveOrderStock
};
