import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700": variant === "primary",
            "bg-teal-500 text-white hover:bg-teal-600": variant === "secondary",
            "border border-neutral-200 bg-transparent hover:bg-neutral-100 text-neutral-900 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-800": variant === "outline",
            "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100": variant === "ghost",
            "h-9 px-4 py-2 text-sm": size === "sm",
            "h-10 px-4 py-2 text-sm": size === "md",
            "h-11 px-8 py-2 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
