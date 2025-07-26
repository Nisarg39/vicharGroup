# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 educational platform for Vichar Group, featuring an exam portal, course management, and student enrollment system. The application includes both online and offline examination capabilities with advanced features like PWA support, offline data caching, and real-time synchronization.

## Development Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint for code quality checks
```

## Project Architecture

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Mongoose ODM
- **State Management**: Redux Toolkit
- **UI Framework**: Tailwind CSS + Radix UI components
- **Authentication**: NextAuth.js
- **Payment Processing**: Razorpay integration

### Directory Structure

```
components/
├── admin/                    # Admin panel components
├── examPortal/              # Exam system components
│   ├── collegeComponents/   # College administration
│   ├── examPageComponents/  # Student exam interface
│   └── collegeTeacherComponent/ # Teacher portal
├── classroom/               # Student dashboard
├── home/                    # Landing page components
├── ui/                      # Reusable UI components (Radix-based)
└── common/                  # Shared utilities

server_actions/
├── actions/                 # Server action functions
├── models/                  # Mongoose schemas
├── config/                  # Database configuration
└── middleware/             # Authentication middleware

src/app/                     # Next.js App Router pages
utils/                       # Utility functions
```

### Key Models and Schemas

**Exam Portal Models** (`server_actions/models/exam_portal/`):
- `exam.js` - Exam configuration and metadata
- `college.js` - College/institution management
- `enrolledStudent.js` - Student enrollment data
- `examResult.js` - Exam results and analytics
- `master_mcq_question.js` - Question bank
- `studentRequest.js` - Enrollment requests

### Exam Portal Architecture

The exam portal is the core feature with sophisticated offline capabilities:

#### Key Components:
- **ExamInterface** (`components/examPortal/examPageComponents/ExamInterface.js`): Main exam taking interface with offline support
- **QuestionAssignmentModal** (`components/examPortal/collegeComponents/collegeDashboardComponents/manageExamComponents/QuestionAssignmentModal.js`): Complex question selection system
- **CollegeDashboard** - Administrative interface for colleges

#### Offline Functionality:
- Service Worker (`public/sw.js`) handles caching and background sync
- IndexedDB storage for exam data and submissions
- PWA manifest for app-like experience
- Offline hook (`src/hooks/use-offline.js`) manages connectivity state

### State Management

Redux store configuration in `lib/store.js` and `reduxStore/store.js`. Currently minimal but extensible for complex state management needs.

### Authentication Flow

- NextAuth.js configuration in `src/app/api/auth/[...nextauth]/route.js`
- Role-based access: Students, College Admins, Teachers, Super Admins
- JWT-based authentication with middleware protection

### Database Connection

MongoDB connection handled via `server_actions/config/mongoose.js` with connection pooling and error handling.

## Development Guidelines

### Component Patterns
- Use functional components with hooks
- Implement proper error boundaries for exam interfaces
- Follow the existing UI component patterns from `components/ui/`
- Maintain responsive design with Tailwind CSS

### Server Actions
- All database operations go through `server_actions/actions/`
- Use proper error handling and response formatting
- Implement authentication middleware where required

### Exam Portal Specific Considerations

#### Question Management:
- Questions stored in `master_mcq_question` collection
- Support for LaTeX mathematical expressions (using KaTeX)
- Image uploads and PDF handling for question content
- Subject-wise categorization and filtering

#### Offline Exam Features:
- Auto-save functionality every 30 seconds
- Local storage of exam progress with unique keys: `exam_progress_${examId}_${studentId}`
- Background sync when connectivity is restored
- Conflict resolution for duplicate submissions

#### Exam Flow:
1. Student authentication and eligibility check
2. Exam data caching for offline use
3. Fullscreen mode enforcement during exam
4. Real-time timer with auto-submission
5. Result calculation and storage

### Security Considerations
- Input validation for all form submissions
- SQL injection prevention through Mongoose
- XSS protection with proper sanitization
- Role-based access control throughout the application

### Performance Optimizations
- Next.js Image component for optimized images
- Dynamic imports for large components
- Lazy loading for exam questions
- Efficient caching strategies for offline use

## Special Features

### PWA Capabilities
- Installable web app
- Service worker for offline functionality
- Background synchronization
- Push notification support (configured but implementation pending)

### LaTeX Support
- Mathematical expressions rendered with KaTeX
- Support in question content and options
- Proper escaping and sanitization

### Payment Integration
- Razorpay integration for course purchases
- Order creation API at `/api/create-order/route.js`
- Payment verification and enrollment automation

### File Upload System
- Cloudinary integration for image management
- PDF processing capabilities
- Smart cropping tools for question images

## Testing and Debugging

### Offline Testing
1. Start exam while online to cache data
2. Disconnect network
3. Continue exam offline
4. Verify auto-save functionality
5. Reconnect and test sync

### Common Debugging Points
- Check browser console for service worker registration
- Verify IndexedDB for cached exam data
- Monitor network requests for API failures
- Check localStorage for exam progress

## Environment Setup

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `JWT_SECRET` - Custom JWT secret
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary config
- Payment gateway credentials (Razorpay)

The application supports both online and offline modes, with sophisticated caching and synchronization mechanisms designed for educational institutions requiring reliable exam delivery systems.