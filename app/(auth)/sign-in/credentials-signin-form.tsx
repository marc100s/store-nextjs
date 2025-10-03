"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signInDefaultValues, TEST_ACCOUNTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams } from "next/navigation";

const CredentialsSignInForm = () => {
  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const SignInButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} className="w-full" variant="default">
        {pending ? "Signin In ..." : "Sign In"}
      </Button>
    );
  };
  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            name="email"
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
          />
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            name="password"
            autoComplete="password"
            defaultValue={signInDefaultValues.password}
          />
        </div>
        <div>
          <SignInButton />
        </div>

        {data && !data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        
        {/* Development Test Credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
            <p className="text-xs font-medium text-muted-foreground mb-2">Development Test Accounts:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Admin: {TEST_ACCOUNTS.admin.email}</span>
                <Badge variant="outline" className="text-xs">Password: {TEST_ACCOUNTS.admin.password}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User: {TEST_ACCOUNTS.user.email}</span>
                <Badge variant="outline" className="text-xs">Password: {TEST_ACCOUNTS.user.password}</Badge>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" target="_self" className="link">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignInForm;
