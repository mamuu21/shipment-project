import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div
      className="text-white d-flex flex-column p-2"
      style={{
        backgroundColor: '#0c1326',
        minWidth: '180px',
        fontSize: '0.7rem',
        minHeight: '100vh'
      }}
    >
      {/* Title */}
      <h4 className="mb-4 text-center" style={{ fontWeight: 'normal' }}>CargoPro</h4>

      {/* Navigation */}
      <ul className="nav flex-column mt-4">
        <li className="nav-item mb-3 text-center">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item mb-3 text-center">
          <NavLink to="/list" className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}>
            All Shipments
          </NavLink>
        </li>
        <li className="nav-item mb-3 text-center">
          <NavLink to="/track" className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}>
            Track Shipment
          </NavLink>
        </li>
        <li className="nav-item mb-3 text-center">
          <NavLink to="/quote" className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}>
            Get Quote
          </NavLink>
        </li>
        <li className="nav-item mb-3 text-center">
          <NavLink to="/warehouse" className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}>
            Warehouse
          </NavLink>
        </li>
        <li className="nav-item mb-3 text-center">
          <NavLink to="/invoice" className={({ isActive }) => `sidebar-btn ${isActive ? 'active' : ''}`}>
            Invoices
          </NavLink>
        </li>
      </ul>

      <div className="text-center p-2 mt-auto">
        <small>CargoPro v1.0-(c) Amka Tech.</small>
      </div>
    </div>
  );
};

export default Sidebar;
