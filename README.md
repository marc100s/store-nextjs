# 🛒 Store NextJS - Modern E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=flat-square&logo=postgresql)](https://neon.tech/)

A production-ready, full-featured e-commerce store built with Next.js 15, Prisma ORM, PostgreSQL, and deployed on AWS Amplify. Features enterprise-grade security, optimized performance, and modern payment integrations.

---

## ✨ Features

### 🛍️ Shopping Experience
- **Product Catalog** - Browse products with advanced filtering (category, price, rating)
- **Smart Search** - Real-time search with input sanitization and performance optimization
- **Shopping Cart** - Persistent cart across sessions with real-time updates
- **Product Reviews** - User reviews with verified purchase badges
- **Featured Products** - Highlight special offers and deals
- **Deal Countdown** - Time-limited promotional banners

### 💳 Payment & Checkout
- **Multiple Payment Methods** - PayPal, Stripe, Cash on Delivery
- **Secure Checkout** - Multi-step checkout with validation
- **Order Management** - Track orders, payment status, and delivery
- **Payment Receipts** - Automated email confirmations via Resend

### 🔐 Security & Authentication
- **NextAuth v5** - Secure credential-based authentication
- **Rate Limiting** - Protection against brute force and DDoS attacks
- **CSRF Protection** - Built-in security headers and middleware
- **Input Sanitization** - XSS and injection attack prevention
- **Secure Sessions** - Cryptographically secure session management
- **Password Security** - Bcrypt hashing with complexity requirements

### 👤 User Features
- **User Profiles** - Manage account information and settings
- **Order History** - View past orders and payment details
- **Saved Addresses** - Store shipping addresses for quick checkout
- **Payment Methods** - Save preferred payment options

### 🎛️ Admin Dashboard
- **Product Management** - CRUD operations for products
- **Order Management** - Process and track customer orders
- **User Management** - Admin user controls and roles
- **Analytics** - Sales and performance metrics
- **Image Upload** - Secure file upload via UploadThing

### ⚡ Performance & Optimization
- **Database Indexes** - Optimized queries for 50-70% faster performance
- **Image Optimization** - Next.js Image component with WebP/AVIF support
- **Code Splitting** - Automatic route-based code splitting
- **Pagination** - Secure pagination with input validation (max 100 items)
- **Connection Pooling** - Efficient database connection management
- **Caching** - Next.js ISR and client-side caching strategies

