"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Check, Loader2, TriangleAlert } from "lucide-react";
import { updateMyProfile, type Profile } from "@/server/profile-actions";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn, initialsOf } from "@/lib/utils";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-subtle">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "rounded-lg border border-input bg-surface px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";

export function ProfileEditor({ initial }: { initial: Profile }) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [role, setRole] = useState(initial.role);
  const [affiliation, setAffiliation] = useState(initial.affiliation);
  const [website, setWebsite] = useState(initial.website);
  const [orcid, setOrcid] = useState(initial.orcid);
  const [about, setAbout] = useState(initial.about);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await updateMyProfile({ displayName, role, affiliation, website, orcid, about });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2800);
      } else {
        setError(res.error ?? "Could not save your profile.");
      }
    });
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <Link
        href="/dashboard/seller"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {/* Identity header */}
      <div className="flex items-center gap-4">
        <Avatar initials={initialsOf(displayName, initial.email)} size="xl" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {displayName.trim() || "Your profile"}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{initial.email}</p>
          {initial.joinedAt && (
            <p className="mt-0.5 text-xs text-subtle">
              Member since{" "}
              {new Date(initial.joinedAt).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display name">
            <input
              className={inputCls}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. your full name"
              maxLength={80}
            />
          </Field>
          <Field label="Role / title">
            <input
              className={inputCls}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Computational biologist"
              maxLength={80}
            />
          </Field>
          <Field label="Affiliation" hint="Lab, institution, or company">
            <input
              className={inputCls}
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="e.g. your institution"
              maxLength={120}
            />
          </Field>
          <Field label="ORCID" hint="optional">
            <input
              className={cn(inputCls, "font-mono")}
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              placeholder="0000-0000-0000-0000"
              maxLength={40}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Website" hint="optional">
              <input
                className={inputCls}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="lab.example.edu"
                maxLength={200}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="About" hint={`${about.length}/700`}>
              <textarea
                className={cn(inputCls, "min-h-28 resize-y")}
                value={about}
                onChange={(e) => setAbout(e.target.value.slice(0, 700))}
                placeholder="What you work on, the methods you publish, and how others can reach you."
              />
            </Field>
          </div>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants(), "min-w-36")}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <BadgeCheck className="h-4 w-4" />
              Save profile
            </>
          )}
        </button>
        <span className="text-xs text-subtle">
          Your profile appears on your dashboard and on methods you publish.
        </span>
      </div>
    </form>
  );
}
