/* ============================================================================
   Codon — catalog data layer

   Real-only catalog. Every entry here is either a genuine, runnable reference
   sample authored by Codon (pure-Python, executed and reproduced) or a real
   library method executed in the E2B sandbox. There are no invented
   researchers, institutions, DOIs, reviews, or usage numbers — a verification
   product cannot ship a fabricated catalog. User-submitted methods are layered
   on top at request time by the server data layer (`src/server/methods.ts`).
============================================================================ */

export type VerificationStatus =
  | "verified"
  | "external-dep"
  | "pending"
  | "failed"
  | "unverified";

export type LicenseType = "open" | "dual" | "commercial" | "sponsored";
export type PricingModel = "free" | "dual" | "paid" | "sponsored";
export type MethodStatus = "published" | "verifying" | "draft";
export type SellerType = "lab" | "individual" | "institution";

export interface Institution {
  id: string;
  slug: string;
  name: string;
  short: string;
  kind: "University" | "Research Institute" | "Medical Center" | "Company";
  location: string;
  verified: boolean;
  blurb: string;
  website: string;
  accent: string; // hex for branded page header
  joinedAt: string;
}

export interface Seller {
  id: string;
  slug: string;
  name: string;
  type: SellerType;
  pi: string;
  orcid: string;
  institutionId: string;
  verified: boolean;
  avatar: string; // initials
  bio: string;
  location: string;
  fields: string[];
  links: { label: string; href: string }[];
  joinedAt: string;
}

export interface ExternalTool {
  name: string;
  version: string;
  kind: "proprietary" | "open" | "runtime" | "gpu";
  licenseNote: string;
}

export interface FileNode {
  name: string;
  kind: "dir" | "file";
  fileType?: "code" | "env" | "data" | "doc" | "config";
  size?: string;
  children?: FileNode[];
}

export interface DiffEntry {
  name: string;
  kind: "exact" | "numeric" | "structural" | "checksum";
  status: "match" | "mismatch";
  detail: string;
  tolerance?: string;
}

export interface BuildStep {
  label: string;
  status: "ok" | "skip" | "fail";
  durationSec: number;
}

export interface Verification {
  id: string;
  status: VerificationStatus;
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  verifierVersion: string;
  baseImage: string;
  imageDigest: string;
  inputHash: string;
  expectedOutputHash: string;
  actualOutputHash: string;
  toleranceProfile: string;
  runExitCode: number;
  runWallSec: number;
  peakMemoryMb: number;
  buildSteps: BuildStep[];
  resourceLimits: {
    cpu: string;
    memory: string;
    timeout: string;
    egress: string;
    outputCap: string;
  };
  diff: DiffEntry[];
  notes?: string;
}

export interface Parameter {
  name: string;
  type: string;
  default: string;
  required: boolean;
  description: string;
}

export interface Review {
  author: string;
  affiliation: string;
  rating: number;
  date: string;
  body: string;
}

export interface Pricing {
  model: PricingModel;
  unit?: string;
  academicLabel?: string;
  commercialAmount?: number;
  amount?: number;
  runAmount?: number;
  currency: string;
  sponsoredBy?: string;
}

export interface License {
  type: LicenseType;
  spdx?: string;
  name: string;
  terms: string;
}

