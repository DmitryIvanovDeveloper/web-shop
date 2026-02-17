# Development Guide

## Quality Assurance

This project uses multiple layers of type checking and linting to ensure code quality matches production deployment standards.

### TypeScript Configuration

The project uses strict TypeScript settings to catch errors early:

```json
{
  "strict": true,
  "skipLibCheck": false,
  "exactOptionalPropertyTypes": true,
  "noImplicitReturns": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noUncheckedIndexedAccess": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Available Commands

#### Quality Checks
```bash
# Basic type checking
npm run type-check

# Strict type checking (recommended)
npm run type-check:strict

# CI-like type checking
npm run type-check:ci

# ESLint with warnings
npm run lint

# ESLint strict (no warnings allowed)
npm run lint:strict

# All quality checks
npm run quality

# All strict quality checks
npm run quality-strict

# Pre-commit checks
npm run pre-commit
```

#### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

#### Testing
```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Maintenance
```bash
# Clean build artifacts
make clean

# Clean everything
make clean-all

# Update dependencies
make update-deps

# Security audit
make audit

# Format code
make format

# Check formatting
make format-check
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks that automatically run:

1. **Type checking** - `npm run type-check`
2. **Strict linting** - `npm run lint:strict`

### IDE Configuration

VS Code settings are configured for strict type checking and automatic fixes:

- TypeScript strict mode enabled
- ESLint auto-fix on save
- Prettier formatting on save
- Import organization

### CI/CD Quality Gates

Vercel deployment includes:

1. **TypeScript CI check** - `npm run type-check:ci`
2. **Production build** - `npm run build`
3. **Clean cache** - Removes `.next` directory before build

### Code Quality Standards

#### TypeScript
- Use strict null checks
- Avoid `any` types (warn level)
- Use explicit return types for public APIs
- Prefer readonly properties and parameters
- Use exact optional property types

#### ESLint
- Import ordering enforced
- No duplicate imports
- Consistent type imports
- No unused variables (with underscore ignore pattern)
- Strict boolean expressions

#### Testing
- Unit tests for all utilities and business logic
- Integration tests for API interactions
- E2E tests for critical user flows

### Common Issues

#### Local vs Vercel Type Errors

If you see type errors only on Vercel but not locally:

1. Run `npm run type-check:ci` to simulate Vercel environment
2. Clear TypeScript cache: `rm -rf .next`
3. Restart TypeScript language server in your IDE

#### Pre-commit Hook Issues

If pre-commit hooks fail:

1. Fix the reported errors
2. Run `npm run pre-commit` manually to verify
3. Commit again

#### Performance Issues

For better development performance with strict checking:

1. Use VS Code with the configured settings
2. Keep `incremental: false` in tsconfig for accurate error reporting
3. Use `make dev` for optimized development workflow

### Best Practices

1. **Always run `npm run quality-strict`** before pushing
2. **Use `make ci`** to simulate the full CI pipeline locally
3. **Fix type errors immediately** - don't accumulate technical debt
4. **Use the Makefile** for consistent command execution
5. **Keep dependencies updated** with `make update-deps`

### Troubleshooting

#### TypeScript cache issues
```bash
# Clear all caches
make clean-all
npm install
npm run type-check:ci
```

#### ESLint cache issues
```bash
# Clear ESLint cache
npx eslint --cache-location .eslintcache --cache
rm .eslintcache
```

#### IDE sync issues
```bash
# Restart TypeScript language server
# In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"
```