/* ============================================================================
   Codon — mock data layer
   A realistic computational-biology marketplace dataset used by every page
   until the real backend (Phases 2+) replaces it.
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
/* Institutions                                                               */
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
      "Codon hosts a free, verified reference catalog of computational-biology methods. Every listing is independently reproduced, content-addressed, and free to inspect, run, and license under the MIT license.",
    website: "codon-six.vercel.app",
    accent: "#2e3a6e",
    joinedAt: "2026-01-01",
  },
  {
    id: "inst-lindgren",
    slug: "lindgren-institute",
    name: "Lindgren Institute for Biomedical Research",
    short: "Lindgren Institute",
    kind: "Research Institute",
    location: "Cambridge, MA",
    verified: true,
    blurb:
      "An independent non-profit advancing genomics, single-cell biology, and computational medicine. Lindgren sponsors its core methods so they remain free to the public.",
    website: "lindgren.org",
    accent: "#0a9d6c",
    joinedAt: "2024-09-02",
  },
  {
    id: "inst-thorne",
    slug: "thorne-university",
    name: "Thorne University",
    short: "Thorne",
    kind: "University",
    location: "New Haven, CT",
    verified: true,
    blurb:
      "A research university with strengths in structural biology, neuroscience, and statistical genetics. Methods are published through the Thorne Office of Software Commercialization.",
    website: "thorne.edu",
    accent: "#4f46e5",
    joinedAt: "2024-10-18",
  },
  {
    id: "inst-baysb",
    slug: "bay-structural",
    name: "Bay Area Structural Biology Center",
    short: "BASB Center",
    kind: "Research Institute",
    location: "San Francisco, CA",
    verified: true,
    blurb:
      "A consortium facility for cryo-EM, molecular docking, and protein design serving academic and industry partners across the Bay Area.",
    website: "basb.org",
    accent: "#0891b2",
    joinedAt: "2025-01-12",
  },
  {
    id: "inst-northcrest",
    slug: "northcrest-medical",
    name: "Northcrest University Medical Center",
    short: "Northcrest UMC",
    kind: "Medical Center",
    location: "Nashville, TN",
    verified: true,
    blurb:
      "An academic medical center pairing clinical neuroimaging and genomics programs with a translational software core.",
    website: "northcrest.edu",
    accent: "#be123c",
    joinedAt: "2025-02-20",
  },
  {
    id: "inst-meridian",
    slug: "meridian-tx",
    name: "Meridian Therapeutics",
    short: "Meridian Tx",
    kind: "Company",
    location: "Boston, MA",
    verified: true,
    blurb:
      "A clinical-stage biotech licensing internal computational methods for target discovery and variant interpretation to the broader research community.",
    website: "meridiantx.com",
    accent: "#7c3aed",
    joinedAt: "2025-03-04",
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
      "Methods submitted directly by independent researchers and verified on Codon. Each carries the submitter's verified identity.",
    website: "codon.science",
    accent: "#2e3a6e",
    joinedAt: "2026-01-01",
  },
];

