import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Re-export all dialog components
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }

// Custom dialog content with glassmorphic styling
interface VicharDialogContentProps {
  children: React.ReactNode
  className?: string
  glassmorphic?: boolean
}

export function VicharDialogContent({ children, className, glassmorphic = true }: VicharDialogContentProps) {
  return (
    <DialogContent className={cn(
      glassmorphic && "bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100/60",
      "rounded-2xl",
      className
    )}>
      {children}
    </DialogContent>
  )
}

// Custom dialog header with consistent styling
export function VicharDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogHeader className={cn("pb-4", className)}>
      {children}
    </DialogHeader>
  )
}

// Custom dialog title with consistent typography
export function VicharDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogTitle className={cn("text-lg font-bold text-gray-900", className)}>
      {children}
    </DialogTitle>
  )
}

// Custom dialog description with consistent styling
export function VicharDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogDescription className={cn("text-gray-600", className)}>
      {children}
    </DialogDescription>
  )
}

// Custom dialog footer with consistent spacing
export function VicharDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogFooter className={cn("pt-4", className)}>
      {children}
    </DialogFooter>
  )
} 