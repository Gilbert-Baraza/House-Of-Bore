const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { getPermissionsForRole } = require("../utils/permissions");

const createToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET || "change-me",
    { expiresIn: "7d" }
  );

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const admin = await AdminUser.findOne({ email: email.toLowerCase().trim() });

  if (!admin) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({
    success: true,
    token: createToken(admin),
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: getPermissionsForRole(admin.role)
    }
  });
};

const getProfile = async (req, res) => {
  res.json({ success: true, data: req.admin });
};

module.exports = { loginAdmin, getProfile };
