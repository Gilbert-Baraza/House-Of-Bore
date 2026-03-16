const Product = require("../models/Product");

const buildProductQuery = ({ category, featured }) => {
  const query = {};

  if (category && category !== "All") {
    query.category = category;
  }

  if (featured === "new") {
    query.isNewArrival = true;
  }

  if (featured === "top") {
    query.isTopSelling = true;
  }

  return query;
};

const listProducts = async (req, res) => {
  const { category, featured, sort = "createdAt", order = "desc" } = req.query;
  const sortDirection = order === "asc" ? 1 : -1;
  const sortMap = {
    createdAt: { createdAt: sortDirection },
    price: { discountedPrice: sortDirection },
    rating: { rating: sortDirection },
    title: { title: sortDirection }
  };

  const products = await Product.find(buildProductQuery({ category, featured })).sort(
    sortMap[sort] || sortMap.createdAt
  );

  res.json({
    success: true,
    count: products.length,
    data: products
  });
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, data: product });
};

const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
};

module.exports = {
  listProducts,
  getProductById,
  createProduct
};
