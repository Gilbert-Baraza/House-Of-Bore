const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");

const getDashboardStats = async (req, res) => {
  const [productCount, categoryCount, orderCount, lowStockProducts, recentOrders, revenueData, paidOrders, pendingOrders] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(5),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
      ]),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.countDocuments({ status: "pending" })
    ]);

  res.json({
    success: true,
    data: {
      cards: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        revenue: revenueData[0]?.revenue || 0,
        paidOrders,
        pendingOrders
      },
      lowStockProducts,
      recentOrders
    }
  });
};

module.exports = { getDashboardStats };
