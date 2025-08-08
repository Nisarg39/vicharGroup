# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server (port 3000)
npm run dev

# Production server
npm start

# Linting (must pass before commits)
npm run lint
```

## Project Architecture

Next.js 14 exam portal with App Router, MongoDB, and offline capabilities.

### Tech Stack
- **Next.js 14** with App Router (`src/app/` directory)
- **MongoDB** with Mongoose ODM
- **NextAuth.js** for authentication (Google OAuth + JWT)
- **Redux Toolkit** for state management
- **Tailwind CSS** + Radix UI components
- **Cloudinary** for image uploads
- **Razorpay** for payments
- **PWA** with offline exam support

### Directory Structure
```
src/app/               # Next.js App Router pages
components/
├── admin/            # Admin panel components
├── examPortal/       # Exam interfaces
├── classroom/        # Course management
├── common/           # Shared components
└── landing/          # Landing pages

server_actions/
├── actions/          # Server-side logic
│   └── examController/
├── models/           # Mongoose schemas
│   └── exam_portal/
├── middleware/       # Auth middleware
└── config/           # Database config
```

## Key Patterns

### Server Actions
```javascript
// Always follow this pattern
export async function actionName(params) {
  try {
    await connectDB();
    // Your logic here
    return { success: true, message: "Success", data: result };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Error message", data: null };
  }
}
```

### Database Operations
- Always call `await connectDB()` first
- Use `.lean()` for read-only queries
- Convert ObjectIds to strings for client
- Use proper indexes for performance

### Authentication
- Multi-modal: Google OAuth, OTP, JWT
- Role-based: Student, Teacher, Admin, College
- Use `collegeAuth()` for college operations
- Protected routes use NextAuth session

## Critical Features

### Offline Exam System
- PWA with service worker (manifest at `/public/manifest.json`)
- IndexedDB for offline storage
- Auto-save every 30 seconds
- Background sync for submissions
- Handle network failures gracefully

### Exam Portal Features
- LaTeX rendering for math expressions (KaTeX)
- Negative marking with custom rules
- Question shuffling and navigation
- Timed exams with auto-submission
- Real-time progress tracking

### Image Handling
- Cloudinary for uploads and transformations
- Next.js Image component for optimization
- Quill editor with image resize module
- Lazy loading for performance

## Development Guidelines

### Component Development
- Functional components with hooks only
- Loading states and error boundaries required
- Use Radix UI for accessibility
- Mobile-first with Tailwind CSS
- Follow existing component patterns

### State Management
- Redux Toolkit for global state
- Local state with useState/useEffect
- Proper cleanup in useEffect
- Consistent action patterns

### Error Handling
- Try-catch in all server actions
- User-friendly error messages
- Don't expose sensitive data
- Log errors for debugging

### Performance
- Pagination for large datasets
- Database query optimization
- Bundle size monitoring
- Image optimization required

## BMAD Agent System

Use specialized agents for complex tasks:
- `/analyst` - Requirements research
- `/pm` - Product planning
- `/architect` - System design
- `/scrum` - Sprint planning
- `/dev` - Implementation
- `/qa` - Testing
- `/ui` - UI components
- `/structure` - Code organization

See `.bmad-project.md` for detailed workflows.

## Testing Checklist
1. Database connections
2. Authentication flows
3. Offline functionality
4. Form validation
5. Payment processing
6. Image uploads
7. Exam auto-save
8. LaTeX rendering