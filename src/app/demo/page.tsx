import type { Metadata } from "next";
import { ProductWalkthrough } from "@/components/product-walkthrough";

export const metadata: Metadata = {
  title: "See it work",
  description:
    "Watch Codon reproduce and stamp a real scientific method in a sealed sandbox — then run one yourself, in your browser, no sign-up.",
};

export default function DemoPage() {
  return <ProductWalkthrough />;
}
