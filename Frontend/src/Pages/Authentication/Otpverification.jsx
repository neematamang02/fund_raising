import ROUTES from "@/routes/routes";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const OtpVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const navigate = useNavigate();

    const verifyOtpMutation = useMutation({
        mutationFn: async ({ name, email, password, otp }) => {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, otp }),
                
            });
            if (!res.ok) throw new Error(await res.json().then(data => data.message || "Failed to verify OTP"));
            return res.json();
        },
        onSuccess: () => {
            toast.success("OTP verified successfully");
            try { sessionStorage.removeItem("registrationData"); } catch {}
            navigate(ROUTES.LOGIN);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to verify OTP");
        }
    });

    const handleverifyotp = () => {
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            toast.error("Please enter a 6-digit OTP");
            return;
        }
        let reg;
        try {
          reg = JSON.parse(sessionStorage.getItem("registrationData"));
        } catch {}
        if (!reg || !reg.name || !reg.email || !reg.password) {
          toast.error("Registration data missing. Please register again.");
          navigate(ROUTES.REGISTER);
          return;
        }
        verifyOtpMutation.mutate({ name: reg.name, email: reg.email, password: reg.password, otp: otpValue });
    }

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          OTP Verification
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          Enter the 6-digit code sent to your email or phone.
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {otp.map((data, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              ref={(ref) => (inputRefs.current[i] = ref)}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all"
            />
          ))}
        </div>

        <div className="text-gray-700 text-sm mb-4">
          {otp.join("") === ""
            ? "Enter your one-time password."
            : `You entered: ${otp.join("")}`}
        </div>

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
                  onClick={handleverifyotp}
                  disabled= {verifyOtpMutation.isPending}
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
