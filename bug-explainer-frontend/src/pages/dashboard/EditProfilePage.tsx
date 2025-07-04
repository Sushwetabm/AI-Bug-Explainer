import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export function EditProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name || "");
      form.setValue("email", user.email || "");
    }
  }, [user]);

  const handleConfirmPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // prevent unintended form submission
    try {
      const data = form.getValues();
      const payload = {
        ...data,
        password: currentPassword,
      };
      console.log("Submitting password for confirmation");

      const res = await userService.updateProfile(payload);

      toast.success("Profile updated successfully!");
      setShowPasswordPrompt(false);
      await login(data.email, currentPassword);
    } catch (err) {
      toast.error("Incorrect password. Redirecting...");
      navigate("/app/chat");
    }
  };

  const onSubmit = () => {
    setShowPasswordPrompt(true); // Show password modal first
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold text-center">Update Profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Form>

      {/* 🔒 Password Prompt Dialog */}
      <Dialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
        <DialogContent aria-describedby="dialog-desc">
          <form onSubmit={handleConfirmPassword}>
            <DialogHeader>
              <DialogTitle>Confirm Password</DialogTitle>
              <DialogDescription id="dialog-desc">
                Please enter your current password to apply changes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">
                Your Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={!currentPassword}
              >
                Confirm & Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
