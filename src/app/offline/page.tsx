import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="mt-3 text-muted-foreground">
        Codon can&apos;t reach the network right now. Pages you&apos;ve already opened still work — including the{" "}
        <Link href="/demo" className="text-brand hover:underline">
          live demo
        </Link>
        , which runs entirely in your browser.
      </p>
    </main>
  );
}
