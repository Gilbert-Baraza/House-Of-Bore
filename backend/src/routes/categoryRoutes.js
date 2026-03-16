const express = require("express");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");
const { protectAdmin, authorizePermissions } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

router.get("/", protectAdmin, authorizePermissions(PERMISSIONS.CATEGORIES_READ), listCategories);
router.post("/", protectAdmin, authorizePermissions(PERMISSIONS.CATEGORIES_WRITE), createCategory);
router.put("/:id", protectAdmin, authorizePermissions(PERMISSIONS.CATEGORIES_WRITE), updateCategory);
router.delete("/:id", protectAdmin, authorizePermissions(PERMISSIONS.CATEGORIES_WRITE), deleteCategory);

module.exports = router;
