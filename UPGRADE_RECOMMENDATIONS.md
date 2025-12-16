# Dependency Upgrade Recommendations

## Critical Updates (Breaking Changes - Test Thoroughly)

### 1. React Email Components
- **Current**: `@react-email/components@0.0.36`
- **Latest**: `1.0.1`
- **Action**: Major version update with potential breaking changes
```bash
pnpm add @react-email/components@latest react-email@latest
```

### 2. Jest (Testing)
- **Current**: `jest@29.7.0`, `@types/jest@29.5.14`
- **Latest**: `30.2.0`, `30.0.0`
- **Action**: Major version update - may require config changes
```bash
pnpm add -D jest@^30 @types/jest@^30 ts-jest@^30
```

### 3. Recharts
- **Current**: `recharts@2.15.4`
- **Latest**: `3.6.0`
- **Action**: Major version with breaking changes
```bash
pnpm add recharts@^3
```

### 4. Stripe
- **Current**: `@stripe/react-stripe-js@3.10.0`, `@stripe/stripe-js@6.1.0`
- **Latest**: `5.4.1`, `8.6.0`
- **Action**: Major versions with potential API changes
```bash
pnpm add @stripe/react-stripe-js@latest @stripe/stripe-js@latest
```

### 5. Resend
- **Current**: `resend@4.8.0`
- **Latest**: `6.6.0`
- **Action**: Major version update
```bash
pnpm add resend@latest
```

### 6. Tailwind Merge
- **Current**: `tailwind-merge@2.6.0`
- **Latest**: `3.4.0`
- **Action**: Major version update
```bash
pnpm add tailwind-merge@^3
```

## Recommended Safe Updates

### 1. Prisma & Neon Adapter
```bash
pnpm add @prisma/adapter-neon@^7.1.0
pnpm add -D @prisma/client@^7.1.0 prisma@^7.1.0
```

### 2. Octokit
```bash
pnpm add @octokit/rest@^22 @octokit/plugin-paginate-rest@^14
```

### 3. Neon Serverless
```bash
pnpm add @neondatabase/serverless@^1
```

### 4. Node Types
```bash
pnpm add -D @types/node@^22
```

### 5. Lucide Icons
```bash
pnpm add lucide-react@latest
```

### 6. ESLint Config
```bash
pnpm add -D eslint-config-next@16.0.10
```

### 7. Hook Form Resolvers
```bash
pnpm add @hookform/resolvers@^5
```

### 8. Dotenv
```bash
pnpm add -D dotenv@^17
```

## Deprecated Subdependency Solution

The `brace-expansion` override in your package.json already addresses the deprecated subdependencies. The updated override uses a simpler approach:

```json
"pnpm": {
  "overrides": {
    "brace-expansion": "^2.0.2",
    "minimatch": "^9.0.5"
  }
}
```

This forces all subdependencies to use the latest non-deprecated versions.

## Testing Strategy

After any updates:

1. **Run Tests**
   ```bash
   pnpm test
   ```

2. **Check Linting**
   ```bash
   pnpm lint
   ```

3. **Build Check**
   ```bash
   pnpm build
   ```

4. **Local Development Test**
   ```bash
   pnpm dev
   ```

5. **Key Feature Testing**
   - Authentication flow
   - Payment processing (Stripe/PayPal)
   - Email sending
   - Database operations
   - File uploads

## Upgrade Order (Safest Approach)

1. Update overrides (already done)
2. Update Prisma ecosystem
3. Update development dependencies (types, eslint, jest)
4. Update minor/patch versions of production dependencies
5. Update major versions one at a time, testing after each

## Notes

- The `next-auth@5.0.0-beta.30` shows `4.24.13` as "latest" because v5 is still in beta
- Some outdated packages may be intentionally held back for compatibility
- Always test in a development environment before deploying
