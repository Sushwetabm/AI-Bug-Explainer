// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import type { RegisterFormData } from "@/lib/validations/auth";
// import { registerSchema } from "@/lib/validations/auth";
// import { useAuth } from "@/hooks/useAuth";

// export function RegisterPage() {
//   const { login } = useAuth();
//   const form = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const onSubmit = async (data: RegisterFormData) => {
//     try {
//       await authService.register(data);
//       await login(data.email, data.password);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <div className="w-full max-w-md space-y-8">
//       <div className="text-center">
//         <h1 className="text-3xl font-bold">Create an account</h1>
//         <p className="mt-2 text-muted-foreground">
//           Enter your details to get started
//         </p>
//       </div>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Your name" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {/* Other form fields similar to LoginPage */}

//           <Button type="submit" className="w-full">
//             Create account
//           </Button>
//         </form>
//       </Form>

//       <p className="text-center text-sm text-muted-foreground">
//         Already have an account?{" "}
//         <Link to="/login" className="font-medium text-primary hover:underline">
//           Sign in
//         </Link>
//       </p>
//     </div>
//   );
// }
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
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
import type { RegisterFormData } from "@/lib/validations/auth";
import { registerSchema } from "@/lib/validations/auth";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service"; // Added missing import

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate(); // Added for redirect
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register(data);
      await login(data.email, data.password);
      navigate("/app/chat"); // Redirect after successful registration
    } catch (error) {
      console.error("Registration failed:", error);
      // You might want to show a toast notification here
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your details to get started
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
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
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Creating account..."
              : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
