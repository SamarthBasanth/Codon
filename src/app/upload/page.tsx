import type { Metadata } from "next";
import { Boxes, ScanLine, Stamp } from "lucide-react";
import { UploadWizard } from "@/components/upload-wizard";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "List a method",
  description:
    "Upload the artifact behind your computational method. Codon containerizes, verifies, and publishes it with a citable reproducibility stamp.",
};

// Verification executes the method in an E2B sandbox server-side — give the
// server action room beyond the default function timeout.
export const maxDuration = 60;

const STEPS = [
  { icon: Boxes, t: "1 · Upload", d: "Your code, plus one sample input and its expected output." },
  { icon: ScanLine, t: "2 · Codon verifies", d: "We run it in a sealed sandbox and diff the output — no network egress." },
  { icon: Stamp, t: "3 · You're listed", d: "Published with a citable Codon ID and a live, licensable badge." },
];

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            List a verified method
          </h1>
          <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">
            Make your method one of the tools people can actually find, run, and license. It takes a
            file and one sample input/output — Codon does the rest.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} index={i}>
                <div className="h-full rounded-xl border border-border bg-card p-4 elevate-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <s.icon className="h-4.5 w-4.5" />
                  </span>
                  <p className="mt-2.5 text-sm font-semibold">{s.t}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
      <UploadWizard />
    </div>
  );
}
