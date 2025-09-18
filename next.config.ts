import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for AWS Amplify SSR support
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: '',
      },
    ]
  }, 
};

export default nextConfig;
