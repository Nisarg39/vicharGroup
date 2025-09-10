# Multi-Agent Configuration for VicharGroup

## Agent Overview
This project uses specialized AI agents to handle different aspects of the educational platform development, testing, and maintenance.

## Agent Roles

### 1. Frontend Architect Agent
**Role**: UI/UX Development and Component Architecture
**Responsibilities**:
- Develop and maintain React/Next.js components
- Implement shadcn/ui components following design system
- Ensure responsive design and accessibility
- Apply Neobrutalism design principles
- Handle component state management with Redux Toolkit
- Optimize performance with React.memo and code splitting

**Tools**: React, Next.js, shadcn/ui, Tailwind CSS, Redux Toolkit
**Focus Areas**: `/components/`, `/src/app/`, UI consistency

### 2. Backend Engineer Agent
**Role**: Server-side Development and Database Management
**Responsibilities**:
- Develop server actions and API routes
- Manage MongoDB operations with Mongoose
- Implement authentication with NextAuth.js
- Handle payment integration with Razorpay
- Ensure proper error handling and validation
- Optimize database queries and indexing

**Tools**: Node.js, MongoDB, Mongoose, NextAuth.js, Razorpay
**Focus Areas**: `/server_actions/`, `/src/app/api/`, database models

### 3. Exam Portal Specialist Agent
**Role**: Exam System Development and Optimization
**Responsibilities**:
- Develop exam portal components and logic
- Implement progressive scoring system
- Handle exam attempt management
- Optimize exam performance and bottlenecks
- Manage question controls and admin features
- Ensure exam data integrity and security

**Tools**: React, MongoDB, Progressive scoring algorithms
**Focus Areas**: `/components/examPortal/`, `/lib/progressive-scoring/`, exam monitoring

### 4. Payment & Commerce Agent
**Role**: Payment Processing and E-commerce Features
**Responsibilities**:
- Implement Razorpay payment integration
- Handle payment flows and order management
- Manage course enrollment and access control
- Implement affiliate system features
- Handle payment security and validation
- Manage subscription and billing logic

**Tools**: Razorpay API, Next.js API routes, MongoDB
**Focus Areas**: `/components/payment/`, `/src/app/payment/`, payment APIs

### 5. Admin & Monitoring Agent
**Role**: Administrative Features and System Monitoring
**Responsibilities**:
- Develop admin dashboard components
- Implement monitoring and analytics
- Handle user management and permissions
- Manage course and content administration
- Monitor system performance and bottlenecks
- Handle debugging and troubleshooting

**Tools**: React, MongoDB, Monitoring tools
**Focus Areas**: `/components/admin/`, `/lib/monitoring/`, admin APIs

### 6. Testing & Quality Agent
**Role**: Testing, Debugging, and Code Quality
**Responsibilities**:
- Write and maintain unit tests
- Perform integration testing
- Debug issues and performance problems
- Ensure code quality and standards compliance
- Handle error scenarios and edge cases
- Monitor and fix linter errors

**Tools**: Jest, Testing libraries, Linting tools
**Focus Areas**: Testing files, debugging scripts, quality assurance

### 7. Performance & Optimization Agent
**Role**: Performance Optimization and Monitoring
**Responsibilities**:
- Optimize database queries and indexing
- Implement caching strategies
- Monitor and improve page load times
- Optimize images and assets
- Handle code splitting and lazy loading
- Monitor system bottlenecks

**Tools**: Performance monitoring, Caching, Optimization tools
**Focus Areas**: Performance optimization, monitoring, caching

## Agent Collaboration Patterns

### Parallel Development
- **Frontend Architect** + **Backend Engineer**: Work simultaneously on new features
- **Exam Portal Specialist** + **Testing Agent**: Develop and test exam features together
- **Payment Agent** + **Admin Agent**: Implement payment admin features

### Sequential Workflows
1. **Frontend Architect** → **Testing Agent** → **Performance Agent**
2. **Backend Engineer** → **Admin Agent** → **Monitoring Agent**
3. **Exam Portal Specialist** → **Quality Agent** → **Optimization Agent**

### Code Review Process
- **Primary Agent**: Implements feature
- **Secondary Agent**: Reviews and suggests improvements
- **Quality Agent**: Final validation and testing

## Communication Protocols

### Agent Handoff
- Use clear commit messages with agent tags: `[Frontend]`, `[Backend]`, `[Exam]`, etc.
- Document changes in pull request descriptions
- Use TODO comments for agent-specific tasks

### Conflict Resolution
- **Frontend Architect** has final say on UI/UX decisions
- **Backend Engineer** has final say on API and database decisions
- **Admin Agent** has final say on administrative features
- **Quality Agent** can override any decision for quality reasons

### Background Agent Triggers
- **Performance Agent**: Triggered by slow queries or high load
- **Testing Agent**: Triggered by new code commits
- **Monitoring Agent**: Triggered by system alerts or errors
- **Optimization Agent**: Triggered by performance degradation

## Project-Specific Guidelines

### Code Standards
- Follow the `.cursorrules` configuration
- Use shadcn/ui components exclusively
- Maintain Neobrutalism design principles
- Follow Next.js App Router patterns
- Use TypeScript for new files

### Database Operations
- Use Mongoose for all MongoDB operations
- Implement proper error handling
- Use server actions for form submissions
- Follow RESTful API conventions

### Security Requirements
- Implement proper authentication checks
- Validate all user inputs
- Use environment variables for sensitive data
- Implement proper CORS policies

### Performance Targets
- Page load times < 2 seconds
- Database queries < 100ms
- Image optimization and lazy loading
- Code splitting for large components

## Agent Workflow Examples

### New Feature Development
1. **Frontend Architect**: Creates UI components
2. **Backend Engineer**: Implements API endpoints
3. **Testing Agent**: Writes tests
4. **Performance Agent**: Optimizes if needed

### Bug Fix Workflow
1. **Monitoring Agent**: Identifies issue
2. **Quality Agent**: Investigates root cause
3. **Specialist Agent**: Implements fix
4. **Testing Agent**: Validates fix

### Performance Optimization
1. **Performance Agent**: Identifies bottlenecks
2. **Backend Engineer**: Optimizes database
3. **Frontend Architect**: Optimizes components
4. **Monitoring Agent**: Validates improvements

## Environment Configuration

### Development
- All agents work on feature branches
- Use `npm run dev` for development server
- Follow git workflow with agent tags

### Production
- **Quality Agent**: Validates before deployment
- **Performance Agent**: Monitors post-deployment
- **Monitoring Agent**: Handles production issues

## Success Metrics

### Code Quality
- Zero linter errors
- 90%+ test coverage
- Performance benchmarks met

### Development Speed
- Parallel feature development
- Reduced code review time
- Faster bug resolution

### System Reliability
- 99.9% uptime
- Fast response times
- Secure operations

---

*This configuration enables efficient multi-agent collaboration for the VicharGroup educational platform, ensuring high-quality, performant, and maintainable code.*
