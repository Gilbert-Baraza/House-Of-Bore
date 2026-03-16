const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Customer = require("../models/Customer");
const { normalizeOrderStatus } = require("../utils/orderStatus");

const getDashboardStats = async (req, res) => {
  const [
    productCount,
    categoryCount,
    orderCount,
    customerCount,
    lowStockProducts,
    recentOrders,
    revenueData,
    paidOrders,
    unpaidOrders,
    subscribedCustomers
  ] =
    await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Customer.countDocuments(),
      Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(5),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
      ]),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.find({}, { status: 1, paymentStatus: 1 }).lean(),
      Customer.countDocuments({ isSubscribed: true })
    ]);

  const unpaidOrderCount = unpaidOrders.filter((order) => normalizeOrderStatus(order.status, order.paymentStatus) === "unpaid").length;

  res.json({
    success: true,
    data: {
      cards: {
        products: productCount,
        categories: categoryCount,
        orders: orderCount,
        customers: customerCount,
        revenue: revenueData[0]?.revenue || 0,
        paidOrders,
        unpaidOrders: unpaidOrderCount,
        subscribedCustomers
      },
      lowStockProducts,
      recentOrders: recentOrders.map((order) => ({
        ...order.toObject(),
        status: normalizeOrderStatus(order.status, order.paymentStatus)
      }))
    }
  });
};

module.exports = { getDashboardStats };
