const express = require("express");
const {
  listProducts,
  getProductById,
  createProduct
} = require("../controllers/productController");

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);

module.exports = router;
