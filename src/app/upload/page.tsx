import type { Metadata } from "next";
import { UploadWizard } from "@/components/upload-wizard";

export const metadata: Metadata = {
  title: "List a method",
  description:
    "Upload the artifact behind your computational method. Codon containerizes, verifies, and publishes it with a citable reproducibility stamp.",
};

// Verification executes the method in an E2B sandbox server-side — give the
// server action room beyond the default function timeout.
export const maxDuration = 60;

export default function UploadPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <UploadWizard />
    </div>
  );
}
