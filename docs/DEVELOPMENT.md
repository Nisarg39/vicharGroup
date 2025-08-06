# Development Guide

## Claude Code Integration

This project is optimized for use with Claude Code. Key benefits:

### Quick Start with Claude Code
```bash
# Navigate to project root
cd /path/to/vichargroup

# Start Claude Code
claude

# Common commands
claude "help me debug the exam submission issue"
claude "add a new feature for bulk student enrollment"
claude "optimize the database queries in collegeActions.js"
```

### Workflow Optimization

**Research-First Approach**:
- Claude will automatically search the codebase before making changes
- Use specific, actionable requests for better results
- Leverage the comprehensive CLAUDE.md context

**Test-Driven Development**:
- Always run `npm run build` and `npm run lint` after changes
- Test critical paths: authentication, exam submission, payment flows
- Verify offline functionality in exam portal

### Memory Management

The project uses hierarchical memory through CLAUDE.md:
- **Project context**: Architecture, patterns, and conventions
- **Development commands**: Build, test, and deployment workflows  
- **Best practices**: Error handling, security, and performance guidelines

### Common Tasks

**Adding New Features**:
```bash
claude "implement student progress tracking with charts"
```

**Debugging Issues**:
```bash
claude "fix the exam timer not syncing properly"
```

**Code Review & Optimization**:
```bash
claude "review and optimize the exam result calculation logic"
```

**Database Operations**:
```bash
claude "add indexes to improve query performance"
```

### File Organization

Claude Code understands the project structure:
- `components/` - React components organized by feature
- `server_actions/` - Next.js server actions and database logic
- `models/` - Mongoose schemas and database models
- `CLAUDE.md` - Project context and guidelines

### Security Considerations

- Never commit sensitive data (`.env` files are gitignored)
- All authentication patterns are documented in CLAUDE.md
- Database operations use proper validation and error handling
- Payment processing follows secure patterns with Razorpay

### Performance Optimization

Claude Code is configured to:
- Use existing patterns and libraries
- Implement proper error boundaries
- Follow Next.js 14 best practices
- Optimize bundle size and loading performance

For more detailed information, see the comprehensive CLAUDE.md file in the project root.