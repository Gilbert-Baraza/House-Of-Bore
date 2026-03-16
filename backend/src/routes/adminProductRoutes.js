const express = require("express");
const {
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct
} = require("../controllers/adminProductController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protectAdmin, listAdminProducts);
router.post("/", protectAdmin, createAdminProduct);
router.put("/:id", protectAdmin, updateAdminProduct);
router.delete("/:id", protectAdmin, deleteAdminProduct);

module.exports = router;
