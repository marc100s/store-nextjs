# Amplify Deployment & Maintenance Guide

## Pre-Deployment Checklist

### 1. Service Role Setup ✅
- [x] Created `AmplifyServiceRole` with proper permissions
- [x] Attached role to Amplify app in console
- [x] Verified role has CloudFormation, S3, Lambda access

### 2. Environment Variables Setup
- [ ] All required environment variables set in Amplify Console
- [ ] Database connection string configured
- [ ] API keys (Stripe, PayPal, etc.) added
- [ ] NextAuth configuration completed

### 3. Build Configuration
- [x] `amplify.yml` optimized for Next.js
- [x] `project-config.json` updated for Next.js framework
- [x] Prisma generation included in build process
- [x] Security headers configured

## Deployment Commands

### Initial Setup
```bash
# Initialize Amplify (if not already done)
amplify configure
amplify init

# Add hosting
amplify add hosting
amplify publish
```

### Regular Deployments
```bash
# Deploy to current environment
amplify publish

# Deploy specific branch
amplify publish --environment dev

# Force rebuild
amplify publish --invalidateCloudFront
```

## Environment Management

### Create New Environment
```bash
# Create staging environment
amplify env add staging

# Switch to environment
amplify env checkout staging

# List all environments
amplify env list
```

### Branch-Based Deployments
- `main` branch → Production environment
- `dev` branch → Development environment
- Feature branches → Preview deployments

## Monitoring & Troubleshooting

### Build Logs
1. Go to Amplify Console
2. Select your app
3. Click on build history
4. View detailed logs for each phase

### Common Issues & Solutions

#### Build Failures
```bash
# Check Node.js version compatibility
# Update amplify.yml if needed:
# runtime:
#   version: '18'  # or latest LTS
```

#### Environment Variable Issues
```bash
# Verify variables in Amplify Console
# Check variable names match exactly
# Ensure no trailing spaces
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL format
# Check network access from Amplify
# Test connection with staging database first
```

### Performance Optimization

#### Caching Strategy
```yaml
# In amplify.yml
cache:
  paths:
    - node_modules/**/*
    - .next/cache/**/*
    - ~/.npm/**/*
    - ~/.cache/**/*
```

#### Build Time Optimization
- Use `npm ci` instead of `npm install`
- Enable dependency caching
- Minimize build artifacts

## Security Configuration

### Headers (Already configured in amplify.yml)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Additional Security Measures
1. Enable HTTPS redirect
2. Configure CSP headers
3. Set up WAF rules (if needed)
4. Enable access logging

## Maintenance Tasks

### Weekly Tasks
- [ ] Check build success rate
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Update dependencies (if needed)

### Monthly Tasks
- [ ] Review and rotate API keys
- [ ] Update Amplify CLI to latest version
- [ ] Check for security updates
- [ ] Review cost optimization

### Quarterly Tasks
- [ ] Audit IAM permissions
- [ ] Review backup strategies
- [ ] Update documentation
- [ ] Performance optimization review

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous deployment
# Through Amplify Console:
# 1. Go to App → Hosting → Build history
# 2. Find successful build
# 3. Click "Redeploy this version"
```

### Emergency Procedures
1. **Immediate**: Disable problematic branch in console
2. **Short-term**: Revert to last known good commit
3. **Investigation**: Check logs and identify root cause
4. **Resolution**: Fix issue and redeploy

## Cost Optimization

### Current Usage Monitoring
- Build minutes consumed
- Data transfer costs  
- Storage usage

### Optimization Strategies
- Use build caching effectively
- Minimize unnecessary rebuilds
- Configure branch auto-deletion
- Monitor and clean up old deployments

## Backup & Recovery

### Configuration Backup
```bash
# Export current configuration
amplify export --environment production

# Store configuration in version control
# (excluding sensitive data)
```

### Database Backup Strategy
- Automated daily backups
- Point-in-time recovery available
- Cross-region backup replication (for production)

## Support & Documentation

### AWS Amplify Resources
- [Official Documentation](https://docs.amplify.aws/)
- [Troubleshooting Guide](https://docs.amplify.aws/gen1/javascript/tools/cli/troubleshooting/)
- [GitHub Issues](https://github.com/aws-amplify/amplify-cli/issues)

### Internal Documentation
- Environment setup guide: `environment-setup.md`
- Service role configuration files in `/amplify` folder
- Build configuration: `amplify.yml`