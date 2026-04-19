import ROUTES from "@/routes/routes";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "/api";

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ name, email, password, otp }) => {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp }),
      });
      if (!res.ok) {
        const data = await res
          .json()
          .catch(() => ({ message: "Failed to verify OTP" }));
        const enrichedError = new Error(data.message || "Failed to verify OTP");
        enrichedError.code = data.code;
        throw enrichedError;
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("OTP verified successfully");
      sessionStorage.removeItem("registrationData");
      navigate(ROUTES.LOGIN);
    },
    onError: (error) => {
      const code = error.code || "UNKNOWN_ERROR";
      const message = error.message || "Failed to verify OTP";

      if (/expired|invalid/i.test(message)) {
        toast.error(`${message} Please request a new OTP from registration.`);
        return;
      }

      if (code === "EMAIL_ALREADY_IN_USE") {
        toast.error("This email is already registered. Please sign in instead.");
        navigate(ROUTES.LOGIN);
        return;
      }

      toast.error(message);
    },
  });

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    let reg;
    try {
      reg = JSON.parse(sessionStorage.getItem("registrationData"));
    } catch {
      reg = null;
    }
    if (!reg || !reg.name || !reg.email || !reg.password) {
      toast.error("Session expired. Please register again to get a new OTP.");
      navigate(ROUTES.REGISTER);
      return;
    }
    verifyOtpMutation.mutate({
      name: reg.name,
      email: reg.email,
      password: reg.password,
      otp: otpValue,
    });
  };

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return; // Allow only numbers

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move focus to next input if current filled
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="surface-page flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Card className="surface-card w-full max-w-md rounded-xl border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="text-center">
          <Badge className="mx-auto mb-3 bg-blue-100 text-blue-800">
            Email Verification
          </Badge>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Verify OTP
          </CardTitle>
          <p className="text-sm text-slate-600">
            Enter the 6-digit code sent to your inbox.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 p-6 pt-0">
          <div className="flex justify-center gap-2.5">
            {otp.map((data, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(ref) => (inputRefs.current[i] = ref)}
                className="h-11 w-11 rounded-lg border border-slate-300 text-center text-lg font-semibold text-slate-900 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/25"
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <div className="text-center text-sm text-slate-600">
            {otp.join("") === ""
              ? "Enter your one-time password."
              : `You entered: ${otp.join("")}`}
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleVerifyOtp}
            disabled={verifyOtpMutation.isPending}
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </Button>

          <p className="inline-flex w-full items-center justify-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="h-4 w-4 text-primary" />
            OTP is valid for a limited time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpVerification;
