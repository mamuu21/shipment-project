// components/auth/RegisterForm.tsx
import { useForm } from "react-hook-form";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { register } from "@/utils/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password2: z.string().min(8, "Please confirm your password"),
  role: z.enum(["customer", "staff", "admin"], {
    message: "Please select a role",
  }),
}).refine((data) => data.password === data.password2, {
  message: "Passwords do not match",
  path: ["password2"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password2: "",
      role: "customer",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // const roleTitleCase = values.role.charAt(0).toUpperCase() + values.role.slice(1).toLowerCase();

      const dataToSend = values

      const { user } = await register(dataToSend);
      toast.success(`Welcome, ${user.username}!`);
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error("Registration failed: " + error.message);
      } else {
        toast.error("Registration failed: Unknown error");
      }
    }
    finally {
          setIsLoading(false);
        }
      };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-sm border">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create an account</h2>
        <p className="text-sm text-muted-foreground">Enter your details to register</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="username" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input {...field} disabled={isLoading} autoComplete="username" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} disabled={isLoading} autoComplete="email" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" {...field} disabled={isLoading} autoComplete="new-password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="password2" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl><Input type="password" {...field} disabled={isLoading} autoComplete="new-password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField name="role" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select disabled={isLoading} defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>) : "Register"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
      </div>
    </div>
  );
}
