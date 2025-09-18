import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone output for AWS Amplify compatibility
  // output: "standalone", 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: '',
      },
    ]
  },
  // Add experimental features for better Amplify support
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  // Ensure environment variables are available
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  }
};

export default nextConfig;
