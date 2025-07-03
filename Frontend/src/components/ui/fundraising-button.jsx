import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const fundraisingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform active:scale-95 shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        // Primary donation - Orange/coral for warmth and generosity
        donate:
          "bg-gradient-to-r from-orange-500 to-coral-500 text-white shadow-orange-500/25 hover:from-orange-600 hover:to-coral-600 hover:shadow-orange-500/40 hover:scale-105 border border-orange-400/20",

        // Trust-building - Blue for reliability and security
        trust:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/40 hover:scale-105 border border-blue-400/20",

        // Success/completion - Green for positive outcomes
        success:
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/40 hover:scale-105 border border-emerald-400/20",

        // Urgent action - Red for immediate action
        urgent:
          "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/25 hover:from-red-600 hover:to-rose-600 hover:shadow-red-500/40 hover:scale-105 border border-red-400/20 animate-pulse",

        // Secondary support - Purple for community and support
        support:
          "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-purple-500/25 hover:from-purple-600 hover:to-violet-600 hover:shadow-purple-500/40 hover:scale-105 border border-purple-400/20",

        // Warm secondary - Amber for encouragement
        warm: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-amber-500/25 hover:from-amber-600 hover:to-yellow-600 hover:shadow-amber-500/40 hover:scale-105 border border-amber-400/20",

        // Outline variants for secondary actions
        "outline-donate":
          "border-2 border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-500 hover:text-white shadow-orange-500/10 hover:shadow-orange-500/25 hover:scale-105",
        "outline-trust":
          "border-2 border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-500 hover:text-white shadow-blue-500/10 hover:shadow-blue-500/25 hover:scale-105",
        "outline-success":
          "border-2 border-emerald-500 text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105",

        // Ghost variants for subtle actions
        "ghost-donate":
          "text-orange-600 hover:bg-orange-100 hover:text-orange-700 shadow-none hover:shadow-md hover:shadow-orange-500/20",
        "ghost-trust":
          "text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-none hover:shadow-md hover:shadow-blue-500/20",

        // Destructive for dangerous actions
        destructive:
          "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-red-500/25 hover:from-red-700 hover:to-pink-700 hover:shadow-red-500/40 hover:scale-105 border border-red-400/20",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6 py-2",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg font-bold",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "donate",
      size: "default",
      fullWidth: false,
    },
  }
);

const FundraisingButton = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          fundraisingButtonVariants({ variant, size, fullWidth, className })
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? loadingText || "Loading..." : children}
      </Comp>
    );
  }
);
FundraisingButton.displayName = "FundraisingButton";

export { FundraisingButton, fundraisingButtonVariants };
