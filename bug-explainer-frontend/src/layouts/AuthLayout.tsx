import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

// export function AuthLayout() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <Outlet />
//       <Toaster richColors />
//     </div>
//   );
// }
// export default AuthLayout;
// src/layouts/AuthLayout.tsx

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border p-8">
        <Outlet />
      </div>
    </div>
  );
}
