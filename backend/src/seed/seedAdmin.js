require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const AdminUser = require("../models/AdminUser");

const runSeed = async () => {
  try {
    await connectDB();
    await AdminUser.deleteMany({});

    const users = [
      {
        name: "House of bore Admin",
        email: process.env.ADMIN_EMAIL || "admin@houseofbore.com",
        password: process.env.ADMIN_PASSWORD || "admin12345",
        role: "super_admin"
      },
      {
        name: "House of bore Manager",
        email: "manager@houseofbore.com",
        password: "manager12345",
        role: "manager"
      },
      {
        name: "House of bore Support",
        email: "support@houseofbore.com",
        password: "support12345",
        role: "support"
      }
    ];

    const adminUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    await AdminUser.insertMany(adminUsers);

    console.log("Admin users seeded successfully");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
