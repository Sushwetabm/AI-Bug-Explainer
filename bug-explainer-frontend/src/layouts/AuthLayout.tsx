import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Outlet />
      <Toaster richColors />
    </div>
  );
}
export default AuthLayout;
