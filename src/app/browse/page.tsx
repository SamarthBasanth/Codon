import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseExplorer } from "@/components/browse-explorer";
import { getAllMethods } from "@/server/methods";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse verified methods",
  description:
    "Search and filter verified, reproducible computational-biology methods by field, organism, data type, language, and license.",
};

export default async function BrowsePage() {
  const methods = await getAllMethods();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
      }
    >
      <BrowseExplorer methods={methods} />
    </Suspense>
  );
}
