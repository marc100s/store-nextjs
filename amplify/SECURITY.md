# Security Guide - Git and Amplify Best Practices

## 🔒 Sensitive Files Protection

### Files That Should NEVER Be Committed:

#### Environment Variables
- `.env`
- `.env.local`
- `.env.development`
- `.env.production` 
- `.env.staging`
- `amplify/.env.*` (any environment files in amplify folder)

#### AWS Credentials
- `.aws/credentials`
- `.aws/config`
- `aws-credentials`
- `aws-config`
- Any `*.pem`, `*.key`, `*.crt` files

#### API Keys and Secrets
- `stripe_*.json`
- `paypal_*.json`  
- `*-secret.json`
- `*-private-key.json`
- `credentials.json`
- `secrets.json`

#### Generated Amplify Files
- `amplify/#current-cloud-backend/`
- `amplify/.config/local-*`
- `amplify/backend/amplify-meta.json`
- `amplify/backend/.temp/`
- `amplify/logs/`
- `aws-exports.js`
- `awsconfiguration.json`

### Files That SHOULD Be Committed:

#### Configuration Templates
- `.env.example` ✅
- `amplify/.env.example` ✅
- `amplify.yml` ✅
- `amplify/.config/project-config.json` ✅

#### Non-Sensitive Amplify Config
- `amplify/team-provider-info.json` ✅ (contains app IDs, not secrets)
- `amplify/backend/backend-config.json` ✅
- `amplify/cli.json` ✅

## 🛡️ Security Verification Commands

### Before Pushing to Git:
```bash
# Check for accidentally staged sensitive files
git status

# Review what will be committed
git diff --cached

# Search for potential secrets in staged files
git diff --cached | grep -E "(SECRET|PASSWORD|API_KEY|PRIVATE)"

# Check if any env files are accidentally staged
git ls-files | grep -E "\\.env"
```

### Emergency: Remove Sensitive Data from Git History
```bash
# If you accidentally committed sensitive data:

# Remove file from latest commit (if not pushed yet)
git reset HEAD~1 --soft
git reset HEAD <sensitive-file>
git commit

# Remove from entire git history (DANGEROUS - use carefully)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch <sensitive-file>' \
  --prune-empty --tag-name-filter cat -- --all

# Force push (only if necessary and team is aware)
git push --force-with-lease
```

## 📋 Pre-Push Checklist

### Every Time Before `git push`:
- [ ] Run `git status` to check staged files
- [ ] Verify no `.env*` files are staged
- [ ] Check no `amplify/backend/amplify-meta.json` is staged
- [ ] Confirm no AWS credentials or API keys in code
- [ ] Review `git diff --cached` output
- [ ] Test that `.env.example` is up to date but contains no real values

### Weekly Security Review:
- [ ] Audit committed files for accidentally exposed secrets
- [ ] Check `.gitignore` is comprehensive and working
- [ ] Verify environment variables are properly set in Amplify Console
- [ ] Review access logs and usage patterns

## 🚨 What to Do If Secrets Are Exposed

### Immediate Actions (within 5 minutes):
1. **Rotate all exposed credentials immediately**
2. **Remove sensitive data from git history**
3. **Force push cleaned history (if safe to do so)**
4. **Notify team members**

### Follow-up Actions (within 24 hours):
1. **Update all affected services with new credentials**
2. **Monitor for unusual activity**
3. **Review and improve security practices**
4. **Update documentation**

## 🔍 Regular Security Audits

### Monthly Tasks:
```bash
# Search for potential secrets in codebase
grep -r -E "(api[_-]?key|password|secret|token)" . --exclude-dir=node_modules --exclude-dir=.git

# Check for hardcoded URLs or endpoints
grep -r -E "(https?://.*\.(com|org|net))" . --exclude-dir=node_modules --exclude-dir=.git

# Verify gitignore effectiveness
git check-ignore -v .env .env.local amplify/.env
```

### Tools to Consider:
- **git-secrets**: AWS tool to prevent committing secrets
- **pre-commit hooks**: Automated checks before commits
- **GitHub secret scanning**: Automatic detection of committed secrets

## 📚 Environment Variable Management

### Development Workflow:
1. **Copy template**: `cp amplify/.env.example .env.local`
2. **Fill with dev values**: Edit `.env.local` with development credentials
3. **Never commit**: Ensure `.env.local` stays in `.gitignore`
4. **Document changes**: Update `.env.example` when adding new variables (with dummy values)

### Production Deployment:
1. **Use Amplify Console**: Set environment variables through AWS console
2. **Verify in build logs**: Check variables are loaded (but values hidden)
3. **Test thoroughly**: Ensure all services work with production credentials
4. **Monitor**: Set up alerts for authentication failures

## ⚠️ Common Mistakes to Avoid

1. **Committing `.env` files** - Always double-check before pushing
2. **Hardcoding API keys in code** - Use environment variables always
3. **Sharing screenshot with secrets** - Blur sensitive information
4. **Using production keys in development** - Keep environments separate
5. **Ignoring AWS credential files** - These should never be committed

## 📞 Emergency Contacts

If you discover a security breach:
1. **AWS Support**: For compromised AWS credentials
2. **Stripe Support**: For exposed Stripe keys  
3. **PayPal Developer Support**: For PayPal credential issues
4. **Team Lead**: For internal security incident response

Remember: **When in doubt, treat it as sensitive and don't commit it!**