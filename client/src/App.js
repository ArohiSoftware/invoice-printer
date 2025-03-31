import React, { useState, useEffect } from 'react';
import './App.css';
import PdfTemplate from './PDF/Template';
import ProtectedRoute from "./component/ProtectedRoute"
import LoginPage from './Login';
import { Routes, Route , Navigate} from "react-router-dom";
import InventoryPage from './view/inventoryPage';
function App() {
    // const [InvoiceNumber, setInvoiceNumber] = useState('');
    const [ClientName, setClientName] = useState('');
    const [ClientNumber, setClientNumber] = useState('');
    const [Address, setAddress] = useState('');

    const [Dates, setDates] = useState('');
    // const [view, setView] = useState(false);

    useEffect(() => {
        const current = new Date();
        const date = `${current.getDate()}/${current.getMonth() + 1}/${current.getFullYear()}`;
        setDates(date);
    }, []);

    return (
        <>
        <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route
        path="/invoice"
        element={
          <ProtectedRoute>
            <PdfTemplate  ClientName={ClientName} ClientNumber={ClientNumber} setClientName={setClientName} 
        setClientNumber={setClientNumber} date={Dates} Address={Address} setAddress={setAddress}/>
          </ProtectedRoute>
        }
      />
    </Routes>
        </>
    );
}

export default App;
