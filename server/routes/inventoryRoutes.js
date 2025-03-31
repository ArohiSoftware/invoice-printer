const express = require("express");
const router = express.Router();
const Product = require("../models/product");

router.post("/", async (req, res) => {
    try {
      const { items } = req.body; // Get the items list
  
      for (const item of items) {
        const product = await Product.findOne({ name: item.productName });
  
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.productName} not found!` });
        }
  
        // Ensure stock does not go negative
        product.stock = Math.max(product.stock - item.quantity, 0);
        await product.save();
      }
  
      res.status(200).json({ success: true, message: "Inventory updated successfully!" });
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ success: false, message: "Server Error", error });
    }
  });

module.exports = router;
