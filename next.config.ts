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
  // Add external packages for better Amplify support  
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Ensure environment variables are available
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_TRUST_HOST: 'true',
  }
};

export default nextConfig;
