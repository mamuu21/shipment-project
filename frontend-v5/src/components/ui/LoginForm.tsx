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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/utils/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const tokens: TokenResponse = await login(data.username, data.password); // should return tokens

      if (data.remember) {
        // Persist tokens in localStorage
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      } else {
        // Store tokens in sessionStorage (cleared when browser closes)
        sessionStorage.setItem('access_token', tokens.access);
        sessionStorage.setItem('refresh_token', tokens.refresh);
        // Clean localStorage just in case
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      // error handling
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