"use client";

import { CircleUserRound } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef, memo } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  name: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

// Define the CSS for the shimmer animation - this ensures it's available
const ShimmerStyles = () => (
  <style jsx global>{`
    @keyframes buttonShimmer {
      0% {
        background-position: 0% 0%;
      }
      100% {
        background-position: -200% 0%;
      }
    }

    .shimmer-button {
      background: linear-gradient(110deg, #af7eff 45%, #c1a3f2 55%, #af7eff);
      background-size: 200% 100%;
      animation: buttonShimmer 1s linear infinite;
      position: relative;
      overflow: hidden;
    }
  `}</style>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      name,
      variant = "primary",
      size = "md",
      icon: Icon = CircleUserRound,
      iconPosition = "left",
      className,
      style,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "h-8 px-2 text-sm",
      md: "h-9 px-3 text-base",
      lg: "h-10 px-4 text-lg",
    };

    // Define base button classes
    const baseClasses =
      "inline-flex items-center justify-center rounded-sm font-medium focus:outline-none focus:ring-1 gap-1";

    // Create styles for different variants
    let variantClasses = "";
    const buttonStyles = { ...style };

    // Handle different variants with appropriate styling
    if (variant === "primary") {
      variantClasses =
        "shimmer-button text-white border-[1.5px] border-purple-primary focus:ring-purple-800 shadow-sm hover:shadow-md";
    } else if (variant === "secondary") {
      variantClasses =
        "bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200 transition-colors duration-300";
    } else if (variant === "outline") {
      variantClasses =
        "border border-purple-800 text-purple-800 hover:bg-purple-50 transition-colors duration-300";
    } else if (variant === "ghost") {
      variantClasses =
        "text-purple-800 hover:bg-purple-50 transition-colors duration-300";
    }

    return (
      <>
        <ShimmerStyles />
        <button
          ref={ref}
          className={cn(
            baseClasses,
            sizeClasses[size],
            variantClasses,
            className
          )}
          style={buttonStyles}
          {...props}
        >
          {iconPosition === "left" && Icon && (
            <Icon
              className={cn(
                "size-5",
                size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5"
              )}
            />
          )}
          {name}
          {iconPosition === "right" && Icon && (
            <Icon
              className={cn(
                "size-5",
                size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5"
              )}
            />
          )}
        </button>
      </>
    );
  }
);

Button.displayName = "Button";

export default memo(Button);
