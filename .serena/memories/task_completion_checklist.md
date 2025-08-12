# Task Completion Checklist

## MANDATORY Steps Before Marking Task Complete

### 1. Code Quality Checks (REQUIRED)

```bash
npm run lint                  # Must pass with no errors
npm run web:build            # Must complete successfully
```

These commands are **MANDATORY** and must be run after any code changes. The task is NOT complete if these fail.

### 2. Testing (Recommended)

```bash
npm run test                 # Run tests if applicable
```

### 3. Verification Steps

- Ensure all TypeScript strict mode requirements are met
- Verify no hardcoded strings (use i18next for user-facing text)
- Check that changes follow existing code patterns
- Ensure no console.log statements in production code
- Verify proper error handling

### 4. Git Status Check

- Review all changed files
- Ensure no unintended modifications
- Check for any uncommitted changes

### 5. Documentation

- Update relevant documentation if API or configuration changes
- Only create documentation if explicitly requested

## Common Issues to Check

- No TypeScript errors
- No ESLint warnings
- Build completes without errors
- All imports are correct
- No unused variables or imports
- Proper async/await handling
- Correct typing for all functions and components

## DO NOT:

- Commit changes unless explicitly asked
- Create new files unless absolutely necessary
- Add comments unless requested
- Create documentation files proactively
