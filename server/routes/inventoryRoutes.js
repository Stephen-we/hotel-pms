import express from "express";
import InventoryItem from "../models/InventoryItem.js";
import StockTransaction from "../models/StockTransaction.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

const router = express.Router();

// GET /api/inventory/items - Get all inventory items
router.get("/items", async (req, res) => {
  try {
    const { category, lowStock, search } = req.query;
    
    let filter = { isActive: true };
    
    if (category && category !== "ALL") {
      filter.category = category;
    }
    
    if (lowStock === "true") {
      filter.currentStock = { $lte: "$minStockLevel" };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    const items = await InventoryItem.find(filter).sort({ name: 1 });
    
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory items:", err);
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
});

// GET /api/inventory/items/:id - Get single inventory item
router.get("/items/:id", async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    // Get recent transactions
    const transactions = await StockTransaction.find({ 
      inventoryItem: req.params.id 
    })
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({
      item,
      transactions
    });
  } catch (err) {
    console.error("Error fetching inventory item:", err);
    res.status(500).json({ message: "Failed to fetch inventory item" });
  }
});

// POST /api/inventory/items - Create new inventory item
router.post("/items", async (req, res) => {
  try {
    const itemData = req.body;
    
    // Generate SKU if not provided
    if (!itemData.sku) {
      const categoryPrefix = itemData.category.substring(0, 3).toUpperCase();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      itemData.sku = `${categoryPrefix}-${Date.now().toString().slice(-4)}${random}`;
    }
    
    const item = await InventoryItem.create(itemData);
    
    res.status(201).json(item);
  } catch (err) {
    console.error("Error creating inventory item:", err);
    res.status(500).json({ message: "Failed to create inventory item" });
  }
});

// PATCH /api/inventory/items/:id - Update inventory item
router.patch("/items/:id", async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    res.json(item);
  } catch (err) {
    console.error("Error updating inventory item:", err);
    res.status(500).json({ message: "Failed to update inventory item" });
  }
});

// POST /api/inventory/items/:id/stock - Update stock level
router.post("/items/:id/stock", async (req, res) => {
  try {
    const { quantity, type, unitCost, notes, createdBy } = req.body;
    
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Inventory item not found" });
    }
    
    // Create stock transaction
    const transaction = await StockTransaction.create({
      inventoryItem: req.params.id,
      type,
      quantity: Math.abs(quantity),
      unitCost: unitCost || item.costPrice,
      notes,
      createdBy,
      reference: "MANUAL_ADJUSTMENT"
    });
    
    // Update current stock
    let newStock = item.currentStock;
    
    switch (type) {
      case "PURCHASE":
      case "ADJUSTMENT":
        newStock += Math.abs(quantity);
        break;
      case "SALE":
      case "WASTAGE":
        newStock -= Math.abs(quantity);
        break;
    }
    
    item.currentStock = Math.max(0, newStock);
    item.lastRestocked = new Date();
    await item.save();
    
    res.json({
      item,
      transaction
    });
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ message: "Failed to update stock" });
  }
});

// GET /api/inventory/low-stock - Get low stock items
router.get("/low-stock", async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] }
    }).sort({ currentStock: 1 });
    
    res.json(lowStockItems);
  } catch (err) {
    console.error("Error fetching low stock items:", err);
    res.status(500).json({ message: "Failed to fetch low stock items" });
  }
});

// GET /api/inventory/transactions - Get stock transactions
router.get("/transactions", async (req, res) => {
  try {
    const { itemId, type, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (itemId) {
      filter.inventoryItem = itemId;
    }
    
    if (type && type !== "ALL") {
      filter.type = type;
    }
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await StockTransaction.find(filter)
      .populate("inventoryItem", "name sku unit")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// GET /api/inventory/analytics - Get inventory analytics
router.get("/analytics", async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStockCount = await InventoryItem.countDocuments({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] }
    });
    
    const totalInventoryValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } }
        }
      }
    ]);
    
    const categoryBreakdown = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          totalStock: { $sum: "$currentStock" }
        }
      }
    ]);
    
    res.json({
      totalItems,
      lowStockCount,
      totalInventoryValue: totalInventoryValue[0]?.totalValue || 0,
      categoryBreakdown
    });
  } catch (err) {
    console.error("Error fetching inventory analytics:", err);
    res.status(500).json({ message: "Failed to fetch inventory analytics" });
  }
});

export default router;
