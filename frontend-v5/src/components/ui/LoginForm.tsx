// components/auth/LoginForm.tsx
import { useForm } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/utils/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import api from "@/utils/api";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type TokenResponse = {
  access: string;
  refresh: string;
};


type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginError {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { updateRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  // Function to fetch user details and extract role
  const fetchUserDetails = async (accessToken: string): Promise<UserRole> => {
    try {
      const response = await api.get('/users/me/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const userData = response.data;
      console.log('User details from /api/users/me/:', userData);

      const userRole = userData.role;
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'customer') {
        return userRole;
      } else {
        throw new Error(`Invalid role received: ${userRole}`);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      throw new Error('Failed to retrieve user role from server');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Step 1: Login and get tokens
      const response = await login(data.username, data.password);
      const tokens = response as TokenResponse;

      console.log('Login response:', tokens);

      // Step 2: Store tokens
      if (data.remember) {
        localStorage.setItem('access_token', tokens.access);
        if (tokens.refresh) {
          localStorage.setItem('refresh_token', tokens.refresh);
        }
      } else {
        sessionStorage.setItem('access_token', tokens.access);
        if (tokens.refresh) {
          sessionStorage.setItem('refresh_token', tokens.refresh);
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }

      // Step 3: Fetch user details to get role
      const userRole = await fetchUserDetails(tokens.access);

      // Step 4: Store role in localStorage and update context
      localStorage.setItem('role', userRole);
      updateRole(userRole);
      console.log('Role stored and updated:', userRole);

      // Step 5: Show success message
      toast.success("Login successful!");

      // Step 6: Role-based redirect
      setTimeout(() => {
        if (userRole === 'customer') {
          console.log('Redirecting customer to /customers/me');
          navigate('/customers/me');
        } else {
          console.log('Redirecting admin/staff to /dashboard');
          navigate('/dashboard');
        }
      }, 100);

    } catch (error) {
      console.error("Login process failed:", error);
      const loginError = error as LoginError;
      let errorMessage = "Login failed. Please try again.";

      if (loginError?.response?.data?.detail) {
        errorMessage = loginError.response.data.detail;
      } else if ((error as Error)?.message) {
        errorMessage = (error as Error).message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-sm border">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your credentials to access your dashboard
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your username" 
                    {...field} 
                    disabled={isLoading}
                    autoComplete="username"
                  />
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
                  <Input 
                    type="password" 
                    placeholder="********" 
                    {...field} 
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="
                        h-5 w-5 rounded-full
                        border-2 border-gray-300
                        bg-white
                        data-[state=checked]:bg-primary
                        data-[state=checked]:border-primary
                        data-[state=checked]:text-white
                        "
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Remember me</FormLabel>
                </FormItem>
              )}
            />

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
              onClick={(e) => isLoading && e.preventDefault()}
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Don't have an account?{" "}
        <Link 
          to="/register" 
          className="font-medium text-primary hover:underline"
          onClick={(e) => isLoading && e.preventDefault()}
        >
          Register now
        </Link>
      </div>
    </div>
  );
}