import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"

// Re-export all form components with consistent styling
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage }

// Custom form wrapper with glassmorphic styling
interface VicharFormProps {
  children: React.ReactNode
  className?: string
  glassmorphic?: boolean
}

export function VicharForm({ children, className, glassmorphic = true }: VicharFormProps) {
  return (
    <div className={cn(
      glassmorphic && "bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 p-6",
      className
    )}>
      {children}
    </div>
  )
}

// Custom form item with consistent spacing
export function VicharFormItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <FormItem className={cn("space-y-2", className)}>
      {children}
    </FormItem>
  )
}

// Custom form label with consistent typography
export function VicharFormLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <FormLabel className={cn("text-sm font-medium text-gray-700", className)}>
      {children}
    </FormLabel>
  )
}

// Custom form description with consistent styling
export function VicharFormDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <FormDescription className={cn("text-sm text-gray-500", className)}>
      {children}
    </FormDescription>
  )
} 