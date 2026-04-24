import { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary"
  label?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ label = "Button", ...rest }, ref) => {
    return (
      <button ref={ref} {...rest}>
        {label}
      </button>
    )
  }
)

Button.displayName = "Button"
