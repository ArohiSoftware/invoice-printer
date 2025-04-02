import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../component/Navbar";
import API_BASE_URL from "../API_URL";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: "", price: "", stock: "" });
  const [editingProductId, setEditingProductId] = useState(null); // Null means adding a new product
  const [file, setFile] = useState(null);
  const [exportType, setExportType] = useState("xlsx");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        // Update existing product
        await axios.put(`${API_BASE_URL}/api/products/${editingProductId}`, productForm);
      } else {
        // Add new product
        const response = await axios.post(`${API_BASE_URL}/api/products`, productForm);
        setProducts([...products, response.data]);
      }
      setProductForm({ name: "", price: "", stock: "" }); // Reset form
      setEditingProductId(null); // Exit edit mode
      fetchInventory(); // Refresh inventory
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product._id);
    setProductForm({ name: product.name, price: product.price, stock: product.stock });
  };


  // 📌 **Handle File Selection**
const handleFileChange = (event) => {
  setFile(event.target.files[0]);
};

// 📌 **Import Products**
const handleImport = async () => {
  if (!file) {
    alert("Please select a file!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    await axios.post(`${API_BASE_URL}/api/update-inventory/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("Products imported successfully!");
    setFile(null);
    fetchInventory(); // Refresh product list after import
  } catch (error) {
    console.error("Import Error:", error);
    alert("Failed to import products.");
  }
};


//  Export Products
const handleExport = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/update-inventory/export?type=${exportType}`,
      { responseType: "blob" } // ✅ Ensure we receive binary data
    );

    const fileType =
      exportType === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const blob = new Blob([response.data], { type: fileType });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `products.${exportType}`); // ✅ Ensure correct file extension
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Export Error:", error);
    alert("Failed to export products.");
  }
};




  return (
    <>
    <Navbar/>
    <div className="container mx-auto p-4 mt-10">

      <div className="flex space-x-6 flex-wrap">  

       {/* 📌 **File Upload Section** */}
       <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="border p-2" />
        <button onClick={handleImport} className="m-3 bg-blue-500 text-white px-4 py-2 rounded">
          Import Products
        </button>
      </div>

      {/* 📌 **Export Section** */}
      <div className="mb-4">
        <select value={exportType} onChange={(e) => setExportType(e.target.value)} className="border p-2">
          <option value="xlsx">Excel (.xlsx)</option>
          <option value="csv">CSV (.csv)</option>
        </select>
        <button onClick={handleExport} className="m-3 bg-green-500 text-white px-4 py-2 rounded">
          Export Products
        </button>
      </div>
      </div>
        
      <h2 className="text-xl font-bold mb-4">{editingProductId ? "Edit Product" : "Add Product"}</h2>
      
      {/* Combined Add/Edit Product Form */}
      <form onSubmit={handleFormSubmit} className="mb-4 p-4 border rounded">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productForm.name}
          onChange={handleFormChange}
          className="border p-2 m-2"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={productForm.price}
          onChange={handleFormChange}
          className="border p-2 m-2"
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={productForm.stock}
          onChange={handleFormChange}
          className="border p-2 m-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded m-2">
          {editingProductId ? "Update Product" : "Add Product"}
        </button>
        {editingProductId && (
          <button
            type="button"
            onClick={() => {
              setEditingProductId(null);
              setProductForm({ name: "", price: "", stock: "" });
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Inventory Table */}
      <table className="w-full  border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-center">
            <th className="border p-2">Product Name</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border">
              <td className="border p-2">{product.name}</td>
              <td className="border p-2">{product.stock}</td>
              <td className="border p-2">{product.price}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded m-2"
                  onClick={() => handleEditClick(product)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteProduct(product._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default InventoryPage;
