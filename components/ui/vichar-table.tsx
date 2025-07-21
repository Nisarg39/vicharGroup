import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface VicharTableProps {
  children: React.ReactNode
  className?: string
  glassmorphic?: boolean
}

export function VicharTable({ children, className, glassmorphic = true }: VicharTableProps) {
  return (
    <div className={cn(
      glassmorphic && "bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 overflow-hidden",
      className
    )}>
      <Table>
        {children}
      </Table>
    </div>
  )
}

export function VicharTableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableHeader className={cn(
      "bg-gradient-to-r from-blue-50/60 to-indigo-50/40",
      className
    )}>
      {children}
    </TableHeader>
  )
}

export function VicharTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableHead className={cn(
      "text-xs font-bold text-gray-700 uppercase tracking-wider px-6 py-3",
      className
    )}>
      {children}
    </TableHead>
  )
}

export function VicharTableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableBody className={cn("divide-y divide-gray-100", className)}>
      {children}
    </TableBody>
  )
}

export function VicharTableRow({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <TableRow className={cn(
      "hover:bg-blue-50/40 transition-colors duration-200",
      className
    )} {...props}>
      {children}
    </TableRow>
  )
}

export function VicharTableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableCell className={cn("px-6 py-4", className)}>
      {children}
    </TableCell>
  )
} 