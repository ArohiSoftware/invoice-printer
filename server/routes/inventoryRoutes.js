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



// 📌 **Multer Storage for File Uploads**
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files in "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📌 **Import Products from Excel/CSV**
router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Empty file uploaded." });
    }

    // 📌 Ensure correct mapping to MongoDB schema
    const formattedData = jsonData.map((row) => ({
      name: row["Product Name"] || row["name"],
      price: row["Price"] || row["price"],
      stock: row["Stock"] || row["stock"],
    }));

    await Product.insertMany(formattedData);
    fs.unlinkSync(filePath); // Delete file after processing

    res.status(200).json({ message: "Products imported successfully!" });
  } catch (error) {
    console.error("Import Error:", error);
    res.status(500).json({ message: "Error importing products", error });
  }
});


router.get("/export", async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(400).json({ message: "No products found to export." });
    }

    // ✅ Convert Mongoose documents to plain objects
    const productsData = products.map(product => product.toObject());

    const worksheet = xlsx.utils.json_to_sheet(productsData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");

    const fileType = req.query.type || "xlsx"; // Default to Excel
    const fileName = `products.${fileType}`;
    const folderPath = path.join(__dirname, "../uploads");

    // Ensure uploads folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    const filePath = path.join(folderPath, fileName);

    if (fileType === "csv") {
      const csvData = xlsx.utils.sheet_to_csv(worksheet);
      fs.writeFileSync(filePath, csvData);
    } else {
      xlsx.writeFile(workbook, filePath);
    }

    res.download(filePath, fileName, () => {
      fs.unlinkSync(filePath); // Delete file after sending
    });
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ message: "Error exporting products", error });
  }
});




module.exports = router;
