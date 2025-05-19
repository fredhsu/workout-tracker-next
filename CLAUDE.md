# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands
- Build: `npm run build`
- Development server: `npm run dev`
- Start production server: `npm run start`
- Lint: `npm run lint`

## Code Style Guidelines
- **Imports**: Use absolute imports with '@/' prefix (e.g., `@/components/ui/button`)
- **Components**: Use PascalCase for component names and their files
- **Types**: Use TypeScript interfaces for object shapes, type for aliases
- **Formatting**: Follow standard React/Next.js conventions with JSX in TSX files
- **State Management**: Use React hooks (useState, useEffect) for component state
- **Error Handling**: Use try/catch blocks and proper effect cleanup
- **CSS**: Use Tailwind CSS for styling with className prop
- **File Structure**: 
  - Components in src/components/
  - Page components in src/app/
  - Utility functions in src/lib/

## Notes
- Local storage is used for persisting data
- UI components use shadcn/ui pattern with Radix primitives
- React 19 with Next.js 15 and App Router