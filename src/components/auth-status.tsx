"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { currentUser, signOut } from "@/server/auth-actions";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export function AuthStatus() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    currentUser().then((u) => {
      if (active) setEmail(u?.email ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  if (email === undefined) {
    return <span className="hidden h-8 w-16 animate-pulse rounded-md bg-muted sm:block" />;
  }

  if (!email) {
    return (
      <Link
        href="/signin"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/profile"
        className="max-w-[11rem] truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
        title={`${email} — view profile`}
      >
        {email}
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await signOut();
            window.location.href = "/";
          })
        }
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </div>
  );
}
