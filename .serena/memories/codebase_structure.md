# Codebase Structure

## Monorepo Structure (npm workspaces)

```
/
├── packages/
│   ├── web/                  # React frontend application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── i18n/         # Translation files (yml)
│   │   │   ├── routes/       # Page routes
│   │   │   └── main.tsx      # Entry point
│   │   ├── public/           # Static assets
│   │   └── package.json      # Frontend dependencies
│   ├── cdk/                  # AWS CDK infrastructure
│   │   ├── bin/              # CDK app entry
│   │   ├── lib/              # CDK stacks
│   │   ├── lambda/           # Lambda function code
│   │   └── package.json      # CDK dependencies
│   ├── types/                # Shared TypeScript types
│   ├── common/               # Shared utility functions
│   └── eslint-plugin-i18nhelper/  # Custom ESLint plugin
├── browser-extension/        # Chrome/Edge extension
├── docs/                     # Documentation (MkDocs)
├── .serena/                  # Serena MCP memory files
├── package.json              # Root package with scripts
├── CLAUDE.md                 # Instructions for Claude AI
├── setup-env.sh              # Environment setup script
└── mkdocs.yml               # Documentation config
```

## Key Directories

### packages/web/src

- Main frontend application code
- React components with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- AWS Amplify for authentication

### packages/cdk

- Infrastructure as Code using AWS CDK
- Lambda functions in TypeScript
- API Gateway configurations
- DynamoDB tables, S3 buckets, etc.

### packages/types

- Shared TypeScript interfaces and types
- Used by both frontend and backend

### packages/common

- Shared utility functions
- Used across multiple packages

## File Naming Patterns

- React components: PascalCase.tsx (e.g., Button.tsx)
- Hooks: use\*.ts (e.g., useAuth.ts)
- Utils: camelCase.ts (e.g., formatDate.ts)
- Tests: _.test.ts or _.spec.ts
- Config files: dot files (e.g., .eslintrc.cjs)

## Important Files

- package.json: Main scripts and workspace configuration
- CLAUDE.md: AI assistant instructions
- .env.local: Frontend environment variables (auto-generated)
- cdk.json: CDK configuration
- tsconfig.json: TypeScript configuration
