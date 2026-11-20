import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignUp() {
  return (
    <AuthShell title="Create your account." intro="An account lets you follow every report you make and message the case team privately. You can use a nickname.">
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
