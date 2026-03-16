require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const AdminUser = require("../models/AdminUser");

const runSeed = async () => {
  try {
    await connectDB();
    await AdminUser.deleteMany({});

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin12345", 10);

    await AdminUser.create({
      name: "House of bore Admin",
      email: process.env.ADMIN_EMAIL || "admin@houseofbore.com",
      password: hashedPassword,
      role: "super_admin"
    });

    console.log("Admin user seeded successfully");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
