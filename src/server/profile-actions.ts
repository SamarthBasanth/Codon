"use server";

import { getSessionUser } from "./session";
import { supabaseAdmin } from "./supabase";

/**
 * User profiles are stored in Supabase Auth `user_metadata` (no extra table /
 * migration). OAuth sign-ins (Google/GitHub) pre-populate provider fields like
 * `name`, `full_name`, and `avatar_url`, which we read as sensible defaults and
 * merge with the user-edited fields so we never clobber them.
 */
export interface Profile {
  email: string;
  displayName: string;
  role: string;
  affiliation: string;
  about: string;
  website: string;
  orcid: string;
  avatarUrl: string;
  joinedAt: string;
}

export interface ProfileInput {
  displayName: string;
  role: string;
  affiliation: string;
  about: string;
  website: string;
  orcid: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

async function readMetadata(userId: string): Promise<{ meta: Record<string, unknown>; joinedAt: string }> {
  try {
    const { data } = await supabaseAdmin().auth.admin.getUserById(userId);
    return {
      meta: (data?.user?.user_metadata ?? {}) as Record<string, unknown>,
      joinedAt: data?.user?.created_at ?? "",
    };
  } catch {
    return { meta: {}, joinedAt: "" };
  }
}

/** The signed-in user's profile, or null if not signed in. */
export async function getMyProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const { meta, joinedAt } = await readMetadata(user.id);
  return {
    email: user.email,
    displayName:
      str(meta.displayName) || str(meta.full_name) || str(meta.name) || str(meta.user_name),
    role: str(meta.role),
    affiliation: str(meta.affiliation),
    about: str(meta.about),
    website: str(meta.website),
    orcid: str(meta.orcid),
    avatarUrl: str(meta.avatar_url),
    joinedAt,
  };
}

/** Normalize free-typed input into a safe http(s) URL, or "" if implausible. */
function normalizeWebsite(raw: string): string {
  let w = raw.trim();
  if (!w) return "";
  if (!/^https?:\/\//i.test(w)) w = "https://" + w;
  return /^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(w) ? w : "";
}

/** Save edits to the signed-in user's profile (merged into user_metadata). */
export async function updateMyProfile(input: ProfileInput): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "You must be signed in to edit your profile." };

  const { meta } = await readMetadata(user.id);
  const { error } = await supabaseAdmin().auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...meta,
      displayName: input.displayName.trim().slice(0, 80),
      role: input.role.trim().slice(0, 80),
      affiliation: input.affiliation.trim().slice(0, 120),
      about: input.about.trim().slice(0, 700),
      website: normalizeWebsite(input.website),
      orcid: input.orcid.trim().slice(0, 40),
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
