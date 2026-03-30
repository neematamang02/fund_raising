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
  ShieldCheck,
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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ROUTES from "@/routes/routes";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

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
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
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
    onSuccess: (data, variables) => {
      toast.success("Otp send to your email");
      try {
        sessionStorage.setItem(
          "registrationData",
          JSON.stringify({
            name: variables.name,
            email: variables.email,
            password: variables.password,
          }),
        );
      } catch {
        toast.error("Could not save registration session. Please retry.");
        return;
      }
      navigate(ROUTES.OTP_VERIFICATION, { replace: true });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send OTP");
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
    <div className="surface-page min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-secondary p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -left-14 top-10 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-8 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
        <img
          src="https://plus.unsplash.com/premium_photo-1683140538884-07fb31428ca6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Community coming together"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="relative z-10">
          <Badge className="mb-6 border-blue-100/40 bg-blue-100/20 text-white">
            Join Our Community
          </Badge>
          <h1 className="max-w-lg text-4xl font-bold leading-tight xl:text-5xl">
            Create Your HopeOn Account in Minutes
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-blue-100">
            Join donors and organizers building trusted community impact through
            transparent fundraising.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {[
            { icon: Heart, text: "Support causes you value" },
            { icon: Users, text: "Connect with active donors" },
            { icon: CheckCircle, text: "Track impact over time" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-lg border border-blue-100/20 bg-blue-100/10 p-3"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-blue-50">{item.text}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center lg:hidden">
            <div className="mb-3 inline-flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-secondary">HopeOn</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Create Account
            </h2>
            <p className="text-slate-600">Start making a real difference.</p>
          </div>

          <Card className="surface-card border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="hidden text-2xl font-bold text-slate-900 lg:block">
                Create Account
              </CardTitle>
              <p className="hidden text-slate-600 lg:block">
                Join our community of changemakers
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              placeholder="Enter your full name"
                              className="h-11 rounded-lg border-slate-300 pl-10"
                              {...field}
                            />
                          </div>
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
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="h-11 rounded-lg border-slate-300 pl-10"
                              {...field}
                            />
                          </div>
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
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 rounded-lg border-slate-300 pl-10 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
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

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 rounded-lg border-slate-300 pl-10 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
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

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">
                      By creating an account, you agree to our platform terms
                      and privacy standards.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={mutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {mutation.isPending
                      ? "Creating account..."
                      : "Create Account"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>

                  <div className="text-center">
                    <p className="text-slate-600">
                      Already have an account?{" "}
                      <Link
                        to={ROUTES.LOGIN}
                        className="font-medium text-secondary transition-colors hover:text-secondary/80"
                      >
                        Sign in now
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Protected with enterprise-grade security</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
