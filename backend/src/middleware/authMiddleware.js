const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const { getPermissionsForRole } = require("../utils/permissions");

const protectAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change-me");
    const admin = await AdminUser.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: "Admin account not available" });
    }

    req.admin = {
      ...admin.toObject(),
      permissions: getPermissionsForRole(admin.role)
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const authorizePermissions = (...requiredPermissions) => (req, res, next) => {
  const adminPermissions = req.admin?.permissions || [];
  const hasAccess = requiredPermissions.every((permission) => adminPermissions.includes(permission));

  if (!hasAccess) {
    return res.status(403).json({ success: false, message: "You do not have permission for this action" });
  }

  return next();
};

module.exports = { protectAdmin, authorizePermissions };
