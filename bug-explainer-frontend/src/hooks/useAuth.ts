import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        navigate("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // const login = async (email: string, password: string) => {
  //   try {
  //     const response = await authService.login({ email, password });
  //     localStorage.setItem("token", response.data.token);
  //     setUser(response.data.user);
  //     toast.success("Logged in successfully");
  //     await new Promise((resolve) => setTimeout(resolve, 100));
  //     navigate("/app/chat");
  //   } catch (error) {
  //     toast.error("Invalid credentials");
  //     throw error;
  //   }
  // };
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

      const token = response.data.data?.token;
      const user = response.data.data?.user;

      if (response.status !== 200 || !token || !user) {
        toast.error("Invalid credentials");
        throw new Error("Login failed");
      }

      localStorage.setItem("token", token);
      setUser(user);
      toast.success("Logged in successfully");

      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate("/app/chat");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Login failed")) {
        // already handled
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/auth/login");
  };

  return { user, isLoading, login, logout };
}
