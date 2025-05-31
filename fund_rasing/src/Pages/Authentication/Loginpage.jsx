// src/pages/Authentication/Login.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export default function Loginpage() {
  const [showPassword, setShowPassword] = useState(false);

  // react-hook-form setup with zod
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ▶️ react-query mutation (from @tanstack/react-query)
  const mutation = useMutation({
    mutationFn: async (formData) => {
      // Replace this stub with your real API call. E.g.:
      // return axios.post("/api/auth/login", formData);
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("Logging in with:", formData);
          resolve({ success: true });
        }, 1000);
      });
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        // Redirect or show success message
        alert("Logged in successfully!");
      },
    });
  };

  return (
    <div className="flex min-h-screen p-4">
      {/* Left: random charity image (hidden on small screens) */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center rounded-2xl"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
        aria-label="Charity donation image"
      />

      {/* Right: login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field with Eye Toggle */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* Display server error if any */}
              {mutation.isError && (
                <p className="text-red-500 text-sm text-center">
                  {mutation.error?.message || "Login failed. Please try again."}
                </p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
