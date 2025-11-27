import express from "express";
import PurchaseOrder from "../models/PurchaseOrder.js";
import InventoryItem from "../models/InventoryItem.js";
import StockTransaction from "../models/StockTransaction.js";

const router = express.Router();

// Generate PO Number
const generatePONumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `PO-${timestamp}${random}`;
};

// GET /api/purchase-orders - Get all purchase orders
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status && status !== "ALL") {
      filter.status = status;
    }
    
    const purchaseOrders = await PurchaseOrder.find(filter)
      .populate("items.inventoryItem", "name sku unit")
      .populate("createdBy", "firstName lastName")
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 });
    
    res.json(purchaseOrders);
  } catch (err) {
    console.error("Error fetching purchase orders:", err);
    res.status(500).json({ message: "Failed to fetch purchase orders" });
  }
});

// GET /api/purchase-orders/:id - Get single purchase order
router.get("/:id", async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate("items.inventoryItem", "name sku unit currentStock minStockLevel")
      .populate("createdBy", "firstName lastName")
      .populate("approvedBy", "firstName lastName");
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    
    res.json(purchaseOrder);
  } catch (err) {
    console.error("Error fetching purchase order:", err);
    res.status(500).json({ message: "Failed to fetch purchase order" });
  }
});

// POST /api/purchase-orders - Create new purchase order
router.post("/", async (req, res) => {
  try {
    const poData = {
      ...req.body,
      poNumber: generatePONumber(),
      status: "PENDING"
    };
    
    // Calculate item totals
    poData.items = poData.items.map(item => ({
      ...item,
      totalCost: item.quantity * item.unitCost
    }));
    
    const purchaseOrder = await PurchaseOrder.create(poData);
    
    res.status(201).json(purchaseOrder);
  } catch (err) {
    console.error("Error creating purchase order:", err);
    res.status(500).json({ message: "Failed to create purchase order" });
  }
});

// POST /api/purchase-orders/:id/approve - Approve purchase order
router.post("/:id/approve", async (req, res) => {
  try {
    const { approvedBy } = req.body;
    
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      {
        status: "APPROVED",
        approvedBy
      },
      { new: true }
    );
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    
    res.json(purchaseOrder);
  } catch (err) {
    console.error("Error approving purchase order:", err);
    res.status(500).json({ message: "Failed to approve purchase order" });
  }
});

// POST /api/purchase-orders/:id/receive - Receive items from purchase order
router.post("/:id/receive", async (req, res) => {
  try {
    const { receivedItems, createdBy } = req.body;
    
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate("items.inventoryItem");
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }
    
    // Update received quantities and stock levels
    for (const receivedItem of receivedItems) {
      const poItem = purchaseOrder.items.id(receivedItem.itemId);
      if (poItem) {
        const quantityReceived = receivedItem.quantity || 0;
        
        // Update PO item
        poItem.receivedQuantity = quantityReceived;
        
        // Update inventory stock
        if (quantityReceived > 0) {
          const inventoryItem = await InventoryItem.findById(poItem.inventoryItem._id);
          
          // Create stock transaction
          await StockTransaction.create({
            inventoryItem: poItem.inventoryItem._id,
            type: "PURCHASE",
            quantity: quantityReceived,
            unitCost: poItem.unitCost,
            notes: `Received from PO: ${purchaseOrder.poNumber}`,
            createdBy,
            reference: "PURCHASE_ORDER",
            referenceId: purchaseOrder._id,
            batchNumber: receivedItem.batchNumber,
            expiryDate: receivedItem.expiryDate
          });
          
          // Update inventory stock
          inventoryItem.currentStock += quantityReceived;
          inventoryItem.lastRestocked = new Date();
          await inventoryItem.save();
        }
      }
    }
    
    await purchaseOrder.save();
    
    res.json(purchaseOrder);
  } catch (err) {
    console.error("Error receiving purchase order:", err);
    res.status(500).json({ message: "Failed to receive purchase order items" });
  }
});

export default router;
