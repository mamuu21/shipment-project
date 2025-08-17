import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden"> 
      <Sidebar />
      <div className="flex flex-col flex-1 max-h-screen overflow-hidden"> 
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100"> 
          <div className="max-w-full"> 
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
