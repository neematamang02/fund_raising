import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Heart,
  ArrowRight,
  Shield,
  CheckCircle,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FundraisingButton } from "@/components/ui/fundraising-button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ROUTES from "@/routes/routes";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ name, email, password }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(
        "Account created successfully! Please sign in to continue. 🎉"
      );
      navigate(ROUTES.LOGIN, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-blue-600/90 to-indigo-600/90 z-10"></div>
        <img
          src="https://plus.unsplash.com/premium_photo-1683140538884-07fb31428ca6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Community coming together"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

        <div className="relative z-20 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Join Our Community
            </Badge>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Start Making a
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Real Difference
              </span>
            </h1>
            <p className="text-xl text-emerald-100 leading-relaxed mb-8">
              Join thousands of compassionate donors who are creating positive
              change in communities around the world.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: Heart, text: "Support causes you care about" },
              { icon: Users, text: "Connect with like-minded donors" },
              { icon: CheckCircle, text: "Track your impact in real-time" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-emerald-100"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">
                Fund-Raising
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Join Our Community
            </h2>
            <p className="text-gray-600">Start making a difference today</p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 hidden lg:block">
                Create Account
              </CardTitle>
              <p className="text-gray-600 hidden lg:block">
                Join our community of changemakers
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Enter your full name"
                              className="pl-10 h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10 h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label={
                                showConfirm ? "Hide password" : "Show password"
                              }
                            >
                              {showConfirm ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms Notice */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-sm text-emerald-800">
                      By creating an account, you agree to our{" "}
                      <Link
                        to="/terms"
                        className="font-medium underline hover:text-emerald-900"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="font-medium underline hover:text-emerald-900"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>

                  {/* Submit Button */}
                  <FundraisingButton
                    type="submit"
                    variant="success"
                    size="lg"
                    fullWidth
                    loading={mutation.isPending}
                    loadingText="Creating account..."
                    disabled={mutation.isPending}
                    className="group"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </FundraisingButton>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-gray-600">
                      <Link
                        to={ROUTES.LOGIN}
                        className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Sign in to your account
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
