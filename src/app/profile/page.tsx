import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/server/profile-actions";
import { ProfileEditor } from "@/components/profile-editor";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Create and edit your Codon profile.",
};

export default async function ProfilePage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/signin?next=/profile");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <ProfileEditor initial={profile} />
    </div>
  );
}
