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
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must include at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must include at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Password must include at least one number.",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password." }),
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
    shouldFocusError: true,
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
      const message = error.message || "Failed to send OTP";

      if (/email/i.test(message)) {
        form.setError("email", {
          type: "server",
          message,
        });
      }

      toast.error(message);
    },
  });

  const onSubmit = (values) => {
    mutation.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  const fieldLabels = {
    name: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
  };

  const priorityOrder = ["email", "password", "confirmPassword", "name"];
  const visibleErrorEntries =
    form.formState.submitCount > 0
      ? Object.entries(form.formState.errors).filter(
          ([, error]) => typeof error?.message === "string" && error.message,
        )
      : [];

  const primaryError =
    priorityOrder
      .map((field) => form.formState.errors[field])
      .find((error) => typeof error?.message === "string" && error.message)
      ?.message || visibleErrorEntries[0]?.[1]?.message;

  return (
    <div className="surface-page min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-foreground p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -left-14 top-10 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-8 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <img
          src="https://plus.unsplash.com/premium_photo-1683140538884-07fb31428ca6?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Community coming together"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />

        <div className="relative z-10">
          <Badge className="mb-6 border-background/30 bg-background/15 text-background">
            Join Our Community
          </Badge>
          <h1 className="max-w-lg text-4xl font-bold leading-tight text-background xl:text-5xl">
            Create Your HopeOn Account in Minutes
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-background/70">
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
              className="flex items-center gap-3 rounded-lg border border-background/15 bg-background/10 p-3"
            >
              <item.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-background/85">{item.text}</span>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center lg:hidden">
            <div className="mb-3 inline-flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">HopeOn</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Create Account
            </h2>
            <p className="text-muted-foreground">Start making a real difference.</p>
          </div>

          <Card className="surface-card shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="hidden text-2xl font-bold text-foreground lg:block">
                Create Account
              </CardTitle>
              <p className="hidden text-muted-foreground lg:block">
                Join our community of changemakers
              </p>
            </CardHeader>

            <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {visibleErrorEntries.length > 0 && (
                    <div className="rounded-lg border border-destructive/35 bg-destructive/10 p-3 text-sm">
                      <p className="font-semibold text-destructive">
                        {primaryError}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive/90">
                        {visibleErrorEntries.map(([field, error]) => (
                          <li key={field}>
                            {fieldLabels[field] || field}: {String(error.message)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Enter your full name"
                              className="h-11 pl-10"
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
                        <FormLabel className="text-sm font-medium text-foreground">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              className="h-11 pl-10"
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
                        <FormLabel className="text-sm font-medium text-foreground">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 pl-10 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
                        <FormLabel className="text-sm font-medium text-foreground">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 pl-10 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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

                  <div className="rounded-lg border border-primary/20 bg-primary/8 p-3">
                    <p className="text-sm text-primary">
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
                    <p className="text-muted-foreground">
                      Already have an account?{" "}
                      <Link
                        to={ROUTES.LOGIN}
                        className="font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Sign in now
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* <div className="mt-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Protected with enterprise-grade security</span>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
