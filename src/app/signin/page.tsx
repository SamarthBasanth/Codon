import type { Metadata } from "next";
import { SignIn } from "@/components/auth/sign-in";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Codon — access verified methods, licenses, and your archive.",
};

export default function SignInPage() {
  return <SignIn />;
}
