# ASTRIA WEB-APPS DEV GUIDE

## BUILD & TEST COMMANDS
- 🏗️ Build: `npm run build` or `just b`
- 🧪 Test: `npm run test` or `just t`
- 🔬 Single test: `npm test -- -t "test name pattern"`
- 🧹 Lint: `npm run lint` or `just l`
- ✅ Type check: `npm run check-types`
- 💅 Format: `just f` or `just format`
- 🚀 Dev server: `npm run dev`

## CODE STYLE
- TypeScript with strict typing
- Functional React components with hooks
- Feature-based organization
- Next.js app directory structure
- Co-located test files (.test.tsx)
- Context pattern for state sharing
- Absolute imports
- ESLint with Next.js, React, and TypeScript rules
- Component organization: atoms → molecules → organisms
- Error handling via try/catch and notifications context
- Test with React Testing Library