import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
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
import { resetPasswordSchema } from "@/lib/validations/auth";
import { authService } from "@/services";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const { token } = useParams();
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(token!, data);
      toast.success("Password reset successful");
    } catch (error) {
      toast.error("Error resetting password");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Similar structure to LoginPage */}
    </div>
  );
}
