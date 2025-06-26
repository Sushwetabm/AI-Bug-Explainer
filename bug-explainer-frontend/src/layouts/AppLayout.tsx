import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
