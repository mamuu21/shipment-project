import { Routes, Route, } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout'
import RegisterPage from './pages/register'
import LoginPage from './pages/login'
import Landing from './landing'
import ProtectedRoute from './components/ProtectedRoute'

import DashboardLayout from './pages/dashboard/dashlayout'
import DashboardPage from './pages/dashboard/home'
import ShipmentsPage from './pages/shipments/index'
import CustomersPage from './pages/customers/index'
import ParcelPage from './pages/parcels/index'
import InvoicePage from './pages/invoices/index'
import TrackShipment from './pages/track-shipment/index'
import ShippingQuote from './pages/get-quote/index'
import WarehousePage from './pages/warehouse'
import Profile from './pages/profile'
import SettingsPage from './pages/settings'

import ShipmentDetails from './pages/shipments/details'
import CustomerDetails from './pages/customers/details'
import ParcelDetails from './pages/parcels/details'
import InvoiceDetails from './pages/invoices/details'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <>
      <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/customers" element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <CustomersPage/>
          </ProtectedRoute>
        } />
        <Route path="/parcels" element={<ParcelPage />} />
        <Route path="/invoices" element={<InvoicePage />} />
        <Route path="/track" element={<TrackShipment />} />
        <Route path="/quote" element={<ShippingQuote />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/profile" element={<Profile />} />

        {/* Customer-specific routes */}
        {/* <Route path="/customers/me" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDetails />
          </ProtectedRoute>
        } /> */}

        {/* Details Routes */}
        <Route path="/shipments/:id" element={<ShipmentDetails />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/parcels/:id" element={<ParcelDetails />} />
        <Route path="invoice/:id" element={<InvoiceDetails />} />

        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SettingsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Unauthorized Route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Add other route groups like dashboard here */}
    </Routes>
    </>
  )
}

export default App
