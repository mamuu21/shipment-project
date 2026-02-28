import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Truck,
  FileText,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  MapPin
} from "lucide-react"
import { useState } from "react"

type MenuItem = {
  label: string
  path: string
  icon: any
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Track Shipment", path: "/track", icon: MapPin },
  { label: "Get Quote", path: "/quote", icon: FileText },
  { label: "Warehouse", path: "/warehouse", icon: Warehouse },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        h-screen flex flex-col justify-between
        px-3 py-6 text-white
        transition-all duration-300 ease-in-out
      `}
      style={{ backgroundColor: "#0c1326" }}
    >
      {/* Top Section */}
      <div>
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between mb-10 px-2">
          {!collapsed && (
            <h2 className="text-lg font-normal">
              CargoPro
            </h2>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-white/10 transition"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-white text-black font-medium"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-white/10 pt-3 text-center">
          <p className="text-xs text-white/60 leading-relaxed">
            © {new Date().getFullYear()} CargoPro by Amka Tech
          </p>
        </div>
      )}
    </aside>
  )
}