import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
   const session = await auth(); 
   
   // Check if user is authenticated
   if (!session || !session.user) {
    redirect('/sign-in');
    return null; // This will never execute due to redirect
   }
   
   // Check if user has admin role
   if (session.user.role !== 'admin') {
    redirect('/unauthorized');
    return null; // This will never execute due to redirect
   }

   return session;
}

// Alternative function that throws error instead of redirecting
// Use this in API routes where redirects are not appropriate
export async function requireAdminApi() {
   const session = await auth(); 
   
   if (!session || !session.user) {
    throw new Error('Authentication required');
   }
   
   if (session.user.role !== 'admin') {
    throw new Error('Admin access required');
   }

   return session;
}
