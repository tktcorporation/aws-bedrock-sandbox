# Suggested Commands for Development

## Initial Setup

```bash
npm ci                        # Install dependencies
npm run cdk:deploy           # Deploy AWS infrastructure first
npm run setup-env            # Get AWS environment variables from CloudFormation
```

## Development

```bash
npm run web:devw             # Start dev server with AWS integration (Linux/Mac)
npm run web:devww            # Start dev server with AWS integration (Windows PowerShell)
npm run web:dev              # Start dev server (requires manual .env.local setup)
```

## Quality Checks (MUST RUN BEFORE COMPLETING TASKS)

```bash
npm run lint                 # Run all linters (MANDATORY)
npm run web:build           # Ensure build succeeds (MANDATORY)
npm run test                # Run all tests
```

## Testing

```bash
npm test                     # Run all tests
npm run web:test            # Frontend tests only
npm run cdk:test            # CDK infrastructure tests
npm run cdk:test:update-snapshot  # Update CDK snapshots
```

## Deployment

```bash
npm run cdk:deploy          # Full deployment with checks
npm run cdk:deploy:quick    # Fast deployment without pre-checks
npm run web:build          # Build frontend for production
```

## Documentation

```bash
npm run docs:dev           # Start local documentation server
npm run docs:build         # Build documentation
npm run docs:gh-deploy     # Deploy to GitHub Pages
```

## Browser Extension

```bash
npm run extension:ci       # Install extension dependencies
npm run extension:dev      # Develop extension
npm run extension:build    # Build extension
```

## Git Commands (Linux)

```bash
git status                 # Check repository status
git diff                   # View changes
git add .                  # Stage all changes
git commit -m "message"    # Commit changes
git push                   # Push to remote
```

## File System Commands (Linux)

```bash
ls                        # List files
cd <directory>            # Change directory
pwd                       # Print working directory
grep -r "pattern" .       # Search for pattern
find . -name "*.ts"       # Find files by name
```
