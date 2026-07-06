import type { Metadata } from "next";
import { getAllMethods } from "@/server/methods";
import { ReproduceSearch } from "@/components/reproduce-search";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reproduce a paper's method",
  description:
    "Paste a paper or method and Codon finds the verified, runnable version — reproduce its result in a sealed sandbox, then license it. The methods behind the science, actually available.",
};

export default async function ReproducePage() {
  const methods = await getAllMethods();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="brand" className="mb-4">
            The methods behind the paper — runnable
          </Badge>
          <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Does this paper actually <span className="text-brand">reproduce</span>?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance">
            Too many published methods can&apos;t be found, run, or trusted. Paste a paper or method
            and Codon finds the verified version — reproduce its result in your browser, then license
            it into your own pipeline.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="mx-auto mt-10 max-w-3xl">
          <ReproduceSearch methods={methods} />
        </div>
      </Reveal>
    </div>
  );
}
