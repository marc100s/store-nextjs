# Amplify Environment Configuration Guide

## Environment Variables Setup

### 1. Development Environment
Environment variables for local development and dev branch:

```bash
# Copy the example file
cp .env.example .env.local

# Edit the .env.local file with your development values
```

### 2. Production Environment
Set these environment variables in the Amplify Console:

1. Go to AWS Amplify Console
2. Select your app → Environment variables
3. Add the following variables:

#### Required Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth secret key | `your-secret-key` |
| `NEXTAUTH_URL` | Application URL | `https://yourapp.amplifyapp.com` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

#### Optional Environment Variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PAYPAL_CLIENT_ID` | PayPal client ID | - |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | - |
| `UPLOADTHING_SECRET` | UploadThing secret | - |
| `UPLOADTHING_APP_ID` | UploadThing app ID | - |
| `RESEND_API_KEY` | Resend email API key | - |
| `NEXT_PUBLIC_APP_NAME` | Application name | `ProStore` |
| `NODE_ENV` | Environment type | `production` |

## Branch-Specific Configuration

### Development Branch (dev)
- Use test/sandbox API keys
- Point to development database
- Enable debug logging

### Production Branch (main)
- Use production API keys
- Point to production database
- Disable debug features

## Security Considerations

1. **Never commit sensitive environment variables to git**
2. **Use different API keys for different environments**
3. **Rotate secrets regularly**
4. **Use Amplify's built-in environment variable encryption**

## Environment Variable Priority

1. Amplify Console Environment Variables (highest)
2. amplify.yml environment section
3. .env.local (local development only)
4. Default values in code (lowest)

## Validation

Add this to your build process to validate required environment variables:

```bash
# In amplify.yml preBuild phase
- |
  if [ -z "$DATABASE_URL" ] || [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Required environment variables are missing"
    exit 1
  fi
  echo "✅ Environment variables validated"
```