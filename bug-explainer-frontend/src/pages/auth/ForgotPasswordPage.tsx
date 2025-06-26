import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { authService } from "@/services";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error("Error sending reset email");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Similar structure to LoginPage */}
    </div>
  );
}
