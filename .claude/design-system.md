# Vichar Design System - Complete UI Guidelines

## 🎯 **Core Design Philosophy**

**Goal**: Create visually stunning, modern, and accessible UI components while maximizing development speed through shadcn/ui integration.

**Primary Principle**: Always use shadcn/ui components first, then apply custom glassmorphic styling to maintain design consistency.

---

## 🏗️ **Component Architecture**

### **1. Shadcn/ui as Foundation**
- **ALWAYS use shadcn components first** before creating custom UI elements
- Import from `components/ui/` directory
- Apply custom styling to match glassmorphic theme
- **NEVER create custom div-based components when shadcn alternatives exist**

### **2. Custom Wrapper Components**
Use these custom wrappers for consistent styling:

```jsx
// ✅ Use custom wrappers
import { VicharCard, VicharCardContent, VicharCardHeader, VicharCardTitle } from '@/components/ui/vichar-card';
import { VicharButton } from '@/components/ui/vichar-button';
import { VicharTable, VicharTableHeader, VicharTableHead, VicharTableBody, VicharTableRow, VicharTableCell } from '@/components/ui/vichar-table';

// ❌ Avoid direct shadcn components
import { Card, Button, Table } from '@/components/ui/card';
```

---

## 🎨 **Visual Design Rules**

### **1. Glassmorphic/Soft Dashboard Style**
```jsx
// ✅ Glassmorphic backgrounds
className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60"

// ✅ Gradient backgrounds
className="bg-gradient-to-br from-blue-50 via-white to-indigo-50"

// ✅ Soft shadows and depth
className="shadow-xl hover:shadow-2xl transition-all duration-300"
```

### **2. Color Palette**
- **Primary**: Blue (`blue-600`, `blue-700`)
- **Success**: Green (`green-600`, `green-700`)
- **Warning**: Orange (`orange-600`, `orange-700`)
- **Error**: Red (`red-600`, `red-700`)
- **Info**: Purple (`purple-600`, `purple-700`)
- **Text**: Gray scale (`gray-900`, `gray-700`, `gray-600`, `gray-500`)

### **3. Typography**
```jsx
// ✅ Headings
className="text-2xl font-bold text-gray-900"  // Main headings
className="text-xl font-bold text-gray-900"  // Section headings
className="text-lg font-semibold text-gray-900"  // Subsection headings

// ✅ Body text
className="text-gray-700"  // Primary text
className="text-gray-600"  // Secondary text
className="text-sm text-gray-500"  // Small text
```

### **4. Spacing & Layout**
```jsx
// ✅ Consistent spacing
className="space-y-6"  // Vertical spacing between sections
className="gap-4"  // Grid/flex gaps
className="p-6"  // Card padding
className="px-4 py-3"  // Button padding

// ✅ Responsive containers
className="container mx-auto px-4 py-6 max-w-6xl"
```

---

## 📱 **Responsive Design Rules**

### **1. Mobile-First Approach**
```jsx
// ✅ Mobile-first responsive design
className="flex flex-col sm:flex-row"  // Stack on mobile, side-by-side on desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"  // Responsive grid
className="text-sm sm:text-base"  // Responsive typography
```

### **2. Touch-Friendly Elements**
```jsx
// ✅ Minimum touch target size
className="min-h-[44px] min-w-[44px]"  // iOS/Android guidelines
className="p-3 sm:p-4"  // Adequate padding for touch
```

### **3. Responsive Breakpoints**
- **Mobile**: `< 640px` (default)
- **Small**: `640px - 768px` (`sm:`)
- **Medium**: `768px - 1024px` (`md:`)
- **Large**: `1024px - 1280px` (`lg:`)
- **Extra Large**: `> 1280px` (`xl:`)

---

## 🧩 **Component-Specific Guidelines**

### **1. Cards (VicharCard)**
```jsx
<VicharCard className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60 hover:shadow-2xl transition-all duration-300">
  <VicharCardHeader>
    <VicharCardTitle className="text-xl font-bold text-gray-900">Section Title</VicharCardTitle>
  </VicharCardHeader>
  <VicharCardContent className="p-6">
    {/* Content */}
  </VicharCardContent>
</VicharCard>
```

### **2. Buttons (VicharButton)**
```jsx
// ✅ Primary button
<VicharButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
  <Play className="w-5 h-5" />
  Start Exam
</VicharButton>

// ✅ Secondary button
<VicharButton variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold">
  View Results
</VicharButton>
```

### **3. Tables (VicharTable)**
```jsx
<ScrollArea className="h-[400px] w-full rounded-md border">
  <VicharTable className="min-w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
    <VicharTableHeader className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 sticky top-0">
      <VicharTableRow>
        <VicharTableHead className="text-xs font-bold text-gray-700 uppercase tracking-wider">Header</VicharTableHead>
      </VicharTableRow>
    </VicharTableHeader>
    <VicharTableBody className="divide-y divide-gray-100">
      <VicharTableRow className="hover:bg-blue-50/40 transition">
        <VicharTableCell>Content</VicharTableCell>
      </VicharTableRow>
    </VicharTableBody>
  </VicharTable>
</ScrollArea>
```

