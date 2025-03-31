import React, { useRef, useState, useEffect } from "react";
import ReactPrint from "react-to-print";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Close } from "@mui/icons-material";
import Navbar from "../component/Navbar";
import { useNavigate } from "react-router-dom";
import '../App.css'
import API_BASE_URL from "../API_URL";

function PdfTemplate({ InvoiceNumber }) {
  const ref = useRef();
  const navigate = useNavigate();

  const [clientName, setClientName] = useState("");
  const [clientNumber, setClientNumber] = useState("");
  const [address, setAddress] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [list, setList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products", err));
  }, []);


  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField) nextField.focus();
      else setOpenPopup(true);
    }
  };

  const handleKeyDownPopUp = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setOpenPopup(true); 
  
      setTimeout(() => {
        document.getElementById("productName")?.focus();
      }, 100); // Slight delay to ensure modal is rendered
    }
  };
  

  const handleProductKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField) nextField.focus();
      else addData(); // Add product when Enter is pressed in quantity field
    }
  };

  const handleProductChange = (e) => {
    const value = e.target.value;
    setItem(value);
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredProducts);
    const selectedProduct = products.find(
      (p) => p.name.toLowerCase() === value.toLowerCase()
    );
    if (selectedProduct) setAmount(selectedProduct.price);
  };

  const selectProduct = (product) => {
    setItem(product.name);
    setAmount(product.price);
    setSuggestions([]);
    document.getElementById("quantity").focus();
  };

  const addData = () => {
    if (!item || !amount || quantity < 1) return;

    const parsedAmount = Number(amount); // Convert amount to number
    const parsedQuantity = Number(quantity); // Convert quantity to number

    const existingIndex = list.findIndex((p) => p.product === item);

    if (editIndex !== null) {
      // If editing an existing product, update its details
      const updatedList = [...list];
      updatedList[editIndex] = {
          product: item,
          amount: parsedAmount,
          quantity: parsedQuantity,
          total: parsedAmount * parsedQuantity,
      };
      setList(updatedList);
      setEditIndex(null);
  } else if (existingIndex !== -1) {
        // Update quantity and total if product already exists
        const updatedList = [...list];
        updatedList[existingIndex].quantity += parsedQuantity;
        updatedList[existingIndex].total = updatedList[existingIndex].quantity * parsedAmount;
        setList(updatedList);
    } else {
        setList([
            ...list,
            {
                product: item,
                amount: parsedAmount,
                quantity: parsedQuantity,
                total: parsedAmount * parsedQuantity,
            },
        ]);
    }

    setItem("");
    setAmount("");
    setQuantity(1);
    setOpenPopup(false);
    document.getElementById("address").focus();
};



  const resetInvoice = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/update-inventory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: list.map((item) => ({
              productName: item.product,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("Inventory updated:", data.message);
        const updatedProducts = await fetch(
          `${API_BASE_URL}/api/products`
        );
        const productData = await updatedProducts.json();
        setProducts(productData);
      } else {
        console.error("Failed to update inventory:", data.message);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }

    setAddress("");
    setClientName("");
    setClientNumber("");
    setList([]);
  };

  const editProduct = (index) => {
    const item = list[index];
    setItem(item.product);
    setAmount(item.amount);
    setQuantity(item.quantity);
    setEditIndex(index);
    setOpenPopup(true);
  };

  const deleteProduct = (index) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <>
      <Navbar />
      <div className="container-invoice">
        <h1 className="text-center" style={{ color: "#325aa8" }}>
          <strong>Aapla Counter</strong>
        </h1>
        <div className="form-group">
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, document.getElementById("clientNumber"))
            }
            autoFocus
          />
          <input
            id="clientNumber"
            type="text"
            placeholder="Client Number"
            value={clientNumber}
            onChange={(e) => setClientNumber(e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, document.getElementById("address"))
            }
          />
          <input
            id="address"
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={handleKeyDownPopUp} 
          />
        </div>
        <ReactPrint
          trigger={() => <button className="btn print">Print</button>}
          content={() => ref.current}
          onAfterPrint={resetInvoice}
        />
      </div>

      <Dialog open={openPopup}>
        <DialogTitle>
          <Close className="icon-cross" onClick={() => setOpenPopup(false)} />
          <strong className="hed text-blue">New Product</strong>
        </DialogTitle>
        <DialogContent>
          <form className="form-group">  
          <input
            type="text"
            id="productName"
            value={item}
            onChange={handleProductChange}
            placeholder="Product Name"
            onKeyDown={(e) =>
              handleProductKeyDown(e, document.getElementById("quantity"))
            }
            autoFocus
          />

          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((p, i) => (
                <li key={i} onClick={() => selectProduct(p)}>
                  {p.name} (Stock: {p.stock})
                </li>
              ))}
            </ul>
          )}

          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            min="1"
            onKeyDown={(e) =>
              handleProductKeyDown(e, document.getElementById("amount"))
            }
          />

          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Price ₹"
            onKeyDown={(e) => handleProductKeyDown(e, null)}
          />
          </form>

        </DialogContent>
      </Dialog>

      <div className="container-invoice" ref={ref}>
        <h4 className="text-center text-blue">
          <strong>Invoice</strong>
        </h4>
        <strong>Client Name: {clientName}</strong>
        <br />
        <strong>Contact: {clientNumber}</strong>
        <br />
        <strong>Address: {address}</strong>
        <table className="table-product">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, index) => (
              <tr key={index}>
                <td>{item.product}</td>
                <td>₹ {item.amount}</td>
                <td>{item.quantity}</td>
                <td>₹ {item.total}</td>
                <td className="actions-column ">
                  <button onClick={() => editProduct(index)} className="btn-edit">Edit</button>
                  <button onClick={() => deleteProduct(index)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" className="text-blue">
                <strong>Total Amount:</strong>
              </td>
              <td colSpan="2">
                <strong>
                  ₹ {list.reduce((sum, item) => sum + item.total, 0)}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer>
        <p>Developed by @AROHI SOFTWARE</p>
      </footer>
    </>
  );
}

export default PdfTemplate;
