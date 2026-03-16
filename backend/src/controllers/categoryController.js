const Category = require("../models/Category");
const slugify = require("../utils/slugify");

const listCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, count: categories.length, data: categories });
};

const createCategory = async (req, res) => {
  const { name, description, isFeatured } = req.body;
  const category = await Category.create({
    name,
    slug: slugify(name),
    description,
    isFeatured
  });

  res.status(201).json({ success: true, data: category });
};

const updateCategory = async (req, res) => {
  const { name, description, isFeatured } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
      slug: slugify(name),
      description,
      isFeatured
    },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, data: category });
};

const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, message: "Category deleted" });
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
