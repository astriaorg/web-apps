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
- Prefer explicit `Boolean(someVar)` over shorthand `!!someVar`
- Use double quotes for Typescript strings.
- ALWAYS ENSURE THERE IS A NEW LINE AT THE END OF THE FILE! IT IS 
  VERY IMPORTANT TO ALWAYS ADD AN EMPTY NEW LINE TO THE END OF FILES.
  THERE MUST NEVER BE A FILE YOU TOUCH THAT DOES NOT END IN A NEW LINE.
- NEVER write a nested ternary.
- Do not leave a comment when you remove code explaining why you removed the
  code.
