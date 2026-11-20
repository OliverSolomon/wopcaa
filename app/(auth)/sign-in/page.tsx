import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignIn() {
  return (
    <AuthShell title="Welcome back." intro="Sign in to follow your reports, or to open the staff dashboard.">
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
