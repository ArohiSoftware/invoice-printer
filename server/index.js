const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());


app.use(cors({
  origin: ["https://invoice-printing.vercel.app", 'http://localhost:3000', 'http://localhost:3001'],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


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
