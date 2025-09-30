# Stripe Payment Setup Guide

## Current Issue Fix

The Stripe payment button wasn't working due to permissions policy restrictions. I've updated the following files:

### 1. Fixed Permissions Policy (`/lib/security-headers.ts`)
- Changed `payment=()` to `payment=*` in development mode
- Special handling for Stripe payment pages with `payment=(self "https://*.stripe.com")`

### 2. Updated Next.js Config (`next.config.ts`)
- Added Permissions-Policy headers to allow payment API
- Special route configuration for Stripe payment pages

### 3. Updated Middleware (`middleware.ts`)
- Now passes pathname to security headers for route-specific policies

## Testing the Fix

### ✅ **HTTPS Development Server Setup Complete!**

Your development server is now running with HTTPS at **https://localhost:3000**. This resolves the Stripe Payment Request API permissions policy violations.

### **How to Use:**

1. **For Stripe payments (HTTPS required):**
   ```bash
   pnpm run dev:https
   ```
   - Access at: **https://localhost:3000**
   - Stripe payment buttons will work correctly
   - No more permissions policy violations

2. **For regular development (HTTP):**
   ```bash
   pnpm run dev
   ```
   - Access at: http://localhost:3000
   - Use this for general development without payments

### **Testing Stripe Payments:**

1. **Visit https://localhost:3000** (note the HTTPS)
2. **Clear browser cache and cookies** if you had previous HTTP sessions
3. **Complete checkout flow:**
   - Add items to cart
   - Fill shipping address
   - Select payment method
   - Place order
   - **Stripe payment button should now work!** ✨

## HTTPS Setup for Production-like Testing (Optional)

If you want to test with HTTPS locally (like production), you can use:

### Option 1: Using mkcert (Recommended)

```bash
# Install mkcert
brew install mkcert

# Install local CA
mkcert -install

# Create certificates for localhost
mkcert localhost 127.0.0.1 ::1

# Update your package.json dev script
"dev": "next dev --experimental-https --experimental-https-key ./localhost+2-key.pem --experimental-https-cert ./localhost+2.pem"
```

### Option 2: Using ngrok
```bash
# Install ngrok
npm install -g ngrok

# In terminal 1, start your dev server
pnpm run dev

# In terminal 2, create HTTPS tunnel
ngrok http 3000
```

## Stripe Configuration

Make sure you have these environment variables set in your `.env`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Your test publishable key
STRIPE_SECRET_KEY="sk_test_..." # Your test secret key
STRIPE_WEBHOOK_SECRET="whsec_..." # Your webhook secret (if using webhooks)
```

## Security Notes

- **Development**: Payment API is allowed with `payment=*` for easier testing
- **Production**: Restricted to `payment=(self "https://*.stripe.com")` for security
- **CSP**: Allows Stripe domains for scripts, styles, and connections

## Troubleshooting

If you still see payment policy violations:

1. **Check browser console** for specific error messages
2. **Verify environment variables** are loaded correctly
3. **Test with different browsers** (Chrome, Firefox, Safari)
4. **Disable browser extensions** that might block payment APIs
5. **Check Network tab** for failed requests to Stripe

## Browser Compatibility

The Payment Request API (used by Stripe) is supported in:
- Chrome 61+
- Firefox 55+
- Safari 11.1+
- Edge 79+

## Production Deployment

When deploying to production (AWS Amplify):

1. **Set environment variables** in Amplify console
2. **Update NEXTAUTH_URL** to your production domain
3. **Update Stripe webhook endpoints** to your production domain
4. **Test with Stripe test cards** before going live