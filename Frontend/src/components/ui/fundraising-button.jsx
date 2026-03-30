import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const fundraisingButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        donate: "bg-primary text-primary-foreground hover:bg-primary/90",
        trust: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        success: "bg-primary text-primary-foreground hover:bg-primary/85",
        urgent: "bg-destructive text-white hover:bg-destructive/90",
        support: "bg-secondary text-secondary-foreground hover:bg-secondary/85",
        warm: "bg-accent text-accent-foreground hover:bg-accent/90",
        "outline-donate":
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        "outline-trust":
          "border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground",
        "outline-success":
          "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        "ghost-donate": "text-primary hover:bg-primary/10",
        "ghost-trust": "text-secondary hover:bg-secondary/10",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
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
  },
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
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          fundraisingButtonVariants({ variant, size, fullWidth, className }),
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? loadingText || "Loading..." : children}
      </Comp>
    );
  },
);
FundraisingButton.displayName = "FundraisingButton";

export { FundraisingButton, fundraisingButtonVariants };
