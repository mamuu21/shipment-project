
import { NavLink } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside
      className="w-48 h-screen flex flex-col justify-between px-4 py-6 text-white"
      style={{ backgroundColor: "#0c1326" }}
    >
      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-xl font-normal text-center mb-6">CargoPro</h2>

        <NavLink
            to="/dashboard"
            className={({ isActive }) =>
            `block w-full px-4 py-2 rounded-md text-left transition-colors duration-200 ${
                isActive
                ? "bg-gray-300 text-black"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
        >
            Dashboard
        </NavLink>

        

        <NavLink
            to="/track"
            className={({ isActive }) =>
                `block w-full px-4 py-2 rounded-md text-left transition-colors duration-200 text-sm font-normal ${
                isActive
                    ? "bg-gray-700 text-white"
                    : "text-white hover:text-white hover:bg-gray-600"
                }`
            }
            >
            Track Shipment
        </NavLink>

        <NavLink
            to="/quote"
            className={({ isActive }) =>
                `block w-full px-4 py-2 rounded-md text-left transition-colors duration-200 text-sm font-normal ${
                isActive
                    ? "bg-gray-700 text-white"
                    : "text-white hover:text-white hover:bg-gray-600"
                }`
            }
            >
            Get Quote
        </NavLink>

        <NavLink
            to="/warehouse"
            className={({ isActive }) =>
                `block w-full px-4 py-2 rounded-md text-left transition-colors duration-200 text-sm font-normal ${
                isActive
                    ? "bg-gray-700 text-white"
                    : "text-white hover:text-white hover:bg-gray-600"
                }`
            }
            >
            Warehouse
        </NavLink>

        
      </div>

      {/* Footer */}
    <div className="text-xs text-muted-foreground border-t pt-2 text-center text-white/70">
        © 2025 CargoPro by Amka Tech
    </div>
    </aside>
  )
}
