const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: [
    "https://invoice-printing.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Import routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

const inventoryRoutes = require("./routes/inventoryRoutes"); 
app.use("/api/update-inventory", inventoryRoutes);

// If in development, listen on port 5000, otherwise let Vercel handle the port
const PORT =  5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Export the app for Vercel's serverless function handling
  module.exports = app;
}
