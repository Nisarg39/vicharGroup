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

## Emergency Refactoring Status

**CRITICAL REFACTORING IN PROGRESS** (Started: 2025-08-24)

### Current State:
- 27 critical issues identified requiring urgent fixes
- Phase 0 safety setup COMPLETED (monitoring, backups, feature branches)
- Ready for Phase 1 critical fixes

### MANDATORY Multi-Agent Orchestrator:
```bash
# REQUIRED: Use orchestrator for ALL refactoring tasks (automatically coordinates multiple agents)
node .claude/agent_orchestrator.js "describe your task here"

# Check refactoring status and get auto-resume instructions
node .claude/auto_resume.js
```

**⚠️ IMPORTANT: Claude Code MUST use the agent orchestrator for ALL refactoring tasks, regardless of session. Never use single agents for complex refactoring work.**

### Auto-Resume Instructions:
**To continue refactoring in any new session, simply say:**
> "continue exam portal refactoring"

Claude Code will automatically:
1. **ANALYZE** task using agent orchestrator
2. **PRESENT** multi-agent coordination plan for approval  
3. **WAIT** for your approval ("yes", "modify", or "skip")
4. **EXECUTE** with coordinated agents if approved
5. **UPDATE** progress and move to next priority

**🤖 Multi-Agent Workflow Integration:**
- System automatically selects optimal agent combinations
- Coordinates sequential and parallel agent execution
- Ensures proper testing and validation workflow
- Maintains progress tracking across agent handoffs

**To see detailed plan immediately:**
```bash
node .claude/auto_resume.js --plan
```

### Priority Fixes Needed:
1. Database N+1 queries (server crashes)
2. Monolithic component breakdown (ExamInterface.js - 1,719 lines)
3. Client-side timer vulnerability (security risk)
4. Exam submission failures (data loss risk)
5. Memory leaks in timer management

### Safety Infrastructure Active:
- Comprehensive monitoring system deployed
- Feature flags for safe rollouts
- Error boundaries and logging
- Git backup tags and branches

**SEE:** `.claude/REFACTORING_SESSION_STATE.md` for detailed status and next steps

## Refactoring Trigger
When user says: **"continue exam portal refactoring"**

Claude Code will automatically:
1. Load refactoring context from persistent state
2. Present detailed execution plan for next critical issue
3. Wait for approval ("yes", "modify", or "skip")  
4. Execute with coordinated agents if approved
5. Update progress and move to next priority

**Implementation:** All refactoring tasks automatically use `.claude/agent_orchestrator.js` for proper multi-agent coordination

## REFACTORING WORKFLOW RULES

**🚨 MANDATORY ORCHESTRATOR USAGE:**
Claude Code MUST use the agent orchestrator for:
- Component refactoring and extraction
- Database query optimization  
- Architecture restructuring
- Performance improvements
- Security implementations
- Any task involving >1 file or >100 lines of code

**⚡ Orchestrator Integration Steps:**
1. Run orchestrator analysis for task planning
2. Execute selected agents in coordination
3. Apply proper testing workflow
4. Commit only after multi-agent validation

**❌ Never bypass orchestrator for complex tasks**

## Testing Checklist
1. Database connections
2. Authentication flows
3. Offline functionality
4. Form validation
5. Payment processing
6. Image uploads
7. Exam auto-save
8. LaTeX rendering