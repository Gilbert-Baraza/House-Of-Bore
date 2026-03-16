require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Order = require("../models/Order");

const runSeed = async () => {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: 1 });

    if (products.length < 3) {
      throw new Error("Seed products first before creating sample orders");
    }

    await Order.deleteMany({});

    const orders = [
      {
        orderNumber: "HOB-1001",
        customerName: "Naomi Wanjiku",
        customerEmail: "naomi@example.com",
        status: "processing",
        paymentStatus: "paid",
        totalAmount: products[0].discountedPrice + products[3].discountedPrice,
        items: [
          {
            product: products[0]._id,
            title: products[0].title,
            image: products[0].image,
            quantity: 1,
            unitPrice: products[0].discountedPrice
          },
          {
            product: products[3]._id,
            title: products[3].title,
            image: products[3].image,
            quantity: 1,
            unitPrice: products[3].discountedPrice
          }
        ]
      },
      {
        orderNumber: "HOB-1002",
        customerName: "Brian Otieno",
        customerEmail: "brian@example.com",
        status: "pending",
        paymentStatus: "pending",
        totalAmount: products[1].discountedPrice * 2,
        items: [
          {
            product: products[1]._id,
            title: products[1].title,
            image: products[1].image,
            quantity: 2,
            unitPrice: products[1].discountedPrice
          }
        ]
      },
      {
        orderNumber: "HOB-1003",
        customerName: "Amina Yusuf",
        customerEmail: "amina@example.com",
        status: "shipped",
        paymentStatus: "paid",
        totalAmount: products[2].discountedPrice,
        items: [
          {
            product: products[2]._id,
            title: products[2].title,
            image: products[2].image,
            quantity: 1,
            unitPrice: products[2].discountedPrice
          }
        ]
      }
    ];

    await Order.insertMany(orders);
    console.log("Orders seeded successfully");
  } catch (error) {
    console.error("Order seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
