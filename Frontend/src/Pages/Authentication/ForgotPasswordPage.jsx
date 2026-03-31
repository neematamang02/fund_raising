// import React from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";

// const forgotPasswordSchema = z.object({
//   email: z.string().email("Enter a valid email"),
// });

// export default function ForgotPasswordPage() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(forgotPasswordSchema),
//   });

//   const mutation = useMutation({
//     mutationFn: async (data) => {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(data),
//         }
//       );

//       if (!res.ok) {
//         const error = await res.json();
//         throw new Error(error.message || "Something went wrong");
//       }

//       return res.json();
//     },
//     onSuccess: (data) => {
//       toast.success(data.message || "Reset email sent!");
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });

//   const onSubmit = (data) => {
//     mutation.mutate(data);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-md shadow-lg rounded-2xl">
//         <CardContent className="p-6">
//           <h2 className="text-2xl font-bold mb-4 text-center">
//             Forgot Password
//           </h2>
//           <p className="text-gray-600 text-sm mb-6 text-center">
//             Enter your email and we’ll send you a password reset link.
//           </p>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div>
//               <Input
//                 type="email"
//                 placeholder="you@example.com"
//                 {...register("email")}
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-500 mt-1">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={mutation.isPending}
//             >
//               {mutation.isPending ? "Sending..." : "Send Reset Link"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowRight } from "lucide-react";
import ROUTES from "@/routes/routes";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api`
        : "/api";

      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.message || "Something went wrong. Please try again.",
        );
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      toast.success(
        data.message || "If that email exists, an OTP has been sent.",
      );
      sessionStorage.setItem("forgotPasswordEmail", variables.email);
      navigate(ROUTES.RESET_PASSWORD, {
        state: { email: variables.email, mode: "otp" },
      });
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="surface-page flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Card className="surface-card w-full max-w-md rounded-xl border-slate-200 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-5 w-5 text-secondary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Forgot Password
          </CardTitle>
          <p className="text-sm text-slate-600">
            Enter your account email and we will send a reset link.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 p-6 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-lg border-slate-300"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending..." : "Send OTP"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-3 text-center">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm font-medium text-secondary hover:text-secondary/80"
            >
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
