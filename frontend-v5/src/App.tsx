import { Routes, Route, } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout'
import RegisterPage from './pages/register'
import LoginPage from './pages/login'

import DashboardLayout from './pages/dashboard/dashlayout'
import DashboardPage from './pages/dashboard/home'
import ShipmentsPage from './pages/shipments/index'
import CustomersPage from './pages/customers/index'
import ParcelPage from './pages/parcels/index'
import InvoicePage from './pages/invoices/index'
import TrackShipment from './pages/track-shipment/index'
import ShippingQuote from './pages/get-quote/index'
import WarehousePage from './pages/warehouse'

import ShipmentDetails from './pages/shipments/details'
import CustomerDetails from './pages/customers/details'
import ParcelDetails from './pages/parcels/details'
import InvoiceDetails from './pages/invoices/details'

function App() {
  return (
    <>
      <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/customers" element={<CustomersPage/>} />
        <Route path="/parcels" element={<ParcelPage />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/track" element={<TrackShipment />} />
        <Route path="/quote" element={<ShippingQuote />} />
        <Route path="/warehouse" element={<WarehousePage />} />


        {/* Details Routes */}
        <Route path="/shipments/:id" element={<ShipmentDetails />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/parcels/:id" element={<ParcelDetails />} />
        <Route path="invoice/:id" element={<InvoiceDetails />} />

      </Route>

      {/* Add other route groups like dashboard here */}
    </Routes>
    </>
  )
}

export default App