### **4. Forms**
```jsx
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700">Label</FormLabel>
          <FormControl>
            <Input {...field} className="rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### **5. Alerts & Notifications**
```jsx
<Alert className="bg-blue-50 border border-blue-200 rounded-xl">
  <AlertCircle className="w-5 h-5 text-blue-600" />
  <AlertDescription className="text-blue-800">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <span className="font-medium">Alert message</span>
      <VicharButton size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
        Action
      </VicharButton>
    </div>
  </AlertDescription>
</Alert>
```

### **6. Badges**
```jsx
<Badge variant="default" className="bg-green-100 text-green-800">
  <Wifi className="w-4 h-4 mr-1" />
  Online
</Badge>
```

---

## 🎯 **Iconography Guidelines**

### **1. Use Heroicons (lucide-react)**
```jsx
import { Clock, Wifi, WifiOff, AlertCircle, CheckCircle, Play, BarChart3, ArrowLeft, RefreshCw, Download, Upload, BookOpen, Timer, Award } from "lucide-react";

// ✅ Consistent icon sizing
<Clock className="w-5 h-5 text-blue-600" />  // Standard size
<Play className="w-4 h-4" />  // Small size
<BarChart3 className="w-6 h-6" />  // Large size
```

### **2. Icon Containers**
```jsx
// ✅ Icon with background
<div className="p-2 bg-blue-100 rounded-lg">
  <Clock className="w-5 h-5 text-blue-600" />
</div>
```

---

## 📊 **Data Display Patterns**

### **1. Stats Cards**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Clock className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm font-medium text-blue-900">Duration</p>
      <p className="text-sm text-blue-700">60 minutes</p>
    </div>
  </div>
</div>
```

### **2. Status Indicators**
```jsx
<div className="flex items-center gap-2">
  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
  <span className="text-sm text-gray-600">Active</span>
</div>
```

---

## 🚀 **Performance & Accessibility**

### **1. Loading States**
```jsx
// ✅ Skeleton loading
<Skeleton className="h-4 w-32 mx-auto mb-2" />
<Skeleton className="h-3 w-48 mx-auto" />

// ✅ Spinner loading
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
```

### **2. Accessibility**
```jsx
// ✅ Proper ARIA labels
<button aria-label="Close dialog" className="sr-only">Close</button>

// ✅ Focus management
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

// ✅ Keyboard navigation
onKeyDown={(e) => e.key === 'Enter' && handleClick()}
```

---

## 🔧 **Available Shadcn Components**

### **✅ Installed & Ready to Use**
- `Button` → Use `VicharButton`
- `Card` → Use `VicharCard`
- `Table` → Use `VicharTable`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`
- `Dialog`, `Alert`, `AlertDescription`, `Badge`
- `ScrollArea`, `Skeleton`, `Separator`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`

### **🔄 Install as Needed**
```bash
# For advanced forms
npx shadcn@latest add switch slider

# For data display
npx shadcn@latest add accordion pagination

# For navigation
npx shadcn@latest add breadcrumb navigation-menu

# For feedback
npx shadcn@latest add toast progress
```

---

## ✅ **Quality Checklist**

Before submitting any UI component, ensure:

- [ ] **Uses shadcn components as primary UI elements**
- [ ] **Applies glassmorphic styling** (`bg-white/90`, `backdrop-blur-xl`, `rounded-2xl`)
- [ ] **Mobile responsive** (flex-col sm:flex-row, responsive grids)
- [ ] **Touch-friendly** (minimum 44px touch targets)
- [ ] **Proper spacing** (consistent gaps and padding)
- [ ] **Icon consistency** (Heroicons with proper sizing)
- [ ] **Color compliance** (uses defined color palette)
- [ ] **Accessibility** (ARIA labels, keyboard navigation)
- [ ] **Loading states** (skeleton or spinner where needed)
- [ ] **Error handling** (proper error states and messages)
- [ ] **Performance** (no unnecessary re-renders)
- [ ] **Matches visual polish** of existing components

---

## 🎯 **Quick Reference**

### **Common Patterns**
```jsx
// ✅ Page layout
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <div className="container mx-auto px-4 py-6 max-w-6xl">
    <div className="space-y-6">
      {/* Content */}
    </div>
  </div>
</div>

// ✅ Card layout
<VicharCard className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/60">
  <VicharCardHeader>
    <VicharCardTitle className="text-xl font-bold text-gray-900">Title</VicharCardTitle>
  </VicharCardHeader>
  <VicharCardContent className="p-6">
    {/* Content */}
  </VicharCardContent>
</VicharCard>

// ✅ Button with icon
<VicharButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
  <Play className="w-5 h-5" />
  Action
</VicharButton>
```

---

**Remember**: This design system prioritizes **speed of development** through shadcn/ui while maintaining **visual excellence** through glassmorphic styling. Always use the custom wrappers and follow these guidelines for consistency across the entire application. 