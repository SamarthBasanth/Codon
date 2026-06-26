"use client";

import { useState, useTransition } from "react";
import { Check, KeyRound, Loader2 } from "lucide-react";
import { licenseMethod } from "@/server/license-actions";
import { Button } from "./ui/button";

export function LicenseButton({
  slug,
  title,
  codonId,
  licensed = false,
}: {
  slug: string;
  title: string;
  codonId: string;
  licensed?: boolean;
}) {
  const [done, setDone] = useState(licensed);
  const [pending, start] = useTransition();

  return (
    <Button
      variant="secondary"
      className="w-full"
      disabled={pending || done}
      onClick={() =>
        start(async () => {
          const res = await licenseMethod(slug, title, codonId);
          if (res.ok) setDone(true);
        })
      }
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding to library…
        </>
      ) : done ? (
        <>
          <Check className="h-4 w-4" />
          In your library
        </>
      ) : (
        <>
          <KeyRound className="h-4 w-4" />
          License (free)
        </>
      )}
    </Button>
  );
}
