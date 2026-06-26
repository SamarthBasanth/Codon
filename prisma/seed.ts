// Phase-2 seed: maps the current in-memory dataset into the real database.
// Run after the DB is live: `prisma migrate dev` then `prisma db seed`.
// (Excluded from the app type-check until @prisma/client is generated.)

import { PrismaClient } from "@prisma/client";
import { allMethods, institutions, sellers } from "../src/lib/mockData";

const db = new PrismaClient();

const INST_KIND = {
  University: "UNIVERSITY",
  "Research Institute": "RESEARCH_INSTITUTE",
  "Medical Center": "MEDICAL_CENTER",
  Company: "COMPANY",
} as const;

const SELLER_TYPE = { lab: "LAB", individual: "INDIVIDUAL", institution: "INSTITUTION" } as const;
const METHOD_STATUS = { published: "PUBLISHED", verifying: "VERIFYING", draft: "DRAFT" } as const;
const VERIFY_STATUS = {
  verified: "VERIFIED",
  "external-dep": "EXTERNAL_DEP",
  pending: "PENDING",
  failed: "FAILED",
  unverified: "UNVERIFIED",
} as const;
const LICENSE_TYPE = { open: "OPEN", dual: "DUAL", commercial: "COMMERCIAL", sponsored: "SPONSORED" } as const;
const PRICING_MODEL = { free: "FREE", dual: "DUAL", paid: "PAID", sponsored: "SPONSORED" } as const;
const TOOL_KIND = { proprietary: "PROPRIETARY", open: "OPEN", runtime: "RUNTIME", gpu: "GPU" } as const;

async function main() {
  for (const inst of institutions) {
    await db.institution.create({
      data: {
        id: inst.id,
        slug: inst.slug,
        name: inst.name,
        short: inst.short,
        kind: INST_KIND[inst.kind],
        location: inst.location,
        website: inst.website,
        accent: inst.accent,
        blurb: inst.blurb,
        verified: inst.verified,
      },
    });
  }

  for (const s of sellers) {
    const owner = await db.user.create({
      data: {
        email: `${s.slug}@codon.science`,
        name: s.pi,
        role: s.type === "institution" ? "INSTITUTION_ADMIN" : "LAB_MEMBER",
        orcid: s.orcid,
        orcidVerified: true,
        emailVerified: true,
        avatar: s.avatar,
        bio: s.bio,
      },
    });
    await db.lab.create({
      data: {
        id: s.id,
        slug: s.slug,
        name: s.name,
        type: SELLER_TYPE[s.type],
        pi: s.pi,
        orcid: s.orcid,
        bio: s.bio,
        location: s.location,
        verified: s.verified,
        institutionId: s.institutionId,
        memberships: { create: { userId: owner.id, role: "PI" } },
      },
    });
  }

  for (const m of allMethods) {
    const v = m.verification;
    const method = await db.method.create({
      data: {
        id: m.id,
        slug: m.slug,
        title: m.title,
        summary: m.summary,
        description: m.description.join("\n\n"),
        readme: m.readme,
        fields: m.fields,
        organisms: m.organisms,
        dataTypes: m.dataTypes,
        language: m.language,
        status: METHOD_STATUS[m.status],
        paperDoi: m.paperDoi,
        paperTitle: m.paperTitle,
        codonId: m.codonId,
        featured: m.featured,
        labId: m.sellerId,
        institutionId: m.institutionId,
        license: {
          create: {
            type: LICENSE_TYPE[m.license.type],
            spdx: m.license.spdx,
            name: m.license.name,
            terms: m.license.terms,
          },
        },
        pricing: {
          create: {
            model: PRICING_MODEL[m.pricing.model],
            currency: m.pricing.currency,
            commercialAmount: m.pricing.commercialAmount,
            amount: m.pricing.amount,
            runAmount: m.pricing.runAmount,
            unit: m.pricing.unit,
            sponsoredBy: m.pricing.sponsoredBy,
          },
        },
        usage: {
          create: {
            runs: m.stats.runs,
            downloads: m.stats.downloads,
            stars: m.stats.stars,
            citations: m.stats.citations,
          },
        },
        externalTools: {
          create: m.externalTools.map((t) => ({
            name: t.name,
            version: t.version,
            kind: TOOL_KIND[t.kind],
            licenseNote: t.licenseNote,
          })),
        },
        reviews: {
          create: m.reviews.map((r) => ({
            authorName: r.author,
            affiliation: r.affiliation,
            rating: r.rating,
            body: r.body,
          })),
        },
      },
    });

    const version = await db.methodVersion.create({
      data: {
        methodId: method.id,
        semver: m.version,
        verificationStatus: VERIFY_STATUS[v.status],
        imageDigest: v.imageDigest,
        inputHash: v.inputHash,
        expectedOutputHash: v.expectedOutputHash,
        verificationRuns: {
          create: {
            status: VERIFY_STATUS[v.status],
            verifierVersion: v.verifierVersion,
            baseImage: v.baseImage,
            imageDigest: v.imageDigest,
            inputHash: v.inputHash,
            expectedHash: v.expectedOutputHash,
            actualHash: v.actualOutputHash,
            toleranceProfile: v.toleranceProfile,
            runExitCode: v.runExitCode,
            runWallSec: v.runWallSec,
            peakMemoryMb: v.peakMemoryMb,
            buildLog: v.buildSteps,
            diff: v.diff,
            resourceLimits: v.resourceLimits,
            notes: v.notes,
          },
        },
      },
    });

    await db.method.update({
      where: { id: method.id },
      data: { currentVersionId: version.id },
    });
  }

  console.log(
    `Seeded ${institutions.length} institutions, ${sellers.length} sellers, ${allMethods.length} methods.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
