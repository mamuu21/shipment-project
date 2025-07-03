import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import Dashboard from './pages/dashboard/Dashboardpage';
import Invoice from './pages/invoice';
import TrackShipment from './pages/track';
import WarehousePage from './pages/warehouse';
import ShippingQuoteCalculator from './pages/quote';
import ShipmentDetail from './pages/shipment/detail';
import ShipmentList from './pages/shipment/list';
import Login from './pages/Login';
import Register from './pages/Register';
import Customer from './pages/customer/customers';
import Parcel from './pages/parcel/parcels';

// layout for auth pages
const AuthLayout = ({ children }) => (
  <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div style={{ width: '100%', maxWidth: '500px' }}>{children}</div>
  </div>
);

// Main layout with sidebar + header
const MainLayout = ({ children }) => (
  <div className="d-flex">
    <Sidebar />
    <div className="flex-grow-1">
      <Header />
      <div className="content-area p-2">{children}</div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth pages */}
        <Route path="/" element={<AuthLayout><Login /></AuthLayout>} /> 
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />

        {/* Main pages */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/invoice" element={<MainLayout><Invoice /></MainLayout>} />
        <Route path="/track" element={<MainLayout><TrackShipment /></MainLayout>} />
        <Route path="/warehouse" element={<MainLayout><WarehousePage /></MainLayout>} />
        <Route path="/quote" element={<MainLayout><ShippingQuoteCalculator /></MainLayout>} />
        <Route path="/shipment/:id" element={<MainLayout><ShipmentDetail /></MainLayout>} />
        <Route path="/list" element={<MainLayout><ShipmentList /></MainLayout>} />
        <Route path="/customer" element={<MainLayout><Customer /></MainLayout>} />
        <Route path="/parcel" element={<MainLayout><Parcel /></MainLayout>} />



        {/* Fallback */}
        <Route path="*" element={<h4 className="text-center mt-5">Page Not Found</h4>} />
      </Routes>
    </Router>
  );
}

export default App;
