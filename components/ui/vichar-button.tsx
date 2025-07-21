import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface VicharButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  glassmorphic?: boolean
}

export const VicharButton = forwardRef<HTMLButtonElement, VicharButtonProps>(
  ({ className, variant = 'default', size = 'default', glassmorphic = true, ...props }, ref) => {
    return (
      <Button
        className={cn(
          glassmorphic && variant === 'default' && "bg-blue-600/90 hover:bg-blue-700/90 shadow-lg hover:shadow-xl transition-all duration-200",
          glassmorphic && variant === 'outline' && "border-gray-200/60 bg-white/80 hover:bg-white/90 shadow-md hover:shadow-lg transition-all duration-200",
          glassmorphic && variant === 'secondary' && "bg-gray-100/80 hover:bg-gray-200/80 shadow-md hover:shadow-lg transition-all duration-200",
          "rounded-xl font-semibold",
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    )
  }
)

VicharButton.displayName = "VicharButton" 