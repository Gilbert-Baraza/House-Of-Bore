require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const slugify = require("../utils/slugify");

const categories = [
  {
    name: "Shoes",
    description: "Sneakers, slides, formal pairs, and everyday footwear for every wardrobe.",
    isFeatured: true
  },
  {
    name: "Men",
    description: "Modern menswear essentials built for casual, work, and occasion styling.",
    isFeatured: true
  },
  {
    name: "Women",
    description: "Curated dresses, fashion basics, and statement pieces for confident looks.",
    isFeatured: true
  },
  {
    name: "Jeweleries",
    description: "Finishing touches including necklaces, rings, bracelets, and gifting staples.",
    isFeatured: false
  }
];

const runSeed = async () => {
  try {
    await connectDB();
    await Category.deleteMany({});
    await Category.insertMany(
      categories.map((category) => ({
        ...category,
        slug: slugify(category.name)
      }))
    );
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("Category seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

runSeed();
