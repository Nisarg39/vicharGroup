# Vichar Group - Agent Instructions

## Commands
- **Dev**: `npm run dev` - Start development server
- **Build**: `npm run build` - Build production version
- **Lint**: `npm run lint` - Run ESLint
- **Start**: `npm start` - Start production server
- **Test**: No test framework configured

## Architecture
- **Framework**: Next.js 14 with TypeScript/JavaScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **File Upload**: Cloudinary integration
- **Payment**: Razorpay integration

## Code Style
- **Components**: Use React functional components with hooks
- **Imports**: Use relative imports for components (`../../components/`)
- **File Structure**: `/components/` for reusable UI, `/features/` for Redux slices, `/server_actions/` for backend logic
- **Styling**: Use Tailwind classes, gradient backgrounds for sections
- **State**: Use Redux for global state, useState for local state
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error Handling**: Use try-catch blocks, console.log for debugging