### 📱 UI/UX
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Mode Support** - Built-in theme switching
- **Modern UI** - shadcn/ui components with Tailwind CSS
- **Loading States** - Skeleton screens and loading indicators
- **Error Boundaries** - Graceful error handling
- **Accessibility** - ARIA labels and keyboard navigation

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives
- **[Lucide Icons](https://lucide.dev/)** - Icon library

### Backend
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Neon](https://neon.tech/)** - Serverless Postgres (AWS Amplify compatible)
- **[NextAuth.js v5](https://authjs.dev/)** - Authentication solution

### Payments
- **[Stripe](https://stripe.com/)** - Credit card payments
- **[PayPal](https://www.paypal.com/)** - PayPal payments
- Cash on Delivery support

### Infrastructure
- **[AWS Amplify](https://aws.amazon.com/amplify/)** - Hosting and deployment
- **[UploadThing](https://uploadthing.com/)** - File uploads
- **[Resend](https://resend.com/)** - Transactional emails
- **[Vercel Speed Insights](https://vercel.com/analytics)** - Performance monitoring

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Jest](https://jestjs.io/)** - Testing framework
- **[pnpm](https://pnpm.io/)** - Fast package manager

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** and **pnpm** installed
- **PostgreSQL database** (Neon recommended for serverless)
- **PayPal Developer Account** ([Sign up](https://developer.paypal.com/))
- **Stripe Account** ([Sign up](https://stripe.com/))
- **UploadThing Account** ([Sign up](https://uploadthing.com/))
- **Resend Account** ([Sign up](https://resend.com/))
- **AWS Amplify Account** (for deployment)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd store-nextjs
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="Prostore"
NEXT_PUBLIC_APP_DESCRIPTION="A modern store built with Next.js"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# Database (Get from Neon.tech)
DATABASE_URL="postgresql://user:pass@host/db"

# NextAuth (Generate: openssl rand -base64 32)
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_URL_INTERNAL="http://localhost:3000"

# Payment Methods
PAYMENT_METHODS="PayPal, Stripe, CashOnDelivery"
DEFAULT_PAYMENT_METHOD="PayPal"

# PayPal (Get from PayPal Developer Dashboard)
PAYPAL_CLIENT_ID="your_paypal_client_id"
PAYPAL_API_URL="https://api-m.sandbox.paypal.com"  # Use sandbox for dev
PAYPAL_APP_SECRET="your_paypal_secret"

# Stripe (Get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UploadThing (Get from UploadThing Dashboard)
UPLOADTHING_TOKEN="your_token"
UPLOADTHING_SECRET="your_secret"
UPLOADTHING_APPID="your_app_id"

# Resend (Get from Resend Dashboard)
RESEND_API_KEY="re_..."
SENDER_EMAIL="noreply@yourdomain.com"  # Must be verified
```

### 4. Database Setup

```bash
# Generate Prisma Client
pnpm prisma generate

# Push schema to database (creates tables and indexes)
pnpm prisma db push

# (Optional) Seed database with sample data
pnpm prisma db seed

# (Optional) Open Prisma Studio to view/edit data
pnpm prisma studio
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run with HTTPS (Optional)

For testing payment integrations locally:

```bash
pnpm dev:https
```

---

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm dev:https        # Start with HTTPS (for payment testing)

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma generate  # Generate Prisma Client
pnpm prisma db push   # Push schema changes
pnpm prisma studio    # Open database GUI
pnpm prisma migrate   # Create migrations

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode

# Code Quality
pnpm lint             # Run ESLint

# Email Development
pnpm email            # Preview email templates
```

---

## 🚀 Deployment to AWS Amplify

### Prerequisites
1. GitHub repository connected to AWS Amplify
2. All environment variables configured in Amplify Console
3. Database deployed (Neon recommended)

### Step-by-Step Deployment

#### 1. Connect Repository
- Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- Click "New app" → "Host web app"
- Connect your GitHub repository
- Select the branch to deploy (e.g., `main`)

#### 2. Configure Build Settings

Amplify will auto-detect Next.js. Verify build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

#### 3. Set Environment Variables

In Amplify Console → App settings → Environment variables, add:

```bash
NEXT_PUBLIC_APP_NAME=Your Store Name
NEXT_PUBLIC_APP_DESCRIPTION=Your description
NEXT_PUBLIC_SERVER_URL=https://your-app.amplifyapp.com

DATABASE_URL=your_neon_postgres_url

NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=https://your-app.amplifyapp.com
NEXTAUTH_URL_INTERNAL=https://your-app.amplifyapp.com

PAYMENT_METHODS=PayPal, Stripe, CashOnDelivery
DEFAULT_PAYMENT_METHOD=PayPal

# PayPal - Use PRODUCTION URLs!
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_API_URL=https://api-m.paypal.com
PAYPAL_APP_SECRET=your_live_secret

# Stripe - Use LIVE keys!
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

UPLOADTHING_TOKEN=your_token
UPLOADTHING_SECRET=your_secret
UPLOADTHING_APPID=your_app_id

RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@yourdomain.com
```

#### 4. Deploy

- Save environment variables
- Amplify will automatically trigger a deployment
- Monitor build logs for any issues
- Once deployed, test your application thoroughly

#### 5. Configure Custom Domain (Optional)

- App settings → Domain management
- Add your custom domain
- Update `NEXTAUTH_URL` to match your domain

### Post-Deployment Checklist

- ✅ Test user registration and login
- ✅ Test product browsing and search
- ✅ Test cart functionality
- ✅ Test PayPal payment flow
- ✅ Test Stripe payment flow
- ✅ Test email delivery
- ✅ Test image uploads
- ✅ Test admin dashboard
- ✅ Check security headers
- ✅ Monitor CloudWatch logs

---

## 🔒 Security Features

This application implements enterprise-grade security:

### Authentication & Authorization
- Secure session management with NextAuth
- Bcrypt password hashing
- CSRF protection
- Role-based access control (Admin/User)

### API Security
- Rate limiting (5-1000 req/min depending on endpoint)
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection through sanitization

### Headers & Network
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Permissions-Policy restrictions

### Data Protection
- Secure cookie configuration
- Environment variable isolation
- No sensitive data in logs
- Database connection encryption

**See [SECURITY.md](./SECURITY.md) for comprehensive security documentation.**

---

## 📊 Performance Optimizations

### Database
- ✅ Indexed columns for 50-70% faster queries
- ✅ Connection pooling for efficient resource usage
- ✅ Optimized Prisma queries
- ✅ Pagination limits (max 100 items per page)

### Frontend
- ✅ Next.js Image optimization (WebP/AVIF)
- ✅ Code splitting and lazy loading
- ✅ Priority loading for LCP images
- ✅ Client-side caching

### Backend
- ✅ Input sanitization (max 100 chars for searches)
- ✅ Query result caching
- ✅ Efficient JSON serialization

**See [OPTIMIZATIONS.md](./OPTIMIZATIONS.md) and [CODE_REVIEW_IMPROVEMENTS.md](./CODE_REVIEW_IMPROVEMENTS.md) for details.**

---

## 📁 Project Structure

```
store-nextjs/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (sign-in, sign-up)
│   ├── (root)/              # Public routes (home, products)
│   ├── admin/               # Admin dashboard
│   ├── user/                # User profile pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── shared/             # Shared components
│   └── ui/                 # UI primitives (shadcn)
├── lib/                     # Utility functions
│   ├── actions/            # Server actions
│   ├── constants/          # App constants
│   ├── validators.ts       # Zod schemas
│   ├── utils.ts            # Helpers
│   ├── rate-limit.ts       # Rate limiting
│   └── security-headers.ts # Security config
├── prisma/                  # Database
│   └── schema.prisma       # Database schema
├── public/                  # Static assets
├── types/                   # TypeScript types
├── tests/                   # Test files
├── .env.example            # Environment template
├── auth.ts                 # NextAuth config
├── middleware.ts           # Next.js middleware
├── next.config.ts          # Next.js config
└── tailwind.config.ts      # Tailwind config
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test tests/paypal.test.ts
```

### Test Coverage
- PayPal integration tests
- Payment flow validation
- API endpoint testing

**More tests coming soon!**

---

## 📚 Documentation

- **[SECURITY.md](./SECURITY.md)** - Security implementation and deployment checklist
- **[OPTIMIZATIONS.md](./OPTIMIZATIONS.md)** - Performance optimizations applied
- **[CODE_REVIEW_IMPROVEMENTS.md](./CODE_REVIEW_IMPROVEMENTS.md)** - Comprehensive improvement recommendations
- **[QUICK_START_IMPROVEMENTS.md](./QUICK_START_IMPROVEMENTS.md)** - Quick reference for recent improvements
- **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Stripe integration guide

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
pnpm prisma db push

# View database
pnpm prisma studio
```

### Build Failures
```bash
# Clear cache
rm -rf node_modules .next
pnpm install
pnpm build
```

### Prisma Issues
```bash
# Regenerate client
pnpm prisma generate

# Reset database (WARNING: deletes data)
pnpm prisma migrate reset
```

### Payment Issues
- Verify API keys are correct
- Check webhook URLs are configured
- Ensure using correct environment (sandbox vs. production)
- Check CloudWatch logs for errors

---

## 📊 Performance Metrics

### Target Metrics
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **API Response Time:** < 200ms (p95)
- **Database Query Time:** < 50ms (p95)

### Achieved Improvements
- Product queries: **50-70% faster** (with indexes)
- Category filtering: **60-80% faster**
- User/Order lookups: **40-60% faster**
- Cart operations: **30-50% faster**

---

## 🔮 Roadmap

### Short-term
- [ ] Add product wishlist functionality
- [ ] Implement product comparison
- [ ] Add advanced product filters
- [ ] Email notifications for order updates
- [ ] Admin analytics dashboard

### Medium-term
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Advanced search with Algolia
- [ ] Product recommendations
- [ ] Inventory management

### Long-term
- [ ] Internationalization (i18n)
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Seller marketplace features
- [ ] Advanced analytics and reporting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Neon](https://neon.tech/) - Serverless Postgres
- [Vercel](https://vercel.com/) - For amazing developer tools

---

## 📞 Support

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [AWS Amplify Documentation](https://docs.amplify.aws)
- [NextAuth.js Documentation](https://authjs.dev)

### Common Issues
- **"Can't connect to database"** - Check `DATABASE_URL` in environment variables
- **"Prisma client not found"** - Run `pnpm prisma generate`
- **"Payment failed"** - Verify API keys and webhook configuration
- **"Module not found"** - Clear cache and reinstall: `rm -rf node_modules && pnpm install`

---

## 📈 Project Stats

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **Deployment:** AWS Amplify
- **Package Manager:** pnpm
- **Code Quality:** ESLint + TypeScript strict mode
- **Testing:** Jest

---

<div align="center">

**Built with ❤️ using Next.js and modern web technologies**

⭐ Star this repo if you find it helpful!

</div>
