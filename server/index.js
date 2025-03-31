const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());


// app.use(cors({
//   origin: ["https://invoice-printing.vercel.app", 'http://localhost:3000', 'http://localhost:3001'],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));


// Properly configured CORS
const allowedOrigins = [
  "https://invoice-printing.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

// CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

//   Import routes

  const productRoutes = require("./routes/productRoutes");
  app.use("/api/products", productRoutes);
  

  const inventoryRoutes = require("./routes/inventoryRoutes"); 
  app.use("/api/update-inventory", inventoryRoutes);
  


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
