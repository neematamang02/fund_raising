import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

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
      const res = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        { token, password: data.password }
      );
      return res.data;
    },
    onSuccess: () => {
      navigate("/login");
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-md">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="New password"
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
              className="w-full"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
