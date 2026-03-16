const express = require("express");
const cors = require("cors");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerRoutes = require("./routes/customerRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const storeOrderRoutes = require("./routes/storeOrderRoutes");
const storeCategoryRoutes = require("./routes/storeCategoryRoutes");
const customerAuthRoutes = require("./routes/customerAuthRoutes");
const customerOrderRoutes = require("./routes/customerOrderRoutes");

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:3001"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "House of bore backend is running"
  });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", storeCategoryRoutes);
app.use("/api/orders", storeOrderRoutes);
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/uploads", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

module.exports = app;
