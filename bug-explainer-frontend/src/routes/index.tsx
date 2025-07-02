import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { ChatPage } from "@/pages/ChatPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { LandingPage } from "@/pages/LandingPage"; // Import the new landing page
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />, // New landing page as the root
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute />, // Remove children here
    children: [
      {
        element: <AppLayout />, // Move AppLayout here
        children: [
          {
            index: true,
            element: <Navigate to="/app/chat" replace />,
          },
          {
            path: "chat",
            element: <ChatPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
