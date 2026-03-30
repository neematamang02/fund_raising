import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import ROUTES from "@/routes/routes";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password: data.password,
      });
      return res.data;
    },
    onSuccess: () => {
      navigate(ROUTES.LOGIN);
    },
    onError: (error) => {
      setServerError(error.response?.data?.message || "Reset failed.");
    },
  });

  const onSubmit = (data) => {
    if (!token) {
      setServerError("Reset token is missing.");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="surface-page flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Card className="surface-card w-full max-w-md rounded-xl border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-5 w-5 text-secondary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Reset Password
          </CardTitle>
          <p className="text-sm text-slate-600">
            Choose a new secure password for your account.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 p-6 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="New password"
                className="h-11 rounded-lg border-slate-300"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                placeholder="Confirm password"
                className="h-11 rounded-lg border-slate-300"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-red-600 text-sm text-center">{serverError}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Resetting..." : "Reset Password"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
