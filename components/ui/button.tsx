"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 transition-all disabled:pointer-events-none disabled:opacity-50 font-mono text-xs tracking-widest uppercase",
  {
    variants: {
      variant: {
        default: "bg-ink text-parchment border border-ink hover:opacity-90",
        outline:
          "border border-ink text-ink bg-transparent hover:bg-ink hover:text-parchment",
        ghost: "text-ink hover:bg-tan",
        ochre: "bg-ochre text-parchment border border-ochre hover:opacity-90",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-[11px]",
        lg: "px-8 py-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
