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

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.message || "Something went wrong. Please try again."
        );
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Reset email sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Forgot Password
          </h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            Enter your email and we’ll send you a password reset link.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
