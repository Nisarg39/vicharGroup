# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with this Next.js 14 exam portal application.

> **Memory Management**: This file is automatically loaded into Claude's context. Keep instructions specific and actionable.

## Development Commands

**Required Commands** (Always run these after code changes):
```bash
# Development server (default port 3000)
npm run dev

# Production build (must pass before commits)
npm run build

# Production server
npm start

# Linting (must pass before commits)
npm run lint
```

**Testing Strategy**:
- Manual testing required for exam portal features
- Test offline functionality in exam interface
- Verify database connections before deployment
- Test authentication flows (Google OAuth, OTP)

## Project Architecture

This is a Next.js 14 exam portal application using App Router with a three-tier architecture:

1. **Frontend**: React components with SSR, Redux Toolkit state management, Tailwind CSS
2. **Backend**: Server Actions for API logic, NextAuth.js authentication
3. **Database**: MongoDB with Mongoose ODM

### Key Technologies
- **Next.js 14** with App Router
- **MongoDB** with Mongoose for data persistence
- **NextAuth.js** with Google OAuth and JWT tokens
- **Tailwind CSS** with Radix UI components
- **Redux Toolkit** for client state management
- **Cloudinary** for file uploads
- **Razorpay** for payments

## Code Structure

### Components Organization
```
components/
├── admin/                    # Admin panel components
├── examPortal/              # Exam portal (college/student interfaces)
├── classroom/               # Course management
├── common/                  # Shared UI components
└── landing/                 # Landing page components
```

### Server Actions Structure
```
server_actions/
├── actions/
│   ├── adminActions.js           # Admin operations
│   ├── studentActions.js         # Student operations
│   └── examController/           # Exam-specific operations
│       ├── collegeActions.js     # College management
│       ├── studentExamActions.js # Student exam operations
│       └── teacherActions.js     # Teacher operations
├── models/                       # Mongoose schemas
└── config/mongoose.js           # Database connection
```

## Key Data Models

### Core Relationships
- **Student** → **College** (Many-to-One via EnrolledStudent)
- **College** → **Exam** (One-to-Many)
- **Exam** → **master_mcq_question** (Many-to-Many)
- **Student** → **ExamResult** (One-to-Many)

### Important Models
- `Student` - User profiles with cart, purchases, college relationships
- `College` - College information with enrolled students and teachers
- `Exam` - Exam configuration with questions, timing, marking schemes
- `ExamResult` - Student submissions with detailed analytics
- `master_mcq_question` - Question bank with categorization
- `EnrolledStudent` - Student-college enrollment mapping

## Authentication System

### Multi-Modal Authentication
- **Google OAuth** via NextAuth.js for social login
- **OTP verification** for phone/email
- **JWT tokens** for session management
- **Role-based access**: Student, Teacher, Admin, College

### Authentication Patterns
```javascript
// Server action authentication
const user = await auth(details) // Generic auth
const college = await collegeAuth(details) // College-specific auth
```

## Critical Features

### Offline Exam Portal
- **PWA capabilities** with service worker
- **IndexedDB** for offline storage
- **Background sync** for submissions
- **Auto-save** every 30 seconds during exams

### Exam System Features
- **LaTeX support** for mathematical expressions
- **Negative marking** with customizable rules
- **Question shuffling** and navigation
- **Timed auto-submission**
- **Detailed analytics** and performance insights

## Development Guidelines

### Server Actions
- Always use `await connectDB()` before database operations
- Implement proper error handling with try-catch blocks
- Use `collegeAuth()` for college-specific operations
- Return consistent response format: `{ success, message, data }`

### Component Patterns
- Use functional components with hooks
- Implement loading states and error boundaries
- Follow Tailwind CSS design system
- Use Radix UI for accessible components

### Database Operations
- Use Mongoose with proper schema validation
- Implement proper indexes for performance
- Use `.lean()` for read-only operations
- Convert ObjectIds to strings for client compatibility

## State Management

### Redux Toolkit Slices
- `authSlice` - Authentication state
- `cartSlice` - Shopping cart state
- `examSlice` - Exam portal state

### Local State Patterns
- Use `useState` for component-level state
- Use `useEffect` for side effects and data fetching
- Implement proper cleanup in useEffect hooks

## File Upload & Media

### Cloudinary Integration
- Images uploaded to Cloudinary via API
- Automatic optimization and transformation
- Secure upload with signed URLs

## Payment Processing

### Razorpay Integration
- Order creation via server actions
- Payment verification and webhook handling
- Payment status tracking in database

## Performance Considerations

### Image Optimization
- Next.js Image component for optimization
- Cloudinary transformations for different sizes
- Lazy loading for better performance

### Database Queries
- Use pagination for large datasets
- Implement proper indexing
- Use aggregation pipelines for complex queries

## Security Practices

- JWT token validation on protected routes
- Input sanitization and validation
- Proper error handling without exposing sensitive data
- CORS configuration for API security

## Testing Patterns

**Debugging Workflow**:
1. **Database First**: Always check `await connectDB()` connections
2. **Authentication**: Verify JWT tokens and session state
3. **Offline Features**: Test PWA functionality and IndexedDB storage
4. **Form Validation**: Test error states and edge cases
5. **Performance**: Monitor bundle size and lazy loading

**Critical Test Cases**:
- Exam submission during network failure
- Auto-save functionality every 30 seconds
- LaTeX rendering in questions
- Payment flow with Razorpay
- File uploads to Cloudinary

## Claude Code Best Practices

### Planning and Research
- **Always research first**: Use search tools to understand codebase before coding
- **Plan complex tasks**: Break multi-step features into smaller, testable components
- **Verify patterns**: Check existing components for established patterns before creating new ones

### Code Quality Standards
- **No unnecessary comments**: Code should be self-documenting
- **Follow existing conventions**: Match indentation, naming, and structure patterns
- **Security first**: Never expose secrets, validate all inputs, sanitize outputs
- **Performance aware**: Use `.lean()` for MongoDB queries, implement proper indexing

### Development Workflow
1. **Research phase**: Understand requirements and existing code
2. **Planning phase**: Break down tasks and identify dependencies
3. **Implementation phase**: Write code following established patterns
4. **Verification phase**: Run build, lint, and manual testing
5. **Cleanup phase**: Remove debugging code, optimize imports

### Error Handling Patterns
```javascript
// Server Actions - Always use this pattern
try {
  await connectDB();
  const result = await operation();
  return { success: true, message: "Success", data: result };
} catch (error) {
  console.error("Operation failed:", error);
  return { success: false, message: "Operation failed", data: null };
}
```

### Component Development
- **Functional components only**: Use hooks for state management
- **Loading states**: Always implement loading and error boundaries
- **Accessibility**: Use Radix UI components for keyboard navigation
- **Responsive design**: Mobile-first approach with Tailwind CSS

### Memory Optimization
- This CLAUDE.md file is automatically loaded into context
- Keep instructions specific and actionable
- Update regularly as project evolves
- Use `@path/to/file` syntax for file imports when needed