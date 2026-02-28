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
import { Loader2, Eye, EyeOff } from "lucide-react";
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

type APIUser = {
  username?: string;
  email?: string;
  role?: string | null;
};

export default function LoginForm() {
  const navigate = useNavigate();
  const { updateRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const fetchUserDetails = async (accessToken: string): Promise<UserRole> => {
    try {
      const response = await api.get<APIUser>('/users/me/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const userData = response.data;
      console.log('User details from /users/me/:', userData);

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
      const response = await login(data.username, data.password);
      const tokens = response as TokenResponse;

      console.log('Login response:', tokens);

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

      const userRole = await fetchUserDetails(tokens.access);

      localStorage.setItem('role', userRole as string);
      updateRole(userRole);
      console.log('Role stored and updated:', userRole);

      toast.success("Login successful!");

      setTimeout(() => {
        if (userRole === 'customer') {
          console.log('Redirecting customer to /profile');
          navigate('/profile');
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
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 px-10 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-base text-gray-500 mt-2">
          Login to your CargoPro account
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your username" 
                    className="h-11 rounded-lg border-gray-200"
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
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={(e) => isLoading && e.preventDefault()}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="********" 
                      className="h-11 rounded-lg border-gray-200 pr-12"
                      {...field} 
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white text-gray-400 border-none outline-none hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 pt-1">
                <FormControl>
                  <Checkbox
                    id="remember-me"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormLabel htmlFor="remember-me" className="!mt-0 text-sm font-normal text-gray-600 cursor-pointer select-none">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base"
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-lg border-gray-200 hover:bg-gray-50 font-medium text-gray-700 text-sm"
        onClick={() => toast.info("Google sign-in is not configured yet.")}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link 
          to="/register" 
          className="font-medium text-primary hover:underline"
          onClick={(e) => isLoading && e.preventDefault()}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
