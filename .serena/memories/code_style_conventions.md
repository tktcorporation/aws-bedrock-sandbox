# Code Style and Conventions

## TypeScript Configuration

- **Target**: ES2020
- **Strict Mode**: Enabled
- **Module**: ESNext (bundler mode)
- **JSX**: react-jsx
- **Unused Locals/Parameters**: Error
- **No Fallthrough Cases**: Enabled

## Prettier Configuration

- Tab Width: 2 spaces
- Single Quotes: Yes
- Trailing Comma: ES5
- Semicolons: Always
- Bracket Spacing: Yes
- Bracket Same Line: Yes
- Arrow Parens: Always
- Tailwind CSS formatting plugin enabled

## ESLint Rules

- TypeScript recommended rules
- React hooks recommended rules
- Tailwind CSS recommended rules (classnames-order disabled for Prettier)
- YAML sorting and single quotes enforced
- JSX no hardcoded content warning
- i18n helpers for Japanese detection (currently disabled)

## Naming Conventions

- Components: PascalCase (e.g., TicTacToeGame.tsx)
- Files: kebab-case for utilities, PascalCase for components
- CSS classes: Tailwind utility classes
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE or camelCase

## Import/Export

- ES6 modules
- Default exports for components
- Named exports for utilities and hooks
- Type imports using `import type` when possible

## Comments

- **IMPORTANT**: Do NOT add comments unless explicitly requested by user
- Code should be self-documenting

## Internationalization

- All user-facing strings MUST use i18next
- Translation files in packages/web/src/i18n/\*.yml
- Custom ESLint rule enforces this pattern

## State Management

- Zustand for global state
- React hooks for local state
- Immer for immutable updates

## Testing

- Vitest for frontend tests
- Jest for CDK tests
- Test files named _.test.ts or _.spec.ts

## Pre-commit Hooks

- Husky runs linters on staged files via lint-staged
- All files must pass linting before commit
