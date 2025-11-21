import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET /api/products - Get all products with filtering
router.get("/", async (req, res) => {
  try {
    const { category, available } = req.query;
    const query = {};
    
    if (category && category !== 'ALL') query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';
    
    const products = await Product.find(query).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// POST /api/products - Create new product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// PATCH /api/products/:id - Update product
router.patch("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// POST /api/products/seed - Seed sample products
router.post("/seed", async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.status(400).json({ message: "Products already exist" });
    }

    const sampleProducts = [
      // Food Items
      { name: "Masala Dosa", category: "FOOD", price: 120, description: "Crispy rice crepe with potato filling" },
      { name: "Butter Chicken", category: "FOOD", price: 320, description: "Tender chicken in rich tomato gravy" },
      { name: "Biryani", category: "FOOD", price: 280, description: "Fragrant rice with spices and vegetables" },
      { name: "Paneer Tikka", category: "FOOD", price: 220, description: "Grilled cottage cheese with spices" },
      { name: "Garlic Naan", category: "FOOD", price: 60, description: "Leavened bread with garlic butter" },
      
      // Beverages
      { name: "Masala Chai", category: "BEVERAGE", price: 40, description: "Spiced Indian tea" },
      { name: "Fresh Lime Soda", category: "BEVERAGE", price: 60, description: "Refreshing lime drink" },
      { name: "Mango Lassi", category: "BEVERAGE", price: 80, description: "Sweet yogurt mango drink" },
      { name: "Mineral Water", category: "BEVERAGE", price: 30, description: "500ml bottled water" },
      { name: "Cappuccino", category: "BEVERAGE", price: 120, description: "Espresso with steamed milk" },
      
      // Services
      { name: "Laundry Service", category: "SERVICE", price: 150, description: "Per kg laundry service" },
      { name: "Spa Massage", category: "SERVICE", price: 1200, description: "60-minute relaxation massage" },
      { name: "Airport Transfer", category: "SERVICE", price: 800, description: "One-way airport transfer" },
      { name: "Late Check-out", category: "SERVICE", price: 500, description: "Extended check-out until 4 PM" },
      
      // Amenities
      { name: "Extra Pillow", category: "AMENITY", price: 0, description: "Additional pillow" },
      { name: "Iron & Board", category: "AMENITY", price: 0, description: "On request" },
      { name: "Hair Dryer", category: "AMENITY", price: 0, description: "On request" }
    ];

    await Product.insertMany(sampleProducts);
    res.json({ message: "Sample products created", count: sampleProducts.length });
  } catch (err) {
    console.error("Error seeding products:", err);
    res.status(500).json({ message: "Failed to seed products" });
  }
});

export default router;
