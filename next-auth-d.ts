import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  // Add role to the User object
  interface User {
    name?: string | null | undefined;
    role?: string;
  }

  interface JWT {
    role?: string;
  }

  interface Session {
    user: {
      role?: string;
      name?: string | null;
      email?: string | null;
      id?: string | null;
    };
    role?: string;
  }
}