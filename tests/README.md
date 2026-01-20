# Test Suite Documentation

## Package Management Tests

### Overview
The `package-management.test.ts` file contains comprehensive unit tests for verifying package versions and dependency compatibility in the Next.js project.

### Test Categories

#### 1. Package Version Updates (10 tests)
Tests that verify package versions are updated correctly in `package.json` and `pnpm-lock.yaml`:

- **Valid structure**: Ensures `package.json` has required fields (name, version, dependencies, devDependencies)
- **Next.js version**: Verifies Next.js version is correctly formatted and meets minimum version requirements (15+)
- **React compatibility**: Checks React and React-DOM versions match and are compatible with Next.js version
- **TypeScript version**: Ensures TypeScript is at least version 5.x
- **Lock file validation**: Verifies `pnpm-lock.yaml` exists and contains lockfile version
- **Lock file packages**: Confirms Next.js and React packages are present in lock file
- **Critical dependencies**: Ensures all critical dependencies have locked versions
- **Package manager**: Validates packageManager field is correctly set to pnpm
- **Semantic versioning**: Confirms all dependencies follow semantic versioning standards

#### 2. Dependency Compatibility (10 tests)
Tests that check compatibility between related packages after upgrades:

- **Next.js and React**: Validates version compatibility (Next.js 16+ requires React 19+)
- **TypeScript type definitions**: Ensures @types/react and @types/react-dom match their runtime versions
- **Next-auth compatibility**: Verifies next-auth version is compatible with Next.js
- **Tailwind CSS packages**: Checks Tailwind CSS and @tailwindcss/postcss versions match
- **ESLint compatibility**: Ensures ESLint version is compatible (8+)
- **Jest and ts-jest**: Verifies major versions match between jest and ts-jest
- **Prisma packages**: Confirms @prisma/client and prisma CLI have matching versions
- **Radix UI packages**: Validates all Radix UI packages are version 1+
- **Peer dependencies**: Checks critical package pairs exist together

#### 3. Security and Overrides (3 tests)
Tests that verify security overrides are properly configured:

- **Override configuration**: Ensures pnpm overrides are defined
- **Minimatch override**: Validates minimatch is overridden to a safe version
- **Glob override**: Confirms glob is overridden to a safe version

### Running Tests

Run all tests:
```bash
npm test
```

Run only package management tests:
```bash
npm test -- tests/package-management.test.ts
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Results
Current status: ✅ All 23 tests passing

### Maintenance
When upgrading dependencies:
1. Run these tests to verify compatibility
2. Update version requirements in tests if Next.js/React major versions change
3. Add new compatibility checks for newly added critical dependencies

### Related Files
- `package.json` - Dependency versions
- `pnpm-lock.yaml` - Locked dependency tree
- `jest.config.ts` - Jest configuration
- `jest.setup.ts` - Test environment setup
