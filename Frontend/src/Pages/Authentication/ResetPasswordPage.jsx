import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import ROUTES from "@/routes/routes";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api`
  : "/api";

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
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
  const location = useLocation();
  const emailFromState = location.state?.email;
  const rememberedEmail = sessionStorage.getItem("forgotPasswordEmail");
  const defaultEmail = emailFromState || rememberedEmail || "";
  const [serverError, setServerError] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(Boolean(token));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email: userEmail, otp: userOtp }) => {
      const res = await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, {
        email: userEmail,
        otp: userOtp,
      });
      return res.data;
    },
    onSuccess: () => {
      setOtpVerified(true);
      setServerError("");
      toast.success("OTP verified. You can now set a new password.");
    },
    onError: (error) => {
      setOtpVerified(false);
      setServerError(
        error.response?.data?.message || "OTP verification failed.",
      );
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = token
        ? { token, password: data.password }
        : {
            email,
            otp,
            password: data.password,
          };
      const res = await axios.post(
        `${API_BASE_URL}/auth/reset-password`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      sessionStorage.removeItem("forgotPasswordEmail");
      toast.success("Password reset successful.");
      navigate(ROUTES.LOGIN);
    },
    onError: (error) => {
      setServerError(error.response?.data?.message || "Reset failed.");
    },
  });

  const onSubmit = (data) => {
    if (!token && !otpVerified) {
      setServerError("Please verify OTP before setting a new password.");
      return;
    }
    mutation.mutate(data);
  };

  const handleVerifyOtp = () => {
    setServerError("");

    if (token) {
      setOtpVerified(true);
      return;
    }

    if (!email) {
      setServerError("Email is required.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setServerError("Please enter a valid 6-digit OTP.");
      return;
    }

    verifyOtpMutation.mutate({ email, otp });
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
            {token
              ? "Choose a new secure password for your account."
              : "Verify OTP first, then choose a new secure password."}
          </p>
        </CardHeader>

        <CardContent className="space-y-5 p-6 pt-0">
          {!token ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg border-slate-300"
                />
              </div>
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-11 rounded-lg border-slate-300"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={verifyOtpMutation.isPending || otpVerified}
              >
                {verifyOtpMutation.isPending
                  ? "Verifying OTP..."
                  : otpVerified
                    ? "OTP Verified"
                    : "Verify OTP"}
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="New password"
                className="h-11 rounded-lg border-slate-300"
                {...register("password")}
                disabled={!token && !otpVerified}
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
                disabled={!token && !otpVerified}
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
              disabled={mutation.isPending || (!token && !otpVerified)}
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
