const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

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

  
  // Multer Storage Configuration (Memory Storage for Vercel)
  const storage = multer.memoryStorage();
  const upload = multer({ storage });
  
  router.post("/import", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
  
    try {
      // Read file from memory instead of disk
      const buffer = req.file.buffer;
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      if (data.length === 0) {
        return res.status(400).json({ message: "Empty file uploaded." });
      }
  
      console.log("Importing Data:", data);
  
      await Product.insertMany(data);
      res.status(200).json({ message: "Products imported successfully!" });
    } catch (error) {
      console.error("Import Error:", error);
      res.status(500).json({ message: "Error importing products", error: error.message });
    }
  });
  


router.get("/export", async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(400).json({ message: "No products found to export." });
    }

    // Log the fetched data to check if MongoDB is returning correct data
    console.log("Products Fetched:", products);

    const productsData = products.map(product => product.toObject());

    // Check if data is being processed correctly
    console.log("Processed Data:", productsData);

    const worksheet = xlsx.utils.json_to_sheet(productsData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

    const fileType = req.query.type || "xlsx"; // Default is Excel
    let fileBuffer;
    let mimeType;
    let fileName = `products.${fileType}`;

    if (fileType === "csv") {
      fileBuffer = Buffer.from(xlsx.utils.sheet_to_csv(worksheet), "utf-8");
      mimeType = "text/csv";
    } else {
      fileBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    console.log("Exporting File:", fileName);

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", mimeType);
    res.send(fileBuffer);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ message: "Error exporting products", error: error.message });
  }
});

module.exports = router;

