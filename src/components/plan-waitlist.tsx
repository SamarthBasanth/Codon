"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { joinWaitlist } from "@/server/waitlist-actions";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";

const PLANS = ["Lab / Team", "Enterprise", "Just exploring"] as const;
const MAILTO = "mailto:samarthbasanth@gmail.com?subject=Codon%20—%20paid%20plan%20interest";

const selectCls =
  "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function PlanWaitlist({ defaultPlan = PLANS[0] }: { defaultPlan?: string }) {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<string>(defaultPlan);
  const [organization, setOrganization] = useState("");
  const [useCase, setUseCase] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    const res = await joinWaitlist({ email, organization, useCase, source: `pricing:${plan}` });
    if (res.ok) {
      setState("done");
      return;
    }
    setState("error");
    setMessage(
      res.error === "invalid"
        ? "That email doesn't look right — mind checking it?"
        : "We couldn't save that just now. Email us and we'll add you.",
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-success/30 bg-success-muted/50 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-xl font-semibold tracking-tight">You&apos;re on the list.</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks — we&apos;ll reach out as paid plans open. The core stays free either way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Work email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@lab.org"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Which plan?</label>
          <select className={selectCls} value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLANS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Organization <span className="font-normal text-subtle">— optional</span>
        </label>
        <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Lab, company, or journal" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          What would you verify? <span className="font-normal text-subtle">— optional, helps us prioritize</span>
        </label>
        <Textarea
          rows={3}
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="e.g. verify external methods before we train on them; screen submissions before review…"
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-danger">
          {message}{" "}
          <a href={MAILTO} className="underline">
            Email us
          </a>
          .
        </p>
      )}

      <Button type="submit" disabled={state === "loading"} className="w-full sm:w-auto">
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        Join the waitlist
      </Button>
      <p className="text-xs text-subtle">
        We&apos;ll only email you about early access. The free core needs no account to try.
      </p>
    </form>
  );
}
