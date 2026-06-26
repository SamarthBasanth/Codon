import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <SearchX className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="mt-2 text-muted-foreground">
        That method, lab, or institution doesn&apos;t exist — or hasn&apos;t been verified yet.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <Link href="/browse" className={cn(buttonVariants())}>
          Browse methods
        </Link>
      </div>
    </div>
  );
}
