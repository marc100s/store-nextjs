import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: Remove powered-by header
  poweredByHeader: false,
  
  // Compression for better performance
  compress: true,
  
  // Image optimization with security
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: '',
        pathname: '/**',
      },
      // Only allow specific image domains for security
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: '',
        pathname: '/**',
      }
    ],
    // Security: Limit image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Prevent large images
    minimumCacheTTL: 60,
  },
  
  // External packages for Amplify support  
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        // More permissive headers for Stripe payment pages
        source: '/order/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Permissions-Policy',
            value: 'payment=*, camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
        ],
      },
      {
        source: '/((?!order).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), bluetooth=()',
          },
        ],
      },
    ];
  },
  
  // Security: Disable X-Powered-By header
  generateEtags: false,
  
  // Performance and security optimizations
  // swcMinify is enabled by default in Next.js 13+
  
  // Only include necessary environment variables (removed sensitive ones)
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  },
  
  // Security: Configure redirects for common attack patterns
  async redirects() {
    return [
      {
        source: '/wp-admin/:path*',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/admin.php',
        destination: '/404', 
        permanent: true,
      },
      {
        source: '/.env',
        destination: '/404',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