/* -------------------------------------------------------------------------- */
/* Sellers (labs & individuals)                                               */
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
    bio: "Free, verified reference methods hosted by Codon. Each is independently reproduced and free to run and license under the MIT license.",
    location: "Open · hosted by Codon",
    fields: ["Single-cell", "Genomics", "Spatial transcriptomics", "Imaging"],
    links: [{ label: "Codon", href: "codon-six.vercel.app" }],
    joinedAt: "2026-01-01",
  },
  {
    id: "seller-okafor",
    slug: "okafor-lab",
    name: "Okafor Lab",
    type: "lab",
    pi: "Dr. Adaeze Okafor",
    orcid: "0000-0002-4417-9013",
    institutionId: "inst-lindgren",
    verified: true,
    avatar: "OK",
    bio: "Computational single-cell biology: probabilistic models of differentiation, lineage, and cell-state dynamics.",
    location: "Cambridge, MA",
    fields: ["Single-cell", "Spatial transcriptomics"],
    links: [
      { label: "Lab site", href: "okaforlab.org" },
      { label: "Google Scholar", href: "scholar.google.com/okafor" },
    ],
    joinedAt: "2024-09-04",
  },
  {
    id: "seller-reyes",
    slug: "reyes-lab",
    name: "Reyes Lab",
    type: "lab",
    pi: "Dr. Mateo Reyes",
    orcid: "0000-0001-7782-5560",
    institutionId: "inst-meridian",
    verified: true,
    avatar: "RE",
    bio: "Clinical genomics and somatic variant interpretation at scale; reproducible Nextflow pipelines for tumor sequencing.",
    location: "Boston, MA",
    fields: ["Genomics / variants"],
    links: [{ label: "Lab site", href: "reyeslab.meridiantx.com" }],
    joinedAt: "2025-03-06",
  },
  {
    id: "seller-salomon",
    slug: "salomon-lab",
    name: "Salomon Lab",
    type: "lab",
    pi: "Dr. Irene Salomon",
    orcid: "0000-0003-2210-8841",
    institutionId: "inst-baysb",
    verified: true,
    avatar: "SA",
    bio: "Structure-based drug discovery, docking protocols, and free-energy methods for small-molecule binding.",
    location: "San Francisco, CA",
    fields: ["Structural biology"],
    links: [{ label: "Lab site", href: "salomonlab.basb.org" }],
    joinedAt: "2025-01-15",
  },
  {
    id: "seller-vasquez",
    slug: "vasquez-lab",
    name: "Vásquez Neuroimaging Lab",
    type: "lab",
    pi: "Dr. Camila Vásquez",
    orcid: "0000-0002-9930-1144",
    institutionId: "inst-northcrest",
    verified: true,
    avatar: "VA",
    bio: "Quantitative neuroimaging, lesion segmentation, and deep-learning biomarkers for cerebrovascular disease.",
    location: "Nashville, TN",
    fields: ["Neuroimaging"],
    links: [{ label: "Lab site", href: "vasquezlab.northcrest.edu" }],
    joinedAt: "2025-02-22",
  },
  {
    id: "seller-tanaka",
    slug: "tanaka-lab",
    name: "Tanaka Lab",
    type: "lab",
    pi: "Dr. Ren Tanaka",
    orcid: "0000-0001-5563-7720",
    institutionId: "inst-lindgren",
    verified: true,
    avatar: "TA",
    bio: "Spatial transcriptomics methods, cell-type deconvolution, and tissue architecture modeling.",
    location: "Cambridge, MA",
    fields: ["Spatial transcriptomics", "Single-cell"],
    links: [{ label: "Lab site", href: "tanakalab.lindgren.org" }],
    joinedAt: "2024-11-30",
  },
  {
    id: "seller-nair",
    slug: "priya-nair",
    name: "Dr. Priya Nair",
    type: "individual",
    pi: "Dr. Priya Nair",
    orcid: "0000-0002-3081-6627",
    institutionId: "inst-thorne",
    verified: true,
    avatar: "PN",
    bio: "Independent researcher in protein design and generative models for sequence–structure relationships.",
    location: "New Haven, CT",
    fields: ["Protein design"],
    links: [{ label: "Personal site", href: "priyanair.dev" }],
    joinedAt: "2025-04-10",
  },
  {
    id: "seller-eskildsen",
    slug: "eskildsen-lab",
    name: "Eskildsen Lab",
    type: "lab",
    pi: "Dr. Lars Eskildsen",
    orcid: "0000-0003-9921-4408",
    institutionId: "inst-baysb",
    verified: true,
    avatar: "ES",
    bio: "Cryo-EM map refinement, particle picking, and high-resolution reconstruction pipelines.",
    location: "San Francisco, CA",
    fields: ["Cryo-EM", "Structural biology"],
    links: [{ label: "Lab site", href: "eskildsenlab.basb.org" }],
    joinedAt: "2025-01-20",
  },
  {
    id: "seller-mbeki",
    slug: "mbeki-lab",
    name: "Mbeki Lab",
    type: "lab",
    pi: "Dr. Thandiwe Mbeki",
    orcid: "0000-0002-7745-3392",
    institutionId: "inst-thorne",
    verified: true,
    avatar: "MB",
    bio: "Statistical and population genetics: admixture, demographic inference, and selection scans.",
    location: "New Haven, CT",
    fields: ["Population genetics", "Genomics / variants"],
    links: [{ label: "Lab site", href: "mbekilab.thorne.edu" }],
    joinedAt: "2025-02-02",
  },
  {
    id: "seller-community",
    slug: "community",
    name: "Codon Community",
    type: "individual",
    pi: "Independent researchers",
    orcid: "0000-0000-0000-0000",
    institutionId: "inst-community",
    verified: true,
    avatar: "CO",
    bio: "Methods submitted directly through Codon and verified on upload.",
    location: "Worldwide",
    fields: ["Single-cell", "Genomics / variants"],
    links: [{ label: "Codon", href: "codon.science" }],
    joinedAt: "2026-01-01",
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers to build verification + file artifacts compactly                   */
/* -------------------------------------------------------------------------- */

function hash(prefix: "sha256" | "blake3", seed: string): string {
  const chars = "0123456789abcdef";
  let h = "";
  let acc = 0;
  for (let i = 0; i < seed.length; i++) acc = (acc * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < 64; i++) {
    acc = (acc * 1103515245 + 12345) >>> 0;
    h += chars[(acc >>> (i % 24)) & 15];
  }
  return `${prefix}:${h}`;
}

/* -------------------------------------------------------------------------- */
/* Methods                                                                    */
/* -------------------------------------------------------------------------- */

export const methods: Method[] = [
  {
    id: "m-cellineage",
    slug: "cellineage-vi",
    title: "CellLineage-VI",
    summary:
      "Variational inference of single-cell differentiation trajectories and branch-point uncertainty from scRNA-seq.",
    description: [
      "CellLineage-VI fits a probabilistic latent-variable model to single-cell RNA-seq counts, jointly inferring a continuous developmental pseudotime, discrete lineage assignments, and calibrated uncertainty at branch points.",
      "Unlike deterministic trajectory tools, the method propagates posterior uncertainty into every downstream estimate, so users can distinguish confident commitments from ambiguous transition states.",
      "The packaged artifact reproduces the paper's mouse hematopoiesis benchmark end-to-end, including the figure-3 branch-probability matrix, from a 2,000-cell sample.",
    ],
    sellerId: "seller-okafor",
    institutionId: "inst-lindgren",
    fields: ["Single-cell"],
    organisms: ["Mouse", "Human"],
    dataTypes: ["scRNA-seq", "snRNA-seq"],
    language: "Python",
    status: "published",
    paperDoi: "10.1038/s41592-025-02218-3",
    paperTitle:
      "Calibrated variational inference of single-cell lineage trajectories",
    codonId: "codon.2025.00417",
    version: "1.3.0",
    versionHistory: [
      { version: "1.3.0", date: "2025-05-18", note: "Reproduced on verifier v0.9.2", status: "verified" },
      { version: "1.2.0", date: "2025-02-09", note: "Added GPU path; reproduced", status: "verified" },
      { version: "1.0.0", date: "2024-11-01", note: "Initial verified release", status: "verified" },
    ],
    externalTools: [],
    files: [
      {
        name: "cellineage/",
        kind: "dir",
        children: [
          { name: "model.py", kind: "file", fileType: "code", size: "18.4 KB" },
          { name: "inference.py", kind: "file", fileType: "code", size: "22.1 KB" },
          { name: "cli.py", kind: "file", fileType: "code", size: "6.7 KB" },
          { name: "plotting.py", kind: "file", fileType: "code", size: "9.3 KB" },
        ],
      },
      { name: "environment.yml", kind: "file", fileType: "env", size: "1.1 KB" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "812 B" },
      {
        name: "data/",
        kind: "dir",
        children: [
          { name: "sample_input.h5ad", kind: "file", fileType: "data", size: "14.2 MB" },
          { name: "expected_branch_probs.csv", kind: "file", fileType: "data", size: "284 KB" },
        ],
      },
      { name: "README.md", kind: "file", fileType: "doc", size: "7.9 KB" },
      { name: "codon.manifest.json", kind: "file", fileType: "config", size: "2.3 KB" },
    ],
    sampleInput: {
      name: "sample_input.h5ad",
      format: "AnnData (HDF5)",
      preview:
        "AnnData object with n_obs × n_vars = 2000 × 2000\n  obs: 'cell_type', 'batch', 'phase'\n  var: 'gene_ids', 'highly_variable'\n  layers: 'spliced', 'unspliced'\n  uns: 'neighbors'",
    },
    expectedOutput: {
      name: "expected_branch_probs.csv",
      format: "CSV (2000 × 5)",
      preview:
        "cell_id,erythroid,myeloid,lymphoid,megakaryocyte,pseudotime\nAAAC-1,0.812,0.067,0.041,0.080,0.214\nAAAG-1,0.022,0.741,0.190,0.047,0.633\nAACT-1,0.105,0.118,0.690,0.087,0.588\n...",
    },
    parameters: [
      { name: "--n-latent", type: "int", default: "10", required: false, description: "Dimensionality of the latent space." },
      { name: "--n-lineages", type: "int", default: "auto", required: false, description: "Number of terminal lineages; inferred if omitted." },
      { name: "--seed", type: "int", default: "0", required: false, description: "Random seed for deterministic inference." },
      { name: "--max-epochs", type: "int", default: "400", required: false, description: "Maximum training epochs." },
    ],
    license: {
      type: "dual",
      spdx: "BSD-3-Clause / Commercial",
      name: "Academic-free, commercial license",
      terms:
        "Free for non-commercial academic research under BSD-3-Clause. Commercial use requires a paid license from the Okafor Lab via Lindgren Institute.",
    },
    pricing: {
      model: "dual",
      currency: "USD",
      academicLabel: "Free for academic use",
      commercialAmount: 2400,
      runAmount: 1.8,
      unit: "commercial seat / yr",
    },
    stats: { runs: 4127, citations: 38, downloads: 2210, stars: 412, rating: 4.8, reviewCount: 23 },
    reviews: [
      {
        author: "Dr. Helen Zhou",
        affiliation: "Karzon Center for Developmental Biology",
        rating: 5,
        date: "2025-05-29",
        body: "Ran on our own bone-marrow dataset in one click. The calibrated branch probabilities matched our orthogonal lineage tracing remarkably well.",
      },
      {
        author: "Marcus Lindahl",
        affiliation: "Graduate student, Thorne University",
        rating: 5,
        date: "2025-04-12",
        body: "The fact that it reproduced the paper figure exactly before I touched it saved me a week of dependency wrangling.",
      },
    ],
    readme:
      "# CellLineage-VI\n\nCalibrated variational inference of single-cell lineage trajectories.\n\n## Quickstart\n\n```bash\ncellineage fit data/sample_input.h5ad --n-lineages auto --seed 0 \\\n  --out results/branch_probs.csv\n```\n\nThe verified run reproduces `data/expected_branch_probs.csv` within a 1e-4\nnumerical tolerance on the posterior branch-probability matrix.\n\n## Inputs\n\n- An `AnnData` `.h5ad` file with spliced/unspliced layers.\n\n## Outputs\n\n- A per-cell branch-probability matrix and continuous pseudotime.",
    createdAt: "2024-11-01",
    updatedAt: "2025-05-18",
    featured: true,
    verification: {
      id: "ver-cellineage-130",
      status: "verified",
      startedAt: "2025-05-18T14:02:11Z",
      finishedAt: "2025-05-18T14:09:54Z",
      durationSec: 463,
      verifierVersion: "codon-verifier 0.9.2",
      baseImage: "python:3.11-slim",
      imageDigest: hash("sha256", "cellineage-image-130"),
      inputHash: hash("blake3", "cellineage-input"),
      expectedOutputHash: hash("blake3", "cellineage-expected"),
      actualOutputHash: hash("blake3", "cellineage-expected"),
      toleranceProfile: "numeric: atol 1e-4, rtol 1e-3 (float matrices)",
      runExitCode: 0,
      runWallSec: 271,
      peakMemoryMb: 3820,
      buildSteps: [
        { label: "Resolve conda environment (lock)", status: "ok", durationSec: 96 },
        { label: "Build OCI image", status: "ok", durationSec: 88 },
        { label: "Pin dependency graph (142 packages)", status: "ok", durationSec: 8 },
        { label: "Sandbox run on sample input", status: "ok", durationSec: 271 },
      ],
      resourceLimits: {
        cpu: "4 vCPU",
        memory: "8 GB",
        timeout: "30 min",
        egress: "none (network disabled)",
        outputCap: "512 MB",
      },
      diff: [
        {
          name: "branch_probs.csv",
          kind: "numeric",
          status: "match",
          detail: "2000×5 float matrix within atol 1e-4 (max abs Δ = 3.1e-5).",
          tolerance: "atol 1e-4 / rtol 1e-3",
        },
        {
          name: "pseudotime column",
          kind: "numeric",
          status: "match",
          detail: "Spearman ρ = 1.000 vs expected ordering.",
          tolerance: "atol 1e-4",
        },
      ],
    },
  },

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
    sellerId: "seller-okafor",
    institutionId: "inst-lindgren",
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
      { name: "codon.manifest.json", kind: "file", fileType: "config", size: "1.0 KB" },
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
    stats: { runs: 2, citations: 0, downloads: 0, stars: 6, rating: 5, reviewCount: 0 },
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
      imageDigest: hash("sha256", "scanpy-e2b-1.12.2"),
      inputHash: hash("blake3", "scanpy-seed-0"),
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
    id: "m-varsig",
    slug: "varsig-somatic",
    title: "VarSig",
    summary:
      "Reproducible somatic variant interpretation pipeline scoring pathogenicity and actionability from tumor WES/WGS.",
    description: [
      "VarSig is an end-to-end Nextflow pipeline that annotates somatic variants, integrates population and functional evidence, and produces a ranked, clinically structured pathogenicity report.",
      "It bundles a pinned reference snapshot manifest so results are stable across runs, and emits a deterministic JSON report alongside a human-readable summary.",
      "The verified artifact reproduces the cohort benchmark report for a 50-variant sample VCF.",
    ],
    sellerId: "seller-reyes",
    institutionId: "inst-meridian",
    fields: ["Genomics / variants"],
    organisms: ["Human"],
    dataTypes: ["WGS", "WES"],
    language: "Nextflow",
    status: "published",
    paperDoi: "10.1186/s13073-025-01411-7",
    paperTitle: "VarSig: transparent somatic variant interpretation at cohort scale",
    codonId: "codon.2025.00622",
    version: "2.1.4",
    versionHistory: [
      { version: "2.1.4", date: "2025-06-01", note: "Reference snapshot refresh; reproduced", status: "verified" },
      { version: "2.0.0", date: "2025-03-15", note: "Nextflow DSL2 rewrite", status: "verified" },
    ],
    externalTools: [],    files: [
      { name: "main.nf", kind: "file", fileType: "code", size: "12.0 KB" },
      { name: "nextflow.config", kind: "file", fileType: "config", size: "3.4 KB" },
      {
        name: "modules/",
        kind: "dir",
        children: [
          { name: "annotate.nf", kind: "file", fileType: "code", size: "5.1 KB" },
          { name: "score.nf", kind: "file", fileType: "code", size: "7.8 KB" },
          { name: "report.nf", kind: "file", fileType: "code", size: "4.2 KB" },
        ],
      },
      { name: "env/Dockerfile", kind: "file", fileType: "config", size: "1.4 KB" },
      {
        name: "test/",
        kind: "dir",
        children: [
          { name: "sample.vcf.gz", kind: "file", fileType: "data", size: "82 KB" },
          { name: "expected_report.json", kind: "file", fileType: "data", size: "47 KB" },
        ],
      },
      { name: "README.md", kind: "file", fileType: "doc", size: "11.2 KB" },
    ],
    sampleInput: {
      name: "sample.vcf.gz",
      format: "VCF 4.2 (bgzipped)",
      preview:
        "##fileformat=VCFv4.2\n#CHROM POS ID REF ALT QUAL FILTER INFO\nchr7 140453136 . A T 312 PASS DP=210;AF=0.31\nchr17 7674220 . C T 287 PASS DP=180;AF=0.44\nchr12 25245350 . C A 301 PASS DP=199;AF=0.28",
    },
    expectedOutput: {
      name: "expected_report.json",
      format: "JSON",
      preview:
        '{\n  "variants": [\n    {"gene": "BRAF", "hgvs": "p.V600E", "tier": "I",\n     "pathogenicity": 0.98, "actionable": true},\n    {"gene": "TP53", "hgvs": "p.R175H", "tier": "I",\n     "pathogenicity": 0.95, "actionable": false}\n  ],\n  "summary": {"tier_I": 2, "tier_II": 5, "vus": 18}\n}',
    },
    parameters: [
      { name: "--input", type: "path", default: "—", required: true, description: "Input somatic VCF (bgzipped)." },
      { name: "--assembly", type: "enum", default: "GRCh38", required: false, description: "Reference assembly (GRCh37 | GRCh38)." },
      { name: "--min-af", type: "float", default: "0.05", required: false, description: "Minimum variant allele fraction." },
    ],
    license: {
      type: "dual",
      spdx: "Apache-2.0 / Commercial",
      name: "Academic-free, commercial license",
      terms:
        "Apache-2.0 for academic and non-commercial use. Commercial / clinical deployment requires a Meridian Therapeutics commercial license.",
    },
    pricing: {
      model: "dual",
      currency: "USD",
      academicLabel: "Free for academic use",
      commercialAmount: 9000,
      runAmount: 0.9,
      unit: "commercial site / yr",
    },
    stats: { runs: 9320, citations: 51, downloads: 3870, stars: 688, rating: 4.7, reviewCount: 31 },
    reviews: [
      {
        author: "Dr. Anika Brandt",
        affiliation: "Molecular Tumor Board, St. Eldon Hospital",
        rating: 5,
        date: "2025-06-10",
        body: "Deterministic reports we can actually defend in a tumor board. The pinned reference snapshot is the detail everyone else skips.",
      },
    ],
    readme:
      "# VarSig\n\nTransparent somatic variant interpretation.\n\n```bash\nnextflow run main.nf --input test/sample.vcf.gz --assembly GRCh38\n```\n\nReproduces `test/expected_report.json` exactly (structural JSON match).",
    createdAt: "2025-03-15",
    updatedAt: "2025-06-01",
    featured: true,
    verification: {
      id: "ver-varsig-214",
      status: "verified",
      startedAt: "2025-06-01T09:31:00Z",
      finishedAt: "2025-06-01T09:44:22Z",
      durationSec: 802,
      verifierVersion: "codon-verifier 0.9.2",
      baseImage: "nextflow/nextflow:24.10.0",
      imageDigest: hash("sha256", "varsig-image-214"),
      inputHash: hash("blake3", "varsig-input"),
      expectedOutputHash: hash("blake3", "varsig-expected"),
      actualOutputHash: hash("blake3", "varsig-expected"),
      toleranceProfile: "structural: JSON key/value exact match; floats atol 1e-6",
      runExitCode: 0,
      runWallSec: 524,
      peakMemoryMb: 5120,
      buildSteps: [
        { label: "Resolve container images (3 processes)", status: "ok", durationSec: 142 },
        { label: "Pin reference snapshot manifest", status: "ok", durationSec: 36 },
        { label: "Build OCI image", status: "ok", durationSec: 100 },
        { label: "Sandbox pipeline run", status: "ok", durationSec: 524 },
      ],
      resourceLimits: {
        cpu: "8 vCPU",
        memory: "16 GB",
        timeout: "45 min",
        egress: "none (network disabled)",
        outputCap: "1 GB",
      },
      diff: [
        {
          name: "report.json",
          kind: "structural",
          status: "match",
          detail: "All 25 variant records and summary counts match expected keys/values.",
          tolerance: "exact (structural)",
        },
        {
          name: "pathogenicity scores",
          kind: "numeric",
          status: "match",
          detail: "Per-variant scores within atol 1e-6.",
          tolerance: "atol 1e-6",
        },
      ],
    },
  },

  {
    id: "m-dockstream",
    slug: "dockstream-ad",
    title: "DockStream-AD",
    summary:
      "Ensemble molecular docking protocol with consensus rescoring for small-molecule virtual screening.",
    description: [
      "DockStream-AD orchestrates ensemble docking across multiple receptor conformations and applies a consensus rescoring function to rank candidate ligands.",
      "Because docking depends on the proprietary AutoDock Vina binary, the method is verified in declared-external-tool mode: Codon confirms the pipeline, scoring, and output schema reproduce on a provisioned licensed runner, and the listing flags the external requirement.",
      "The sample screens 12 ligands against a kinase ensemble and reproduces the ranked affinity table.",
    ],
    sellerId: "seller-salomon",
    institutionId: "inst-baysb",
    fields: ["Structural biology"],
    organisms: ["Human"],
    dataTypes: ["PDB / structures"],
    language: "Python",
    status: "published",
    paperDoi: "10.1021/acs.jcim.5c00219",
    paperTitle: "Consensus ensemble docking for robust virtual screening",
    codonId: "codon.2025.00731",
    version: "1.0.2",
    versionHistory: [
      { version: "1.0.2", date: "2025-05-30", note: "Verified with external dependency (AutoDock Vina)", status: "external-dep" },
    ],
    externalTools: [
      { name: "AutoDock Vina", version: "1.2.5", kind: "proprietary", licenseNote: "Apache-2.0 binary; provisioned on Codon licensed runner." },
      { name: "Open Babel", version: "3.1.1", kind: "open", licenseNote: "GPL-2.0; bundled in image." },
    ],    files: [
      { name: "dockstream/", kind: "dir", children: [
        { name: "ensemble.py", kind: "file", fileType: "code", size: "14.9 KB" },
        { name: "rescore.py", kind: "file", fileType: "code", size: "8.2 KB" },
        { name: "prepare.py", kind: "file", fileType: "code", size: "6.0 KB" },
      ] },
      { name: "receptors/ensemble.pdbqt", kind: "file", fileType: "data", size: "1.9 MB" },
      { name: "requirements.txt", kind: "file", fileType: "env", size: "640 B" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "1.6 KB" },
      { name: "test/ligands.smi", kind: "file", fileType: "data", size: "2.1 KB" },
      { name: "test/expected_ranking.csv", kind: "file", fileType: "data", size: "1.3 KB" },
      { name: "README.md", kind: "file", fileType: "doc", size: "8.8 KB" },
    ],
    sampleInput: {
      name: "ligands.smi",
      format: "SMILES",
      preview:
        "CC(=O)Oc1ccccc1C(=O)O aspirin\nCC(C)Cc1ccc(cc1)C(C)C(=O)O ibuprofen\nCN1C=NC2=C1C(=O)N(C(=O)N2C)C caffeine\n...",
    },
    expectedOutput: {
      name: "expected_ranking.csv",
      format: "CSV",
      preview:
        "ligand,consensus_score,vina_kcal_mol,rank\nlig_07,-9.84,-10.2,1\nlig_02,-9.11,-9.6,2\nlig_11,-8.77,-9.1,3\n...",
    },
    parameters: [
      { name: "--receptors", type: "path", default: "receptors/ensemble.pdbqt", required: true, description: "Receptor ensemble in PDBQT." },
      { name: "--exhaustiveness", type: "int", default: "16", required: false, description: "Vina search exhaustiveness." },
      { name: "--seed", type: "int", default: "42", required: false, description: "Docking random seed." },
    ],
    license: {
      type: "open",
      spdx: "MIT",
      name: "MIT (open source)",
      terms: "MIT licensed. Note: requires AutoDock Vina, which carries its own license terms.",
    },
    pricing: {
      model: "free",
      currency: "USD",
      runAmount: 3.2,
    },
    stats: { runs: 2740, citations: 19, downloads: 1530, stars: 233, rating: 4.5, reviewCount: 12 },
    reviews: [
      {
        author: "Dr. Oluwaseun Bello",
        affiliation: "Medicinal Chemistry, Coastline Pharma",
        rating: 4,
        date: "2025-06-05",
        body: "Consensus rescoring gave us a cleaner shortlist than single-receptor docking. Nice that Codon handled the Vina licensing on the run node.",
      },
    ],
    readme:
      "# DockStream-AD\n\nEnsemble docking with consensus rescoring.\n\n> Requires AutoDock Vina (provisioned on Codon licensed runners).\n\n```bash\npython -m dockstream.ensemble --receptors receptors/ensemble.pdbqt \\\n  --ligands test/ligands.smi --seed 42\n```",
    createdAt: "2025-05-30",
    updatedAt: "2025-05-30",
    featured: false,
    verification: {
      id: "ver-dockstream-102",
      status: "external-dep",
      startedAt: "2025-05-30T18:10:00Z",
      finishedAt: "2025-05-30T18:27:40Z",
      durationSec: 1060,
      verifierVersion: "codon-verifier 0.9.2",
      baseImage: "ubuntu:22.04 + Vina 1.2.5 (licensed runner)",
      imageDigest: hash("sha256", "dockstream-image-102"),
      inputHash: hash("blake3", "dockstream-input"),
      expectedOutputHash: hash("blake3", "dockstream-expected"),
      actualOutputHash: hash("blake3", "dockstream-expected"),
      toleranceProfile: "numeric: scores atol 0.05 kcal/mol; ranking exact",
      runExitCode: 0,
      runWallSec: 879,
      peakMemoryMb: 2240,
      buildSteps: [
        { label: "Build base image + Open Babel", status: "ok", durationSec: 121 },
        { label: "Attach licensed AutoDock Vina runner", status: "ok", durationSec: 44 },
        { label: "Pin dependency graph (38 packages)", status: "ok", durationSec: 16 },
        { label: "Sandbox docking run (12 ligands)", status: "ok", durationSec: 879 },
      ],
      resourceLimits: {
        cpu: "8 vCPU",
        memory: "8 GB",
        timeout: "60 min",
        egress: "none (network disabled)",
        outputCap: "512 MB",
      },
      diff: [
        { name: "ranking order", kind: "exact", status: "match", detail: "Top-12 ranking identical to expected.", tolerance: "exact" },
        { name: "consensus_score", kind: "numeric", status: "match", detail: "Within atol 0.05 kcal/mol (max Δ = 0.03).", tolerance: "atol 0.05" },
      ],
      notes:
        "Verified with external dependency: AutoDock Vina is proprietary-adjacent and provisioned on an isolated licensed runner. The badge reflects reproducibility under that declared dependency.",
    },
  },

  {
    id: "m-neuroseg",
    slug: "neuroseg3d",
    title: "NeuroSeg3D",
    summary:
      "Deep-learning segmentation of chronic stroke lesions from 3D T1/FLAIR brain MRI with volumetric reporting.",
    description: [
      "NeuroSeg3D is a 3D U-Net pipeline that segments chronic stroke lesions from co-registered T1 and FLAIR volumes and outputs lesion masks plus a volumetric report.",
      "The artifact ships pinned model weights and reproduces the held-out test subject's Dice score and lesion volume from a single anonymized scan pair.",
      "Inference runs on CPU in the sandbox; a GPU path is available for the Run service.",
    ],
    sellerId: "seller-vasquez",
    institutionId: "inst-northcrest",
    fields: ["Neuroimaging"],
    organisms: ["Human"],
    dataTypes: ["MRI"],
    language: "Python",
    status: "published",
    paperDoi: "10.1016/j.media.2025.103217",
    paperTitle: "Robust 3D segmentation of chronic stroke lesions across scanners",
    codonId: "codon.2025.00588",
    version: "1.1.0",
    versionHistory: [
      { version: "1.1.0", date: "2025-05-22", note: "Cross-scanner weights; reproduced", status: "verified" },
      { version: "1.0.0", date: "2025-03-30", note: "Initial verified release", status: "verified" },
    ],
    externalTools: [],    files: [
      { name: "neuroseg/", kind: "dir", children: [
        { name: "model.py", kind: "file", fileType: "code", size: "16.7 KB" },
        { name: "infer.py", kind: "file", fileType: "code", size: "7.4 KB" },
        { name: "report.py", kind: "file", fileType: "code", size: "5.1 KB" },
      ] },
      { name: "weights/unet3d.pt", kind: "file", fileType: "data", size: "58 MB" },
      { name: "requirements.txt", kind: "file", fileType: "env", size: "720 B" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "1.2 KB" },
      { name: "test/sub-001_T1.nii.gz", kind: "file", fileType: "data", size: "6.4 MB" },
      { name: "test/expected_mask.nii.gz", kind: "file", fileType: "data", size: "211 KB" },
      { name: "README.md", kind: "file", fileType: "doc", size: "9.5 KB" },
    ],
    sampleInput: {
      name: "sub-001_T1.nii.gz",
      format: "NIfTI (3D, 1mm iso)",
      preview:
        "NIfTI-1 volume\n  dim:      [3, 182, 218, 182]\n  pixdim:   [1.0, 1.0, 1.0] mm\n  datatype: FLOAT32\n  paired:   sub-001_FLAIR.nii.gz",
    },
    expectedOutput: {
      name: "expected_mask.nii.gz",
      format: "NIfTI (binary mask) + JSON",
      preview:
        '{\n  "lesion_volume_ml": 23.7,\n  "dice_vs_reference": 0.871,\n  "n_components": 2,\n  "hemisphere": "left"\n}',
    },
    parameters: [
      { name: "--t1", type: "path", default: "—", required: true, description: "T1-weighted NIfTI volume." },
      { name: "--flair", type: "path", default: "—", required: true, description: "Co-registered FLAIR NIfTI volume." },
      { name: "--threshold", type: "float", default: "0.5", required: false, description: "Probability threshold for the mask." },
    ],
    license: {
      type: "commercial",
      spdx: "Proprietary",
      name: "Direct paid license",
      terms:
        "Proprietary research license sold by Northcrest UMC. Includes model weights and a non-redistribution clause.",
    },
    pricing: {
      model: "paid",
      currency: "USD",
      amount: 1500,
      runAmount: 2.5,
      unit: "research license",
    },
    stats: { runs: 1880, citations: 14, downloads: 540, stars: 176, rating: 4.6, reviewCount: 9 },
    reviews: [
      {
        author: "Dr. Sofia Marchetti",
        affiliation: "Stroke Imaging Unit, Riveredge Hospital",
        rating: 5,
        date: "2025-05-27",
        body: "Reproduced the published Dice on our scanner without retraining. The volumetric report drops straight into our workflow.",
      },
    ],
    readme:
      "# NeuroSeg3D\n\n3D stroke lesion segmentation.\n\n```bash\npython -m neuroseg.infer --t1 test/sub-001_T1.nii.gz \\\n  --flair test/sub-001_FLAIR.nii.gz --out results/\n```\n\nReproduces lesion volume (ml) and Dice within tolerance.",
    createdAt: "2025-03-30",
    updatedAt: "2025-05-22",
    featured: true,
    verification: {
      id: "ver-neuroseg-110",
      status: "verified",
      startedAt: "2025-05-22T11:00:00Z",
      finishedAt: "2025-05-22T11:06:18Z",
      durationSec: 378,
      verifierVersion: "codon-verifier 0.9.2",
      baseImage: "python:3.10-slim",
      imageDigest: hash("sha256", "neuroseg-image-110"),
      inputHash: hash("blake3", "neuroseg-input"),
      expectedOutputHash: hash("blake3", "neuroseg-expected"),
      actualOutputHash: hash("blake3", "neuroseg-expected"),
      toleranceProfile: "numeric: lesion volume atol 0.1 ml; Dice atol 1e-3; mask checksum",
      runExitCode: 0,
      runWallSec: 198,
      peakMemoryMb: 6400,
      buildSteps: [
        { label: "Resolve pip requirements (pinned)", status: "ok", durationSec: 71 },
        { label: "Build OCI image + load weights", status: "ok", durationSec: 92 },
        { label: "Pin dependency graph (61 packages)", status: "ok", durationSec: 9 },
        { label: "Sandbox CPU inference", status: "ok", durationSec: 198 },
      ],
      resourceLimits: {
        cpu: "8 vCPU",
        memory: "16 GB",
        timeout: "30 min",
        egress: "none (network disabled)",
        outputCap: "512 MB",
      },
      diff: [
        { name: "lesion_volume_ml", kind: "numeric", status: "match", detail: "23.7 ml vs 23.7 ml (Δ = 0.02).", tolerance: "atol 0.1 ml" },
        { name: "dice_vs_reference", kind: "numeric", status: "match", detail: "0.871 vs 0.871 (Δ = 4e-4).", tolerance: "atol 1e-3" },
        { name: "mask.nii.gz", kind: "checksum", status: "match", detail: "Binary mask checksum identical after canonicalization.", tolerance: "checksum" },
      ],
    },
  },

  {
    id: "m-spatialdecon",
    slug: "spatialdecon-x",
    title: "SpatialDecon-X",
    summary:
      "Reference-based cell-type deconvolution for spatial transcriptomics (Visium & MERFISH) with spatial regularization.",
    description: [
      "SpatialDecon-X estimates per-spot cell-type proportions from spatial transcriptomics using a single-cell reference and a spatial smoothness prior.",
      "The R package reproduces the cortex benchmark proportion matrix from a 500-spot Visium sample.",
    ],
    sellerId: "seller-tanaka",
    institutionId: "inst-lindgren",
    fields: ["Spatial transcriptomics", "Single-cell"],
    organisms: ["Mouse", "Human"],
    dataTypes: ["Visium", "MERFISH", "scRNA-seq"],
    language: "R",
    status: "published",
    paperDoi: "10.1101/2025.02.14.580221",
    paperTitle: "Spatially regularized deconvolution of tissue transcriptomes",
    codonId: "codon.2025.00509",
    version: "0.9.1",
    versionHistory: [
      { version: "0.9.1", date: "2025-04-28", note: "renv lockfile; reproduced", status: "verified" },
    ],
    externalTools: [],    files: [
      { name: "R/", kind: "dir", children: [
        { name: "deconvolve.R", kind: "file", fileType: "code", size: "10.2 KB" },
        { name: "spatial_prior.R", kind: "file", fileType: "code", size: "6.6 KB" },
      ] },
      { name: "renv.lock", kind: "file", fileType: "env", size: "18 KB" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "1.0 KB" },
      { name: "data/visium_sample.rds", kind: "file", fileType: "data", size: "9.1 MB" },
      { name: "data/expected_proportions.csv", kind: "file", fileType: "data", size: "120 KB" },
      { name: "README.md", kind: "file", fileType: "doc", size: "6.2 KB" },
    ],
    sampleInput: {
      name: "visium_sample.rds",
      format: "RDS (SpatialExperiment)",
      preview:
        "class: SpatialExperiment\n  dim: 18000 500\n  assays: counts\n  spatialCoords: x, y\n  reference: cortex_sc_ref (7 cell types)",
    },
    expectedOutput: {
      name: "expected_proportions.csv",
      format: "CSV (500 × 7)",
      preview:
        "spot,ExN,InN,Astro,Oligo,OPC,Micro,Endo\nspot_1,0.61,0.12,0.10,0.08,0.03,0.04,0.02\nspot_2,0.20,0.07,0.41,0.18,0.05,0.06,0.03\n...",
    },
    parameters: [
      { name: "--reference", type: "path", default: "cortex_sc_ref", required: true, description: "Annotated single-cell reference." },
      { name: "--lambda", type: "float", default: "0.4", required: false, description: "Spatial smoothness weight." },
    ],
    license: {
      type: "open",
      spdx: "GPL-3.0",
      name: "GPL-3.0 (open source)",
      terms: "Free and open under GPL-3.0.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 1.2 },
    stats: { runs: 3310, citations: 22, downloads: 2040, stars: 297, rating: 4.6, reviewCount: 15 },
    reviews: [],
    readme:
      "# SpatialDecon-X\n\nSpatially regularized deconvolution.\n\n```r\nlibrary(SpatialDeconX)\nres <- deconvolve('data/visium_sample.rds', reference = 'cortex_sc_ref', lambda = 0.4)\n```",
    createdAt: "2025-04-28",
    updatedAt: "2025-04-28",
    featured: false,
    verification: {
      id: "ver-spatialdecon-091",
      status: "verified",
      startedAt: "2025-04-28T16:20:00Z",
      finishedAt: "2025-04-28T16:25:41Z",
      durationSec: 341,
      verifierVersion: "codon-verifier 0.9.1",
      baseImage: "rocker/r-ver:4.4.1",
      imageDigest: hash("sha256", "spatialdecon-image-091"),
      inputHash: hash("blake3", "spatialdecon-input"),
      expectedOutputHash: hash("blake3", "spatialdecon-expected"),
      actualOutputHash: hash("blake3", "spatialdecon-expected"),
      toleranceProfile: "numeric: proportions atol 1e-3 (rows sum to 1)",
      runExitCode: 0,
      runWallSec: 188,
      peakMemoryMb: 4100,
      buildSteps: [
        { label: "Restore renv lockfile (203 packages)", status: "ok", durationSec: 121 },
        { label: "Build OCI image", status: "ok", durationSec: 26 },
        { label: "Sandbox run on Visium sample", status: "ok", durationSec: 188 },
      ],
      resourceLimits: {
        cpu: "4 vCPU",
        memory: "8 GB",
        timeout: "30 min",
        egress: "none (network disabled)",
        outputCap: "256 MB",
      },
      diff: [
        { name: "proportions.csv", kind: "numeric", status: "match", detail: "500×7 matrix within atol 1e-3; rows sum to 1.000.", tolerance: "atol 1e-3" },
      ],
    },
  },

  {
    id: "m-protmpnn",
    slug: "protmpnn-tune",
    title: "ProtMPNN-Tune",
    summary:
      "Fine-tuning toolkit for inverse-folding protein sequence design with fixed-backbone constraints.",
    description: [
      "ProtMPNN-Tune fine-tunes a message-passing inverse-folding model to design sequences for a target backbone under user-specified position constraints.",
      "The verified sample designs sequences for a small fixed backbone and reproduces the recovery-rate metric and the top sequence.",
    ],
    sellerId: "seller-nair",
    institutionId: "inst-thorne",
    fields: ["Protein design"],
    organisms: ["Pan-species"],
    dataTypes: ["PDB / structures"],
    language: "Python",
    status: "published",
    paperDoi: "10.1126/science.adp9921",
    paperTitle: "Constraint-aware fine-tuning for inverse protein folding",
    codonId: "codon.2025.00640",
    version: "0.4.0",
    versionHistory: [
      { version: "0.4.0", date: "2025-05-09", note: "Constraint API; reproduced", status: "verified" },
    ],
    externalTools: [
      { name: "CUDA Runtime", version: "12.4", kind: "gpu", licenseNote: "Optional GPU acceleration on the Run service." },
    ],    files: [
      { name: "protmpnn_tune/", kind: "dir", children: [
        { name: "design.py", kind: "file", fileType: "code", size: "12.1 KB" },
        { name: "constraints.py", kind: "file", fileType: "code", size: "5.4 KB" },
      ] },
      { name: "pyproject.toml", kind: "file", fileType: "env", size: "1.3 KB" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "980 B" },
      { name: "test/backbone.pdb", kind: "file", fileType: "data", size: "88 KB" },
      { name: "test/expected_design.json", kind: "file", fileType: "data", size: "4 KB" },
      { name: "README.md", kind: "file", fileType: "doc", size: "5.0 KB" },
    ],
    sampleInput: {
      name: "backbone.pdb",
      format: "PDB (fixed backbone)",
      preview:
        "HEADER    DE NOVO BACKBONE\nATOM      1  N   GLY A   1      11.104  6.134  ...\nATOM      2  CA  GLY A   1      12.560  6.057  ...\n... (64 residues)",
    },
    expectedOutput: {
      name: "expected_design.json",
      format: "JSON",
      preview:
        '{\n  "top_sequence": "MKTAYIAKQR...",\n  "recovery_rate": 0.486,\n  "n_designs": 8,\n  "mean_score": -1.27\n}',
    },
    parameters: [
      { name: "--backbone", type: "path", default: "—", required: true, description: "Fixed-backbone PDB." },
      { name: "--fix", type: "list", default: "[]", required: false, description: "Positions to hold fixed." },
      { name: "--temperature", type: "float", default: "0.1", required: false, description: "Sampling temperature." },
      { name: "--seed", type: "int", default: "0", required: false, description: "Random seed." },
    ],
    license: {
      type: "open",
      spdx: "MIT",
      name: "MIT (open source)",
      terms: "MIT licensed. Free for any use including commercial.",
    },
    pricing: { model: "free", currency: "USD", runAmount: 4.0 },
    stats: { runs: 5210, citations: 27, downloads: 4120, stars: 901, rating: 4.9, reviewCount: 19 },
    reviews: [
      {
        author: "Dr. Elias Norén",
        affiliation: "Protein Engineering, Vantage Bio",
        rating: 5,
        date: "2025-05-20",
        body: "Cleanest inverse-folding fine-tuning code I've used. Reproduced the recovery rate to the third decimal on first run.",
      },
    ],
    readme:
      "# ProtMPNN-Tune\n\nConstraint-aware inverse folding.\n\n```bash\nprotmpnn-tune design --backbone test/backbone.pdb --temperature 0.1 --seed 0\n```",
    createdAt: "2025-05-09",
    updatedAt: "2025-05-09",
    featured: false,
    verification: {
      id: "ver-protmpnn-040",
      status: "verified",
      startedAt: "2025-05-09T13:00:00Z",
      finishedAt: "2025-05-09T13:05:02Z",
      durationSec: 302,
      verifierVersion: "codon-verifier 0.9.2",
      baseImage: "python:3.11-slim",
      imageDigest: hash("sha256", "protmpnn-image-040"),
      inputHash: hash("blake3", "protmpnn-input"),
      expectedOutputHash: hash("blake3", "protmpnn-expected"),
      actualOutputHash: hash("blake3", "protmpnn-expected"),
      toleranceProfile: "exact: top sequence string; numeric: recovery atol 1e-3",
      runExitCode: 0,
      runWallSec: 142,
      peakMemoryMb: 2960,
      buildSteps: [
        { label: "Resolve pyproject (uv lock)", status: "ok", durationSec: 58 },
        { label: "Build OCI image", status: "ok", durationSec: 79 },
        { label: "Pin dependency graph (47 packages)", status: "ok", durationSec: 7 },
        { label: "Sandbox design run (seed 0)", status: "ok", durationSec: 142 },
      ],
      resourceLimits: {
        cpu: "4 vCPU",
        memory: "8 GB",
        timeout: "20 min",
        egress: "none (network disabled)",
        outputCap: "128 MB",
      },
      diff: [
        { name: "top_sequence", kind: "exact", status: "match", detail: "64-residue sequence identical to expected.", tolerance: "exact" },
        { name: "recovery_rate", kind: "numeric", status: "match", detail: "0.486 vs 0.486 (Δ = 2e-4).", tolerance: "atol 1e-3" },
      ],
    },
  },

  {
    id: "m-cryorefine",
    slug: "cryorefine",
    title: "CryoRefine",
    summary:
      "GPU-accelerated cryo-EM density map refinement with per-particle defocus and B-factor optimization.",
    description: [
      "CryoRefine performs iterative refinement of cryo-EM reconstructions, optimizing per-particle CTF parameters and applying adaptive B-factor sharpening.",
      "This version is currently re-verifying after a base-image update; the previous release was verified.",
    ],
    sellerId: "seller-eskildsen",
    institutionId: "inst-baysb",
    fields: ["Cryo-EM", "Structural biology"],
    organisms: ["Pan-species"],
    dataTypes: ["PDB / structures"],
    language: "C++",
    status: "verifying",
    paperDoi: "10.1107/S2059798325004112",
    paperTitle: "Adaptive per-particle refinement for high-resolution cryo-EM",
    codonId: "codon.2025.00802",
    version: "3.0.0-rc1",
    versionHistory: [
      { version: "3.0.0-rc1", date: "2025-06-18", note: "Re-verifying after CUDA base-image bump", status: "pending" },
      { version: "2.4.0", date: "2025-03-02", note: "Verified", status: "verified" },
    ],
    externalTools: [
      { name: "CUDA Toolkit", version: "12.4", kind: "gpu", licenseNote: "Required; provisioned on GPU runner." },
    ],    files: [
      { name: "src/", kind: "dir", children: [
        { name: "refine.cpp", kind: "file", fileType: "code", size: "41 KB" },
        { name: "ctf.cu", kind: "file", fileType: "code", size: "19 KB" },
      ] },
      { name: "CMakeLists.txt", kind: "file", fileType: "config", size: "2.1 KB" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "2.4 KB" },
      { name: "test/map_half1.mrc", kind: "file", fileType: "data", size: "64 MB" },
      { name: "test/expected_fsc.csv", kind: "file", fileType: "data", size: "12 KB" },
      { name: "README.md", kind: "file", fileType: "doc", size: "10 KB" },
    ],
    sampleInput: {
      name: "map_half1.mrc",
      format: "MRC (half map)",
      preview:
        "MRC2014 volume\n  dim:    256 256 256\n  apix:   1.06 Å\n  paired: map_half2.mrc, particles.star",
    },
    expectedOutput: {
      name: "expected_fsc.csv",
      format: "CSV (FSC curve)",
      preview:
        "shell,resolution_A,fsc\n1,18.4,0.998\n2,12.1,0.991\n...\n80,3.21,0.143",
    },
    parameters: [
      { name: "--half1", type: "path", default: "—", required: true, description: "First half map (MRC)." },
      { name: "--iterations", type: "int", default: "12", required: false, description: "Refinement iterations." },
    ],
    license: {
      type: "dual",
      spdx: "BSD-3-Clause / Commercial",
      name: "Academic-free, commercial license",
      terms: "BSD-3-Clause for academic use; commercial license via BASB Center.",
    },
    pricing: { model: "dual", currency: "USD", academicLabel: "Free for academic use", commercialAmount: 6000, runAmount: 12.0, unit: "commercial seat / yr" },
    stats: { runs: 990, citations: 9, downloads: 410, stars: 142, rating: 4.4, reviewCount: 5 },
    reviews: [],
    readme:
      "# CryoRefine\n\nAdaptive per-particle cryo-EM refinement (GPU).\n\n```bash\ncryorefine --half1 test/map_half1.mrc --half2 test/map_half2.mrc --iterations 12\n```",
    createdAt: "2025-03-02",
    updatedAt: "2025-06-18",
    featured: false,
    verification: {
      id: "ver-cryorefine-300rc1",
      status: "pending",
      startedAt: "2025-06-18T08:00:00Z",
      finishedAt: "—",
      durationSec: 0,
      verifierVersion: "codon-verifier 0.9.2",
      baseImage: "nvidia/cuda:12.4.0-runtime-ubuntu22.04",
      imageDigest: "—",
      inputHash: hash("blake3", "cryorefine-input"),
      expectedOutputHash: hash("blake3", "cryorefine-expected"),
      actualOutputHash: "—",
      toleranceProfile: "numeric: FSC atol 5e-3; resolution at 0.143 atol 0.02 Å",
      runExitCode: -1,
      runWallSec: 0,
      peakMemoryMb: 0,
      buildSteps: [
        { label: "Build CUDA base image", status: "ok", durationSec: 240 },
        { label: "Compile CryoRefine (CMake)", status: "ok", durationSec: 360 },
        { label: "Attach GPU runner", status: "ok", durationSec: 30 },
        { label: "Sandbox refinement run", status: "skip", durationSec: 0 },
      ],
      resourceLimits: {
        cpu: "16 vCPU",
        memory: "32 GB",
        timeout: "120 min",
        egress: "none (network disabled)",
        outputCap: "2 GB",
      },
      diff: [],
      notes: "Re-verification in progress after a CUDA base-image update. Badge held at 'verifying' until the run completes.",
    },
  },

  {
    id: "m-popadmix",
    slug: "popadmix",
    title: "PopAdmix",
    summary:
      "Scalable admixture and ancestry-proportion inference from genotype arrays with bootstrap confidence intervals.",
    description: [
      "PopAdmix estimates individual ancestry proportions and population allele frequencies from genotype data, with block-bootstrap confidence intervals.",
      "The Snakemake workflow reproduces the K=4 ancestry-proportion table and log-likelihood for a 300-individual sample.",
    ],
    sellerId: "seller-mbeki",
    institutionId: "inst-thorne",
    fields: ["Population genetics", "Genomics / variants"],
    organisms: ["Human"],
    dataTypes: ["Genotype array"],
    language: "Snakemake",
    status: "published",
    paperDoi: "10.1534/genetics.125.301552",
    paperTitle: "Fast admixture inference with calibrated uncertainty",
    codonId: "codon.2025.00455",
    version: "1.5.2",
    versionHistory: [
      { version: "1.5.2", date: "2025-04-02", note: "Verified", status: "verified" },
    ],
    externalTools: [],    files: [
      { name: "Snakefile", kind: "file", fileType: "code", size: "4.8 KB" },
      { name: "scripts/admix.cpp", kind: "file", fileType: "code", size: "28 KB" },
      { name: "envs/admix.yaml", kind: "file", fileType: "env", size: "560 B" },
      { name: "Dockerfile", kind: "file", fileType: "config", size: "900 B" },
      { name: "test/genotypes.bed", kind: "file", fileType: "data", size: "3.2 MB" },
      { name: "test/expected_Q.tsv", kind: "file", fileType: "data", size: "44 KB" },
      { name: "README.md", kind: "file", fileType: "doc", size: "6.8 KB" },
    ],
    sampleInput: {
      name: "genotypes.bed",
      format: "PLINK binary (.bed/.bim/.fam)",
      preview:
        "PLINK 1.9 binary\n  samples: 300\n  variants: 48,210\n  K target: 4",
    },
    expectedOutput: {
      name: "expected_Q.tsv",
      format: "TSV (300 × 4)",
      preview:
        "sample\tK1\tK2\tK3\tK4\nID0001\t0.71\t0.10\t0.14\t0.05\nID0002\t0.08\t0.66\t0.21\t0.05\n...",
    },
    parameters: [
      { name: "--K", type: "int", default: "4", required: true, description: "Number of ancestral populations." },
      { name: "--bootstraps", type: "int", default: "100", required: false, description: "Block-bootstrap replicates." },
      { name: "--seed", type: "int", default: "1", required: false, description: "Random seed." },
    ],
    license: {
      type: "sponsored",
      spdx: "MIT",
      name: "Institution-sponsored (free to public)",
      terms:
        "Thorne University sponsors hosting so this method is free to the public. MIT licensed.",
    },
    pricing: { model: "sponsored", currency: "USD", sponsoredBy: "Thorne University", runAmount: 0.6 },
    stats: { runs: 6740, citations: 33, downloads: 5210, stars: 350, rating: 4.7, reviewCount: 18 },
    reviews: [],
    readme:
      "# PopAdmix\n\nScalable admixture inference.\n\n```bash\nsnakemake --use-conda --cores 8 results/Q.tsv\n```",
    createdAt: "2025-04-02",
    updatedAt: "2025-04-02",
    featured: false,
    verification: {
      id: "ver-popadmix-152",
      status: "verified",
      startedAt: "2025-04-02T10:15:00Z",
      finishedAt: "2025-04-02T10:21:33Z",
      durationSec: 393,
      verifierVersion: "codon-verifier 0.9.1",
      baseImage: "snakemake/snakemake:v8.10.0",
      imageDigest: hash("sha256", "popadmix-image-152"),
      inputHash: hash("blake3", "popadmix-input"),
      expectedOutputHash: hash("blake3", "popadmix-expected"),
      actualOutputHash: hash("blake3", "popadmix-expected"),
      toleranceProfile: "numeric: Q matrix atol 1e-2; log-likelihood atol 1e-1",
      runExitCode: 0,
      runWallSec: 233,
      peakMemoryMb: 2800,
      buildSteps: [
        { label: "Resolve conda envs", status: "ok", durationSec: 88 },
        { label: "Compile admix (g++ -O3)", status: "ok", durationSec: 54 },
        { label: "Build OCI image", status: "ok", durationSec: 18 },
        { label: "Sandbox workflow run", status: "ok", durationSec: 233 },
      ],
      resourceLimits: {
        cpu: "8 vCPU",
        memory: "8 GB",
        timeout: "30 min",
        egress: "none (network disabled)",
        outputCap: "256 MB",
      },
      diff: [
        { name: "Q.tsv", kind: "numeric", status: "match", detail: "300×4 ancestry matrix within atol 1e-2 after label matching.", tolerance: "atol 1e-2" },
        { name: "log-likelihood", kind: "numeric", status: "match", detail: "−1.284e6 vs −1.284e6.", tolerance: "atol 1e-1" },
      ],
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Free / open methods — bulk catalog for stress-testing browse, search,       */
/* facets, and the verification engine.                                        */
/* -------------------------------------------------------------------------- */

function makeFreeVerification(n: number): Verification {
  return {
    id: `ver-free-${n}`,
    status: "verified",
    startedAt: "2026-05-01T10:00:00Z",
    finishedAt: "2026-05-01T10:04:00Z",
    durationSec: 240,
    verifierVersion: "codon-verifier 0.9.2",
    baseImage: "python:3.11-slim",
    imageDigest: hash("sha256", `free-img-${n}`),
    inputHash: hash("blake3", `free-in-${n}`),
    expectedOutputHash: hash("blake3", `free-exp-${n}`),
    actualOutputHash: hash("blake3", `free-exp-${n}`),
    toleranceProfile: "numeric: atol 1e-6",
    runExitCode: 0,
    runWallSec: 120,
    peakMemoryMb: 2048,
    buildSteps: [
      { label: "Build OCI image", status: "ok", durationSec: 60 },
      { label: "Pin dependency graph", status: "ok", durationSec: 12 },
      { label: "Sandbox run on sample input", status: "ok", durationSec: 120 },
    ],
    resourceLimits: {
      cpu: "4 vCPU",
      memory: "8 GB",
      timeout: "20 min",
      egress: "none (network disabled)",
      outputCap: "256 MB",
    },
    diff: [
      { name: "output.csv", kind: "numeric", status: "match", detail: "Within tolerance (max abs Δ = 4e-7).", tolerance: "atol 1e-6" },
    ],
  };
}

const EXT: Record<string, string> = {
  Python: "main.py",
  R: "main.R",
  "C++": "main.cpp",
  Nextflow: "main.nf",
  Snakemake: "Snakefile",
  Julia: "main.jl",
};

function generateFreeMethods(): Method[] {
  const specs: {
    title: string; slug: string; field: string; organism: string;
    dataType: string; lang: string; sellerId: string;
  }[] = [
    { title: "FastQC-Lite", slug: "fastqc-lite", field: "Genomics / variants", organism: "Human", dataType: "WGS", lang: "Python", sellerId: "seller-reyes" },
    { title: "scNorm-OS", slug: "scnorm-os", field: "Single-cell", organism: "Mouse", dataType: "scRNA-seq", lang: "R", sellerId: "seller-okafor" },
    { title: "PeakCallerX", slug: "peakcaller-x", field: "Epigenomics", organism: "Human", dataType: "ATAC-seq", lang: "Python", sellerId: "seller-mbeki" },
    { title: "AlignFast", slug: "alignfast", field: "Genomics / variants", organism: "Human", dataType: "WES", lang: "C++", sellerId: "seller-reyes" },
    { title: "SpotDecon-Free", slug: "spotdecon-free", field: "Spatial transcriptomics", organism: "Human", dataType: "Visium", lang: "R", sellerId: "seller-tanaka" },
    { title: "DockLite", slug: "docklite", field: "Structural biology", organism: "Human", dataType: "PDB / structures", lang: "Python", sellerId: "seller-salomon" },
    { title: "BrainMask-OS", slug: "brainmask-os", field: "Neuroimaging", organism: "Human", dataType: "MRI", lang: "Python", sellerId: "seller-vasquez" },
    { title: "AdmixSimple", slug: "admixsimple", field: "Population genetics", organism: "Human", dataType: "Genotype array", lang: "Snakemake", sellerId: "seller-mbeki" },
    { title: "VeloPy", slug: "velopy", field: "Single-cell", organism: "Mouse", dataType: "snRNA-seq", lang: "Python", sellerId: "seller-okafor" },
    { title: "MethylScan", slug: "methylscan", field: "Epigenomics", organism: "Human", dataType: "Methylation array", lang: "R", sellerId: "seller-okafor" },
    { title: "CryoPick-OS", slug: "cryopick-os", field: "Cryo-EM", organism: "Pan-species", dataType: "PDB / structures", lang: "Python", sellerId: "seller-eskildsen" },
    { title: "SeqDedup", slug: "seqdedup", field: "Genomics / variants", organism: "Human", dataType: "WGS", lang: "C++", sellerId: "seller-reyes" },
    { title: "ProtFold-Mini", slug: "protfold-mini", field: "Protein design", organism: "Pan-species", dataType: "PDB / structures", lang: "Python", sellerId: "seller-nair" },
    { title: "MerfishSeg-OS", slug: "merfishseg-os", field: "Spatial transcriptomics", organism: "Mouse", dataType: "MERFISH", lang: "Python", sellerId: "seller-tanaka" },
    { title: "GwasFlow", slug: "gwasflow", field: "Population genetics", organism: "Human", dataType: "Genotype array", lang: "Nextflow", sellerId: "seller-mbeki" },
    { title: "CellQC", slug: "cellqc", field: "Single-cell", organism: "Human", dataType: "scRNA-seq", lang: "Python", sellerId: "seller-okafor" },
  ];

  return specs.map((s, idx) => {
    const n = idx + 1;
    const seller = sellers.find((x) => x.id === s.sellerId)!;
    return {
      id: `m-free-${n}`,
      slug: s.slug,
      title: s.title,
      summary: `${s.title} — an open-source, reproducible ${s.field.toLowerCase()} method, independently verified on Codon.`,
      description: [
        `${s.title} is a free and open-source method for ${s.field.toLowerCase()} on ${s.dataType} data.`,
        "It ships a pinned environment and a deterministic test, and reproduces its declared expected output in the Codon sandbox.",
      ],
      sellerId: s.sellerId,
      institutionId: seller.institutionId,
      fields: [s.field],
      organisms: [s.organism],
      dataTypes: [s.dataType],
      language: s.lang,
      status: "published",
      paperDoi: `10.5555/codon.free.${1000 + n}`,
      paperTitle: `${s.title}: an open, reproducible method`,
      codonId: `codon.2026.0${900 + n}`,
      version: "1.0.0",
      versionHistory: [
        { version: "1.0.0", date: "2026-05-01", note: "Initial verified release", status: "verified" },
      ],
      externalTools: [],
      files: [
        { name: EXT[s.lang] ?? "main.py", kind: "file", fileType: "code", size: "6.2 KB" },
        { name: "environment.yml", kind: "file", fileType: "env", size: "0.8 KB" },
        { name: "test/input.dat", kind: "file", fileType: "data", size: "120 KB" },
        { name: "test/expected.csv", kind: "file", fileType: "data", size: "9 KB" },
        { name: "README.md", kind: "file", fileType: "doc", size: "4.1 KB" },
      ],
      sampleInput: { name: "input.dat", format: "text", preview: "# sample input\n0.124 0.882 0.301\n0.553 0.117 0.940" },
      expectedOutput: { name: "expected.csv", format: "CSV", preview: "id,score\n0,0.8123\n1,0.2204\n2,0.5589" },
      parameters: [
        { name: "--input", type: "path", default: "—", required: true, description: "Input file." },
        { name: "--seed", type: "int", default: "0", required: false, description: "Random seed for determinism." },
      ],
      license: { type: "open", spdx: "MIT", name: "MIT (open source)", terms: "Free and open under the MIT license, for any use." },
      pricing: { model: "free", currency: "USD", runAmount: 0.5 },
      stats: {
        runs: 200 + ((n * 137) % 4200),
        citations: (n * 7) % 42,
        downloads: 150 + ((n * 97) % 3200),
        stars: 40 + ((n * 53) % 820),
        rating: Math.round((4.2 + (n % 6) * 0.12) * 10) / 10,
        reviewCount: (n * 3) % 22,
      },
      reviews: [],
      readme: `# ${s.title}\n\nFree and open-source. Verified on Codon.\n\n\`\`\`bash\ncodon run ${s.slug} --input test/input.dat --seed 0\n\`\`\``,
      createdAt: "2026-05-01",
      updatedAt: "2026-05-01",
      featured: false,
      verification: makeFreeVerification(n),
    };
  });
}

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
    // Codon-sponsored reference methods aren't tied to a published paper, so we
    // drop the placeholder DOI and attribute them to Codon. User-submitted
    // methods keep their real DOI (the paper-link feature stays for those).
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
 * The curated reference catalog — a few real sample pipelines (neuro imaging,
 * molecular docking, single-cell). Kept deliberately small; user-submitted
 * methods are layered on top by the server data layer.
 */
const CURATED_SLUGS = ["scanpy-cluster", "neuroseg3d", "dockstream-ad", "cellineage-vi"];
export const allMethods: Method[] = methods
  .filter((m) => CURATED_SLUGS.includes(m.slug))
  .map(freeByCodon);

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

/* Aggregate platform stats for the landing page. */
export const platformStats = {
  verifiedMethods: allMethods.filter((m) => m.verification.status === "verified" || m.verification.status === "external-dep").length,
  institutions: institutions.length,
  labs: sellers.filter((s) => s.type === "lab").length,
  totalRuns: allMethods.reduce((acc, m) => acc + m.stats.runs, 0),
  citations: allMethods.reduce((acc, m) => acc + m.stats.citations, 0),
};