export interface Method {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string[];
  sellerId: string;
  institutionId: string;
  fields: string[];
  organisms: string[];
  dataTypes: string[];
  language: string;
  status: MethodStatus;
  verification: Verification;
  paperDoi: string;
  paperTitle: string;
  codonId: string;
  version: string;
  versionHistory: { version: string; date: string; note: string; status: VerificationStatus }[];
  externalTools: ExternalTool[];
  files: FileNode[];
  sampleInput: { name: string; preview: string; format: string };
  expectedOutput: { name: string; preview: string; format: string };
  parameters: Parameter[];
  license: License;
  pricing: Pricing;
  stats: { runs: number; citations: number; downloads: number; stars: number; rating: number; reviewCount: number };
  reviews: Review[];
  readme: string;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

/* -------------------------------------------------------------------------- */
/* Taxonomies (drive faceted search)                                          */
/* -------------------------------------------------------------------------- */

export const FIELDS = [
  "Single-cell",
  "Spatial transcriptomics",
  "Genomics / variants",
  "Structural biology",
  "Neuroimaging",
  "Protein design",
  "Cryo-EM",
  "Population genetics",
  "Epigenomics",
  "Simulation / operations",
] as const;

export const ORGANISMS = ["Human", "Mouse", "Zebrafish", "Yeast", "Pan-species"] as const;

export const DATA_TYPES = [
  "scRNA-seq",
  "snRNA-seq",
  "MERFISH",
  "Visium",
  "WGS",
  "WES",
  "ATAC-seq",
  "MRI",
  "PDB / structures",
  "Methylation array",
  "Genotype array",
] as const;

export const LANGUAGES = ["Python", "R", "Nextflow", "Snakemake", "C++", "Julia"] as const;

export const LICENSE_TYPES: { value: LicenseType; label: string }[] = [
  { value: "open", label: "Open source" },
  { value: "dual", label: "Academic-free / commercial" },
  { value: "commercial", label: "Commercial license" },
  { value: "sponsored", label: "Institution-sponsored" },
];

/* -------------------------------------------------------------------------- */
/* Institutions — Codon (the host) and the Community bucket for submissions.   */
/* -------------------------------------------------------------------------- */

export const institutions: Institution[] = [
  {
    id: "inst-codon",
    slug: "codon",
    name: "Codon",
    short: "Codon",
    kind: "Company",
    location: "Open · hosted by Codon",
    verified: true,
    blurb:
      "Codon is a trust layer for scientific code: it executes a method in an isolated sandbox, confirms it reproduces its declared output, and stamps a content-addressed verification record. The reference samples below are authored by Codon and independently reproduced.",
    website: "codon-six.vercel.app",
    accent: "#2e3a6e",
    joinedAt: "2026-01-01",
  },
  {
    id: "inst-community",
    slug: "community",
    name: "Codon Community",
    short: "Community",
    kind: "Research Institute",
    location: "Worldwide",
    verified: true,
    blurb:
      "Methods submitted directly by researchers and verified on Codon. Each carries the submitter's identity and its own verification record.",
    website: "codon-six.vercel.app",
    accent: "#2e3a6e",
    joinedAt: "2026-01-01",
  },
];

/* -------------------------------------------------------------------------- */
/* Sellers — Codon (reference samples) and the Community bucket.               */
/* -------------------------------------------------------------------------- */

export const sellers: Seller[] = [
  {
    id: "seller-codon",
    slug: "codon",
    name: "Codon",
    type: "institution",
    pi: "Codon",
    orcid: "",
    institutionId: "inst-codon",
    verified: true,
    avatar: "Co",
    bio: "Reference samples authored and independently reproduced by Codon. Each is pure, deterministic, and free to run under the MIT license.",
    location: "Open · hosted by Codon",
    fields: ["Single-cell", "Genomics / variants", "Structural biology", "Neuroimaging"],
    links: [{ label: "Codon", href: "codon-six.vercel.app" }],
    joinedAt: "2026-01-01",
  },
  {
    id: "seller-community",
    slug: "community",
    name: "Codon Community",
    type: "individual",
    pi: "Independent researchers",
    orcid: "",
    institutionId: "inst-community",
    verified: true,
    avatar: "CO",
    bio: "Methods submitted directly through Codon and verified on upload.",
    location: "Worldwide",
    fields: ["Single-cell", "Genomics / variants"],
    links: [{ label: "Codon", href: "codon-six.vercel.app" }],
    joinedAt: "2026-01-01",
  },
];

/* -------------------------------------------------------------------------- */
/* Methods — the real, reproduced catalog.                                     */
/*                                                                             */
/* • scanpy-cluster runs the real Scanpy library in an E2B microVM.            */
/* • cellineage-vi / neuroseg3d / dockstream-ad are Codon reference samples:   */
/*   pure-Python, run client-side via Pyodide, reproduced byte-for-byte. The   */
/*   output hashes below are the real SHA-256 of their actual stdout.          */
/* -------------------------------------------------------------------------- */

export const methods: Method[] = [
  {
    id: "m-scanpy-cluster",
    slug: "scanpy-cluster",
    title: "scRNA-seq Clustering (Scanpy)",
    summary:
      "The canonical single-cell clustering workflow — normalize, PCA, k-NN graph, and Leiden community detection — running the real Scanpy toolkit, verified to reproduce byte-for-byte.",
    description: [
      "A runnable reference of the standard Scanpy clustering pipeline: library-size normalization, log1p, PCA (arpack), a nearest-neighbour graph, and Leiden community detection — the exact steps behind most published scRNA-seq analyses.",
      "This executes the real Scanpy library (pinned to 1.12.2) with igraph + leidenalg — not a reimplementation — in an E2B Firecracker microVM, and is confirmed to reproduce byte-for-byte across two independent runs, including the Leiden assignment (which is notoriously environment-sensitive).",
      "Press Run and Codon provisions the pinned environment, runs the pipeline on a seeded synthetic dataset, and checks the cluster assignment against the verified reference output.",
    ],
    sellerId: "seller-codon",
    institutionId: "inst-codon",
    fields: ["Single-cell"],
    organisms: ["Human", "Mouse"],
    dataTypes: ["scRNA-seq", "snRNA-seq"],
    language: "Python",
    status: "published",
    paperDoi: "",
    paperTitle: "Scanpy: large-scale single-cell gene expression data analysis (Wolf et al., 2018)",
    codonId: "codon.2026.00812",
    version: "1.12.2",
    versionHistory: [
      { version: "1.12.2", date: "2026-06-28", note: "Verified on an E2B microVM — reproduced byte-for-byte", status: "verified" },
    ],
    externalTools: [],
    files: [
      { name: "pipeline.py", kind: "file", fileType: "code", size: "1.2 KB" },
      { name: "requirements.txt", kind: "file", fileType: "env", size: "58 B" },
    ],
    sampleInput: {
      name: "seeded synthetic AnnData",
      format: "generated in-method (np.random.seed(0))",
      preview: "300 cells × 60 genes of Poisson counts with two planted populations — fully deterministic.",
    },
    expectedOutput: {
      name: "cluster summary",
      format: "text",
      preview: "cells=300 genes=60\nn_clusters=7\ncluster_sizes=[81, 53, 48, 42, 35, 25, 16]",
    },
    parameters: [
      { name: "n_neighbors", type: "int", default: "15", required: false, description: "Neighbours for the k-NN graph." },
      { name: "n_comps", type: "int", default: "10", required: false, description: "PCA components." },
      { name: "random_state", type: "int", default: "0", required: false, description: "Seed for deterministic clustering." },
    ],
    license: {
      type: "open",
      spdx: "MIT",
      name: "Free by Codon",
      terms: "Free to inspect, run, and license under the MIT license — hosted and independently verified by Codon.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 0 },
    stats: { runs: 2, citations: 0, downloads: 0, stars: 0, rating: 0, reviewCount: 0 },
    reviews: [],
    readme:
      "# scRNA-seq Clustering (Scanpy)\n\nThe canonical Scanpy clustering workflow, verified reproducible.\n\n```python\nsc.pp.normalize_total(adata, target_sum=1e4)\nsc.pp.log1p(adata)\nsc.pp.pca(adata, n_comps=10, svd_solver='arpack')\nsc.pp.neighbors(adata, n_neighbors=15, random_state=0)\nsc.tl.leiden(adata, random_state=0, flavor='igraph')\n```\n\nRuns server-side in an E2B microVM (`scanpy==1.12.2`, igraph, leidenalg) and\nreproduces the reference cluster assignment byte-for-byte across independent runs.",
    createdAt: "2026-06-28",
    updatedAt: "2026-06-28",
    featured: true,
    verification: {
      id: "ver-scanpy-812",
      status: "verified",
      startedAt: "2026-06-28T00:00:00Z",
      finishedAt: "2026-06-28T00:00:35Z",
      durationSec: 35,
      verifierVersion: "codon-verifier (E2B)",
      baseImage: "e2b/code-interpreter · Python 3.12 (Firecracker microVM)",
      imageDigest: "",
      inputHash: "",
      expectedOutputHash: "sha256:627a61694cf7ea06b110ee1da0361d53ef764f2563312ca37f319a3174cafc7c",
      actualOutputHash: "sha256:627a61694cf7ea06b110ee1da0361d53ef764f2563312ca37f319a3174cafc7c",
      toleranceProfile: "exact: byte-identical stdout",
      runExitCode: 0,
      runWallSec: 33,
      peakMemoryMb: 640,
      buildSteps: [
        { label: "Create E2B microVM", status: "ok", durationSec: 2 },
        { label: "pip install scanpy==1.12.2 igraph leidenalg", status: "ok", durationSec: 12 },
        { label: "Run pipeline on seeded input", status: "ok", durationSec: 19 },
        { label: "Re-run in a second microVM — byte-identical", status: "ok", durationSec: 2 },
      ],
      resourceLimits: {
        cpu: "shared vCPU",
        memory: "microVM",
        timeout: "5 min",
        egress: "pip install only",
        outputCap: "—",
      },
      diff: [
        {
          name: "cluster summary",
          kind: "exact",
          status: "match",
          detail: "Leiden assignment reproduced byte-for-byte across two independent microVMs (7 clusters, sizes [81,53,48,42,35,25,16]).",
          tolerance: "exact",
        },
      ],
    },
  },

  {
    id: "m-cellineage",
    slug: "cellineage-vi",
    title: "Single-cell normalization + lineage split",
    summary:
      "A small, deterministic single-cell reference sample: library-size normalization to 1e4, log1p, top-variance gene selection, and a two-way lineage split. Runs in your browser and reproduces byte-for-byte.",
    description: [
      "A compact reference sample authored by Codon to demonstrate deterministic reproduction end-to-end. It reads a counts matrix, normalizes each cell to a library size of 1e4, applies log1p, ranks genes by variance, and splits cells into two lineages by the top gene's expression.",
      "It is pure-Python (standard library only) and runs client-side via Pyodide (CPython compiled to WebAssembly) in a no-network sandbox. Running it twice produces byte-identical output, which is content-hashed with SHA-256.",
      "This is an illustrative sample, not a published method — it shows exactly how Codon verifies: run the code, compare to the declared reference output, and stamp the hash.",
    ],
    sellerId: "seller-codon",
    institutionId: "inst-codon",
    fields: ["Single-cell"],
    organisms: ["Pan-species"],
    dataTypes: ["scRNA-seq"],
    language: "Python",
    status: "published",
    paperDoi: "",
    paperTitle: "",
    codonId: "codon.sample.cellineage",
    version: "1.0.0",
    versionHistory: [
      { version: "1.0.0", date: "2026-06-28", note: "Reference sample — reproduced byte-for-byte in Pyodide", status: "verified" },
    ],
    externalTools: [],
    files: [
      { name: "pipeline.py", kind: "file", fileType: "code", size: "1.1 KB" },
      { name: "counts.csv", kind: "file", fileType: "data", size: "120 B" },
    ],
    sampleInput: {
      name: "counts.csv",
      format: "CSV (cells × genes)",
      preview: "cell,GENE1,GENE2,GENE3,GENE4,GENE5\nc1,12,0,3,5,1\nc2,0,9,1,4,0\n...",
    },
    expectedOutput: {
      name: "stdout",
      format: "text",
      preview: "cells=6 genes=5\ntop_variable_genes=GENE1, GENE2, GENE5\nlineage_A(n=3)=c2,c4,c6\nlineage_B(n=3)=c1,c3,c5",
    },
    parameters: [],
    license: {
      type: "open",
      spdx: "MIT",
      name: "Free by Codon",
      terms: "Free to inspect and run under the MIT license — a Codon reference sample.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 0 },
    stats: { runs: 0, citations: 0, downloads: 0, stars: 0, rating: 0, reviewCount: 0 },
    reviews: [],
    readme:
      "# Single-cell normalization + lineage split\n\nA Codon reference sample. Pure-Python, deterministic, runs in the browser via Pyodide.\n\nCodon runs it, reproduces the declared output, and hashes it (SHA-256).",
    createdAt: "2026-06-28",
    updatedAt: "2026-06-28",
    featured: true,
    verification: {
      id: "ver-cellineage-sample",
      status: "verified",
      startedAt: "2026-06-28T00:00:00Z",
      finishedAt: "2026-06-28T00:00:01Z",
      durationSec: 1,
      verifierVersion: "codon-verifier (Pyodide / E2B)",
      baseImage: "Pyodide (CPython → WebAssembly), no-network sandbox",
      imageDigest: "",
      inputHash: "sha256:217be7b55482f90bc428c97f88dda7cec5f4b4ce0c2804a24fb3d4f26cd3391b",
      expectedOutputHash: "sha256:3c96f020bdba9c1fa789cb866621d3b3c1dd2083a884489f120565d2a72bb4a5",
      actualOutputHash: "sha256:3c96f020bdba9c1fa789cb866621d3b3c1dd2083a884489f120565d2a72bb4a5",
      toleranceProfile: "exact: byte-identical stdout",
      runExitCode: 0,
      runWallSec: 1,
      peakMemoryMb: 0,
      buildSteps: [
        { label: "Load Pyodide runtime", status: "ok", durationSec: 0 },
        { label: "Run pipeline on sample input", status: "ok", durationSec: 0 },
        { label: "Re-run — byte-identical stdout", status: "ok", durationSec: 0 },
      ],
      resourceLimits: {
        cpu: "browser / microVM",
        memory: "sandbox",
        timeout: "—",
        egress: "none (no network)",
        outputCap: "—",
      },
      diff: [
        {
          name: "stdout",
          kind: "exact",
          status: "match",
          detail: "Byte-identical across two independent runs; SHA-256 3c96f020…",
          tolerance: "exact",
        },
      ],
    },
  },

  {
    id: "m-neuroseg",
    slug: "neuroseg3d",
    title: "Otsu-threshold intensity segmentation",
    summary:
      "A deterministic image-segmentation reference sample: Otsu's method finds the optimal intensity threshold on a grid and reports the segmented foreground. Runs in your browser and reproduces byte-for-byte.",
    description: [
      "A compact reference sample authored by Codon: it builds a 256-bin intensity histogram, computes Otsu's optimal between-class-variance threshold, and reports the segmented foreground fraction and mean intensity.",
      "Pure-Python (standard library only), it runs client-side via Pyodide in a no-network sandbox and produces byte-identical output across runs, content-hashed with SHA-256.",
      "This is an illustrative reference sample of classic Otsu thresholding — not a deep-learning segmentation model. It demonstrates Codon's run-compare-stamp verification loop.",
    ],
    sellerId: "seller-codon",
    institutionId: "inst-codon",
    fields: ["Neuroimaging"],
    organisms: ["Pan-species"],
    dataTypes: ["MRI"],
    language: "Python",
    status: "published",
    paperDoi: "",
    paperTitle: "",
    codonId: "codon.sample.neuroseg",
    version: "1.0.0",
    versionHistory: [
      { version: "1.0.0", date: "2026-06-28", note: "Reference sample — reproduced byte-for-byte in Pyodide", status: "verified" },
    ],
    externalTools: [],
    files: [
      { name: "pipeline.py", kind: "file", fileType: "code", size: "0.9 KB" },
      { name: "slice.csv", kind: "file", fileType: "data", size: "80 B" },
    ],
    sampleInput: {
      name: "slice.csv",
      format: "CSV (intensity grid)",
      preview: "10,12,15,200,210\n14,11,205,220,215\n12,190,230,225,30\n...",
    },
    expectedOutput: {
      name: "stdout",
      format: "text",
      preview: "otsu_threshold=40\nsegmented_voxels=11/25 (44.0%)\nmean_intensity_fg=213.6",
    },
    parameters: [],
    license: {
      type: "open",
      spdx: "MIT",
      name: "Free by Codon",
      terms: "Free to inspect and run under the MIT license — a Codon reference sample.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 0 },
    stats: { runs: 0, citations: 0, downloads: 0, stars: 0, rating: 0, reviewCount: 0 },
    reviews: [],
    readme:
      "# Otsu-threshold intensity segmentation\n\nA Codon reference sample. Classic Otsu thresholding, pure-Python, deterministic.\n\nCodon runs it, reproduces the declared output, and hashes it (SHA-256).",
    createdAt: "2026-06-28",
    updatedAt: "2026-06-28",
    featured: true,
    verification: {
      id: "ver-neuroseg-sample",
      status: "verified",
      startedAt: "2026-06-28T00:00:00Z",
      finishedAt: "2026-06-28T00:00:01Z",
      durationSec: 1,
      verifierVersion: "codon-verifier (Pyodide / E2B)",
      baseImage: "Pyodide (CPython → WebAssembly), no-network sandbox",
      imageDigest: "",
      inputHash: "sha256:59b4c97a64c1e16d70eb33a8a58859f8bae2e21fae04be66634a81fd016f0bf4",
      expectedOutputHash: "sha256:955435eb483bfb33bc57ca5dfa587e687d1c6f236fb82a3a016310a6eda6903e",
      actualOutputHash: "sha256:955435eb483bfb33bc57ca5dfa587e687d1c6f236fb82a3a016310a6eda6903e",
      toleranceProfile: "exact: byte-identical stdout",
      runExitCode: 0,
      runWallSec: 1,
      peakMemoryMb: 0,
      buildSteps: [
        { label: "Load Pyodide runtime", status: "ok", durationSec: 0 },
        { label: "Run pipeline on sample input", status: "ok", durationSec: 0 },
        { label: "Re-run — byte-identical stdout", status: "ok", durationSec: 0 },
      ],
      resourceLimits: {
        cpu: "browser / microVM",
        memory: "sandbox",
        timeout: "—",
        egress: "none (no network)",
        outputCap: "—",
      },
      diff: [
        {
          name: "stdout",
          kind: "exact",
          status: "match",
          detail: "Byte-identical across two independent runs; SHA-256 955435eb…",
          tolerance: "exact",
        },
      ],
    },
  },

  {
    id: "m-dockstream",
    slug: "dockstream-ad",
    title: "Quick rigid docking score (reference sample)",
    summary:
      "A simplified, deterministic docking-score demo: distance-based pocket contacts and a Gaussian proximity score around a pocket center. Runs in your browser and reproduces byte-for-byte. Not a substitute for real docking.",
    description: [
      "A compact reference sample authored by Codon: given a pocket center and a set of atom coordinates, it counts contacts within a cutoff and sums a Gaussian proximity term into a single quick score.",
      "Pure-Python (standard library only), it runs client-side via Pyodide in a no-network sandbox and produces byte-identical output across runs, content-hashed with SHA-256.",
      "This is a simplified illustrative score, NOT real molecular docking — production docking would run AutoDock Vina (the sample prints this note). It exists to demonstrate Codon's deterministic run-compare-stamp loop.",
    ],
    sellerId: "seller-codon",
    institutionId: "inst-codon",
    fields: ["Structural biology"],
    organisms: ["Pan-species"],
    dataTypes: ["PDB / structures"],
    language: "Python",
    status: "published",
    paperDoi: "",
    paperTitle: "",
    codonId: "codon.sample.dockstream",
    version: "1.0.0",
    versionHistory: [
      { version: "1.0.0", date: "2026-06-28", note: "Reference sample — reproduced byte-for-byte in Pyodide", status: "verified" },
    ],
    externalTools: [
      { name: "AutoDock Vina", version: "1.2.5", kind: "proprietary", licenseNote: "Not used by this sample; a production docking method would run Vina on a licensed runner." },
    ],
    files: [
      { name: "pipeline.py", kind: "file", fileType: "code", size: "0.9 KB" },
      { name: "ligand.xyz", kind: "file", fileType: "data", size: "130 B" },
    ],
    sampleInput: {
      name: "ligand.xyz",
      format: "text (center + atoms)",
      preview: "0 0 0\nC 0.5 0.2 -0.3\nN 1.2 0.0 0.4\nO -0.7 0.6 0.1\n...",
    },
    expectedOutput: {
      name: "stdout",
      format: "text",
      preview:
        "pocket_center=(0.0,0.0,0.0)\nn_atoms=8 contacts(<4A)=8\ndock_score=-5.53 kcal/mol  (quick rigid score)\nnote: full ensemble docking runs AutoDock Vina on the licensed runner",
    },
    parameters: [],
    license: {
      type: "open",
      spdx: "MIT",
      name: "Free by Codon",
      terms: "Free to inspect and run under the MIT license — a Codon reference sample.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 0 },
    stats: { runs: 0, citations: 0, downloads: 0, stars: 0, rating: 0, reviewCount: 0 },
    reviews: [],
    readme:
      "# Quick rigid docking score (reference sample)\n\nA Codon reference sample — a simplified deterministic score, not real docking.\n\nCodon runs it, reproduces the declared output, and hashes it (SHA-256).",
    createdAt: "2026-06-28",
    updatedAt: "2026-06-28",
    featured: false,
    verification: {
      id: "ver-dockstream-sample",
      status: "verified",
      startedAt: "2026-06-28T00:00:00Z",
      finishedAt: "2026-06-28T00:00:01Z",
      durationSec: 1,
      verifierVersion: "codon-verifier (Pyodide / E2B)",
      baseImage: "Pyodide (CPython → WebAssembly), no-network sandbox",
      imageDigest: "",
      inputHash: "sha256:93b6df2da10af7b865495980cbfbb633b474595cc043604176e354bbb17e497c",
      expectedOutputHash: "sha256:2e514e053ce36e2a313674a8756e8d507d898baf15f00bb731bb4b12307efd39",
      actualOutputHash: "sha256:2e514e053ce36e2a313674a8756e8d507d898baf15f00bb731bb4b12307efd39",
      toleranceProfile: "exact: byte-identical stdout",
      runExitCode: 0,
      runWallSec: 1,
      peakMemoryMb: 0,
      buildSteps: [
        { label: "Load Pyodide runtime", status: "ok", durationSec: 0 },
        { label: "Run pipeline on sample input", status: "ok", durationSec: 0 },
        { label: "Re-run — byte-identical stdout", status: "ok", durationSec: 0 },
      ],
      resourceLimits: {
        cpu: "browser / microVM",
        memory: "sandbox",
        timeout: "—",
        egress: "none (no network)",
        outputCap: "—",
      },
      diff: [
        {
          name: "stdout",
          kind: "exact",
          status: "match",
          detail: "Byte-identical across two independent runs; SHA-256 2e514e05…",
          tolerance: "exact",
        },
      ],
    },
  },
];

export const CODON_SELLER_ID = "seller-codon";
export const CODON_INSTITUTION_ID = "inst-codon";

/**
 * Codon's catalog is free. This normalizes any method so it is presented as
 * "Free by Codon": MIT-licensed, no charge to run or license. Curated reference
 * methods are attributed to Codon; user-submitted methods keep their own author
 * attribution (submittedBy) but are still free — there is no paid tier yet.
 */
export function freeByCodon<T extends Method>(m: T): T {
  const submitted = Boolean((m as Method & { submittedBy?: string }).submittedBy);
  return {
    ...m,
    sellerId: submitted ? m.sellerId : CODON_SELLER_ID,
    institutionId: submitted ? m.institutionId : CODON_INSTITUTION_ID,
    // Codon-authored reference samples aren't tied to a published paper.
    paperDoi: submitted ? m.paperDoi : "",
    license: {
      type: "open",
      spdx: "MIT",
      name: "Free by Codon",
      terms:
        "Free to inspect, run, and license under the MIT license — hosted and independently verified by Codon.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 0 },
  };
}

/**
 * The rendered catalog: the real reference samples above, each normalized to
 * "Free by Codon". User-submitted methods are layered on top by the server
 * data layer at request time.
 */
export const allMethods: Method[] = methods.map(freeByCodon);

/* -------------------------------------------------------------------------- */
/* Accessors                                                                  */
/* -------------------------------------------------------------------------- */

export function getMethod(slug: string): Method | undefined {
  return allMethods.find((m) => m.slug === slug);
}
export function getSeller(slug: string): Seller | undefined {
  return sellers.find((s) => s.slug === slug);
}
export function getSellerById(id: string): Seller | undefined {
  return sellers.find((s) => s.id === id);
}
export function getInstitution(slug: string): Institution | undefined {
  return institutions.find((i) => i.slug === slug);
}
export function getInstitutionById(id: string): Institution | undefined {
  return institutions.find((i) => i.id === id);
}
export function methodsBySeller(sellerId: string): Method[] {
  return allMethods.filter((m) => m.sellerId === sellerId);
}
export function methodsByInstitution(institutionId: string): Method[] {
  return allMethods.filter((m) => m.institutionId === institutionId);
}
export function featuredMethods(): Method[] {
  return allMethods.filter((m) => m.featured);
}

export const verificationStatusLabel: Record<VerificationStatus, string> = {
  verified: "Reproducibility Verified",
  "external-dep": "Verified · external dependency",
  pending: "Verifying",
  failed: "Verification failed",
  unverified: "Unverified",
};

export const pricingModelLabel: Record<PricingModel, string> = {
  free: "Free",
  dual: "Academic-free / paid commercial",
  paid: "Paid license",
  sponsored: "Institution-sponsored",
};

/* Aggregate platform stats for the landing page. Derived from the real catalog. */
export const platformStats = {
  verifiedMethods: allMethods.filter((m) => m.verification.status === "verified" || m.verification.status === "external-dep").length,
  institutions: institutions.length,
  labs: sellers.filter((s) => s.type === "lab").length,
  totalRuns: allMethods.reduce((acc, m) => acc + m.stats.runs, 0),
  citations: allMethods.reduce((acc, m) => acc + m.stats.citations, 0),
};
