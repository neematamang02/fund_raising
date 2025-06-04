import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Heart,
  ArrowRight,
  Shield,
  Users,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
import { AuthContext } from "@/context/AuthContext";
import ROUTES from "@/routes/routes";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const { setTokenAndFetchUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // Preserve redirect path if provided
  const redirectTo =
    new URLSearchParams(location.search).get("redirect") || "/";

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      const { token: jwt } = data;
      await setTokenAndFetchUser(jwt);
      toast.success("Welcome back! 🎉");
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-600/90 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="People helping each other"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

        <div className="relative z-20 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Welcome Back
            </Badge>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Continue Your
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Impact Journey
              </span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              Sign in to access your dashboard, track your donations, and
              continue making a difference in communities worldwide.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-4">
            {[
              { icon: Shield, text: "Secure & encrypted login" },
              { icon: Users, text: "Join 2,500+ active donors" },
              { icon: Heart, text: "Track your impact in real-time" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-blue-100"
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Fund-Raising
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600">
              Sign in to continue your impact journey
            </p>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 hidden lg:block">
                Sign In
              </CardTitle>
              <p className="text-gray-600 hidden lg:block">
                Access your fundraising dashboard
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
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
                              className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
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
                              className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
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

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <FundraisingButton
                    type="submit"
                    variant="trust"
                    size="lg"
                    fullWidth
                    loading={mutation.isPending}
                    loadingText="Signing in..."
                    disabled={mutation.isPending}
                    className="group"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </FundraisingButton>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        New to Fund-Raising?
                      </span>
                    </div>
                  </div>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-gray-600">
                      {"Don't have an account? "}
                      <Link
                        to={ROUTES.REGISTER}
                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Create one now
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
