import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface VicharCardProps {
  children: React.ReactNode
  className?: string
  glassmorphic?: boolean
}

export function VicharCard({ children, className, glassmorphic = true }: VicharCardProps) {
  return (
    <Card className={cn(
      glassmorphic && "bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100/60",
      "rounded-2xl",
      className
    )}>
      {children}
    </Card>
  )
}

// Re-export all card sub-components with glassmorphic styling
export function VicharCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardHeader className={cn("pb-4", className)}>
      {children}
    </CardHeader>
  )
}

export function VicharCardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardTitle className={cn("text-lg font-bold text-gray-900", className)}>
      {children}
    </CardTitle>
  )
}

export function VicharCardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardDescription className={cn("text-gray-600", className)}>
      {children}
    </CardDescription>
  )
}

export function VicharCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardContent className={cn("pt-0", className)}>
      {children}
    </CardContent>
  )
}

export function VicharCardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <CardFooter className={cn("pt-4", className)}>
      {children}
    </CardFooter>
  )
} 