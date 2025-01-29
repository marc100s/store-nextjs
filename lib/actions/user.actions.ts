'use server';

import { signInFormSchema } from "../validators";
import {signIn, signOut} from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

// Sign in user with credentials

export async function signInWithCredentials(prevState: unknown, fomrData: FormData) {
    try {
        const user = signInFormSchema.parse({
            email: fomrData.get('email'),
            password: fomrData.get('password'),
        });

        await signIn("credentials", user);

        return { success: true, message: "User signed in successfully" };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return { success: false, message: "Invalid email or password" };
    }
}

// Sign user out

export async function signOutUser() {
    await signOut();
}