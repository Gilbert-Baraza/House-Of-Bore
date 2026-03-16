const express = require("express");
const {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} = require("../controllers/adminProductController");
const { protectAdmin, authorizePermissions } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

router.get("/", protectAdmin, authorizePermissions(PERMISSIONS.PRODUCTS_READ), listAdminProducts);
router.post("/", protectAdmin, authorizePermissions(PERMISSIONS.PRODUCTS_WRITE), createAdminProduct);
router.put("/:id", protectAdmin, authorizePermissions(PERMISSIONS.PRODUCTS_WRITE), updateAdminProduct);
router.delete("/:id", protectAdmin, authorizePermissions(PERMISSIONS.PRODUCTS_WRITE), deleteAdminProduct);

module.exports = router;
