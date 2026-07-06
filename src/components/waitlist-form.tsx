"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { joinWaitlist } from "@/server/waitlist-actions";
import { cn } from "@/lib/utils";

const ROLES = [
  "Author / researcher",
  "Reviewer",
  "Editor / journal",
  "Publisher",
  "Funder / institution",
  "AI / ML lab",
  "Other",
];

const MAILTO =
  "mailto:samarthbasanth@gmail.com?subject=Codon%20Preflight%20—%20early%20access";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [useCase, setUseCase] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    const res = await joinWaitlist({ email, name, role, organization, useCase });
    if (res.ok) {
      setState("done");
      return;
    }
    setState("error");
    setMessage(
      res.error === "invalid"
        ? "That email doesn't look right — mind checking it?"
        : "We couldn't save that just now. Email us directly and we'll add you.",
    );
  }

  if (state === "done") {
    return (
      <div className="animate-fade-up rounded-2xl border border-success/30 bg-success-muted/60 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-serif text-2xl tracking-tight">You&apos;re on the list.</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks — we&apos;ll reach out as we open Preflight to authors, reviewers, and journals.
          Watch your inbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-6 elevate-2 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Work email <span className="text-danger">*</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@journal.org"
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Jane Okafor"
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">You are a…</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select…</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Journal / lab / institution
          </span>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Where do you publish or review?"
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            What would you want Preflight to catch? <span className="text-subtle">(optional)</span>
          </span>
          <textarea
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            rows={3}
            placeholder="e.g. citation integrity + figure duplication at submission"
            className="w-full resize-y rounded-lg border border-input bg-surface px-3 py-2.5 text-sm placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      {state === "error" && (
        <p className="mt-4 text-sm text-danger">
          {message}{" "}
          <a href={MAILTO} className="font-medium underline underline-offset-2">
            Email us
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className={cn(
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition-all hover:bg-brand-strong active:translate-y-px disabled:opacity-60 sm:w-auto",
        )}
      >
        {state === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Joining…
          </>
        ) : (
          <>
            Request early access
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-3 text-xs text-subtle">
        No spam. We&apos;ll only email you about Preflight access.
      </p>
    </form>
  );
}
