import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../component/Navbar";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: "", price: "", stock: "" });
  const [editingProductId, setEditingProductId] = useState(null); // Null means adding a new product

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
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
        await axios.put(`http://localhost:5000/api/products/${editingProductId}`, productForm);
      } else {
        // Add new product
        const response = await axios.post("http://localhost:5000/api/products", productForm);
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

  return (
    <>
    <Navbar/>
    <div className="container mx-auto p-4">
        
      <h2 className="text-xl font-bold mb-4">{editingProductId ? "Edit Product" : "Add Product"}</h2>
      
      {/* Combined Add/Edit Product Form */}
      <form onSubmit={handleFormSubmit} className="mb-4 p-4 border rounded">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={productForm.name}
          onChange={handleFormChange}
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={productForm.price}
          onChange={handleFormChange}
          className="border p-2 mr-2"
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={productForm.stock}
          onChange={handleFormChange}
          className="border p-2 mr-2"
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2">
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
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
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
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
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
