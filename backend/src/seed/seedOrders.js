require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Customer = require("../models/Customer");

const runSeed = async () => {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: 1 });

    if (products.length < 4) {
      throw new Error("Seed products first before creating sample orders");
    }

    await Customer.deleteMany({});
    await Order.deleteMany({});

    const customers = await Customer.insertMany([
      {
        name: "Naomi Wanjiku",
        email: "naomi@example.com",
        phone: "+254700123001",
        tier: "vip",
        isSubscribed: true,
        tags: ["high-value", "repeat-buyer"],
        notes: "Prefers express delivery for gifting orders.",
        defaultAddress: {
          fullName: "Naomi Wanjiku",
          line1: "14 Riverside Drive",
          city: "Nairobi",
          region: "Nairobi County",
          postalCode: "00100",
          country: "Kenya"
        }
      },
      {
        name: "Brian Otieno",
        email: "brian@example.com",
        phone: "+254700123002",
        tier: "new",
        isSubscribed: false,
        tags: ["new-customer"],
        notes: "Watching response time before subscribing.",
        defaultAddress: {
          fullName: "Brian Otieno",
          line1: "44 Kisumu Road",
          city: "Kisumu",
          region: "Kisumu County",
          postalCode: "40100",
          country: "Kenya"
        }
      },
      {
        name: "Amina Yusuf",
        email: "amina@example.com",
        phone: "+254700123003",
        tier: "returning",
        isSubscribed: true,
        tags: ["loyalty"],
        notes: "Frequently orders occasion wear.",
        defaultAddress: {
          fullName: "Amina Yusuf",
          line1: "8 Nyali Links",
          city: "Mombasa",
          region: "Mombasa County",
          postalCode: "80100",
          country: "Kenya"
        }
      }
    ]);

    const orders = [
      {
        orderNumber: "HOB-1001",
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerEmail: customers[0].email,
        customerPhone: customers[0].phone,
        status: "to_be_shipped",
        paymentStatus: "paid",
        deliveryMethod: "express",
        trackingNumber: "HOB-EXP-8841",
        fulfillmentNotes: "Packed with premium gift wrap and dispatch priority.",
        internalNote: "VIP customer, confirm courier handoff.",
        shippingAddress: customers[0].defaultAddress,
        statusTimeline: [
          { status: "unpaid", note: "Order created" },
          { status: "to_be_shipped", note: "Payment confirmed and stock allocated" }
        ],
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
        customer: customers[1]._id,
        customerName: customers[1].name,
        customerEmail: customers[1].email,
        customerPhone: customers[1].phone,
        status: "unpaid",
        paymentStatus: "pending",
        deliveryMethod: "standard",
        fulfillmentNotes: "Awaiting payment confirmation before picking.",
        internalNote: "Hold stock for 24 hours.",
        shippingAddress: customers[1].defaultAddress,
        statusTimeline: [{ status: "unpaid", note: "Order created" }],
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
        customer: customers[2]._id,
        customerName: customers[2].name,
        customerEmail: customers[2].email,
        customerPhone: customers[2].phone,
        status: "shipped",
        paymentStatus: "paid",
        deliveryMethod: "standard",
        trackingNumber: "HOB-STD-5520",
        fulfillmentNotes: "Customer requested delivery before weekend.",
        internalNote: "Send follow-up review request after delivery.",
        shippingAddress: customers[2].defaultAddress,
        statusTimeline: [
          { status: "unpaid", note: "Order created" },
          { status: "to_be_shipped", note: "Prepared by warehouse" },
          { status: "to_be_shipped", note: "Packed and labeled" },
          { status: "shipped", note: "Handed to courier" }
        ],
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
    await Promise.all(
      customers.map(async (customer) => {
        const customerOrders = orders.filter((order) => String(order.customer) === String(customer._id));
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const lastOrderAt = customerOrders.length ? new Date() : null;

        await Customer.findByIdAndUpdate(customer._id, {
          totalSpent,
          orderCount: customerOrders.length,
          lastOrderAt
        });
      })
    );

    console.log("Orders seeded successfully");
  } catch (error) {
    console.error("Order seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
