import { DefaultSession } from "next-auth";

declare module "next-auth" {
  export interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  export interface User {
    id: string;
    role: string;
    email: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  export interface JWT {
    id?: string;
    role?: string;
  }
}

declare module "@auth/core/adapters" {
  export interface AdapterUser {
    role: string;
  }
}
