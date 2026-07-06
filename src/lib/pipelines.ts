/**
 * Runnable reference pipelines. These are REAL, self-contained, deterministic
 * Python programs (stdlib only) that actually execute in the browser via Pyodide
 * (CPython compiled to WebAssembly) — the code shown is exactly the code that
 * runs, in a sealed no-network sandbox. Reproducibility is proven by executing
 * twice and confirming the output is byte-identical, then content-hashing it.
 */
export interface Pipeline {
  slug: string;
  language: "Python";
  /** Pyodide packages to load (kept empty — stdlib only — so runs boot fast). */
  packages: string[];
  /** The exact program. Reads the input from the global INPUT_DATA and prints. */
  code: string;
  sampleInput: string;
  inputLabel: string;
  /** The exact stdout the sample input reproduces — the verified reference,
   *  captured from the trusted E2B sandbox. Used to show a real
   *  "reproduces the verified result" verdict when the sample is run. */
  expectedOutput?: string;
  /** Real library methods (scanpy etc.) can't run in Pyodide — they execute in
   *  the E2B cloud sandbox via the metered server-run path, not in the browser. */
  cloudOnly?: boolean;
  /** Shown for external-dependency methods (full pipeline runs the real tool). */
  note?: string;
}

const CELLINEAGE = `# CellLineage-VI - single-cell normalization + variable genes + lineage split
import math

rows = [r for r in INPUT_DATA.strip().splitlines() if r.strip()]
header = rows[0].split(",")
genes = header[1:]
cells, mat = [], []
for r in rows[1:]:
    p = r.split(",")
    cells.append(p[0].strip())
    mat.append([float(x) for x in p[1:]])

# library-size normalize to 1e4, then log1p
norm = []
for row in mat:
    s = sum(row) or 1.0
    norm.append([math.log1p(v / s * 1e4) for v in row])

def variance(col):
    m = sum(col) / len(col)
    return sum((x - m) ** 2 for x in col) / len(col)

cols = list(zip(*norm))
ranked = sorted(((variance(list(c)), g) for c, g in zip(cols, genes)), reverse=True)
top = [g for _, g in ranked[:3]]

gi = genes.index(top[0])
scored = sorted((norm[i][gi], cells[i]) for i in range(len(cells)))
mid = len(scored) // 2
a = sorted(c for s, c in scored[:mid])
b = sorted(c for s, c in scored[mid:])

print(f"cells={len(cells)} genes={len(genes)}")
print("top_variable_genes=" + ", ".join(top))
print(f"lineage_A(n={len(a)})=" + ",".join(a))
print(f"lineage_B(n={len(b)})=" + ",".join(b))
`;

const NEUROSEG = `# NeuroSeg3D - Otsu-threshold segmentation of an intensity slice
grid, vals = [], []
for line in INPUT_DATA.strip().splitlines():
    line = line.strip()
    if not line:
        continue
    row = [int(float(x)) for x in line.replace(",", " ").split()]
    grid.append(row)
    vals += row

n = len(vals)
hist = [0] * 256
for v in vals:
    hist[max(0, min(255, v))] += 1

total_sum = sum(i * hist[i] for i in range(256))
wB = sumB = 0
best, thr = -1.0, 0
for t in range(256):
    wB += hist[t]
    if wB == 0:
        continue
    wF = n - wB
    if wF == 0:
        break
    sumB += t * hist[t]
    mB = sumB / wB
    mF = (total_sum - sumB) / wF
    between = wB * wF * (mB - mF) ** 2
    if between > best:
        best, thr = between, t

fg = [v for v in vals if v > thr]
mean_fg = sum(fg) / len(fg) if fg else 0.0
print(f"otsu_threshold={thr}")
print(f"segmented_voxels={len(fg)}/{n} ({100 * len(fg) / n:.1f}%)")
print(f"mean_intensity_fg={mean_fg:.1f}")
`;

const DOCKSTREAM = `# DockStream-AD - quick rigid docking score
# (the full verified pipeline runs AutoDock Vina on a licensed runner)
import math

lines = [l.strip() for l in INPUT_DATA.strip().splitlines() if l.strip()]
cx, cy, cz = [float(x) for x in lines[0].replace(",", " ").split()[:3]]

atoms = []
for l in lines[1:]:
    p = l.replace(",", " ").split()
    if len(p) >= 4:
        atoms.append((p[0], float(p[1]), float(p[2]), float(p[3])))

cutoff = 4.0
contacts = 0
score = 0.0
for _, x, y, z in atoms:
    d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2)
    if d < cutoff:
        contacts += 1
    score += -math.exp(-(d * d) / 8.0)

print(f"pocket_center=({cx:.1f},{cy:.1f},{cz:.1f})")
print(f"n_atoms={len(atoms)} contacts(<{cutoff:.0f}A)={contacts}")
print(f"dock_score={score:.2f} kcal/mol  (quick rigid score)")
print("note: full ensemble docking runs AutoDock Vina on the licensed runner")
`;

const SCANPY = `# scRNA-seq clustering with the real Scanpy toolkit (pinned).
# Generates a seeded synthetic dataset, then runs the canonical workflow:
# normalize -> log1p -> PCA -> k-NN graph -> Leiden community detection.
import warnings; warnings.filterwarnings("ignore")
import numpy as np, anndata as ad, scanpy as sc

np.random.seed(0)
X = np.random.poisson(1.0, size=(300, 60)).astype("float32")
X[:150, :20] += np.random.poisson(3.0, size=(150, 20))   # plant two cell populations
X[150:, 20:40] += np.random.poisson(3.0, size=(150, 20))

adata = ad.AnnData(X)
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.pca(adata, n_comps=10, svd_solver="arpack")
sc.pp.neighbors(adata, n_neighbors=15, random_state=0)
sc.tl.leiden(adata, random_state=0, flavor="igraph", n_iterations=2, directed=False)

print(f"cells={adata.n_obs} genes={adata.n_vars}")
print(f"n_clusters={int(adata.obs['leiden'].nunique())}")
print("cluster_sizes=" + str(sorted(adata.obs['leiden'].value_counts().tolist(), reverse=True)))
`;

export const PIPELINES: Record<string, Pipeline> = {
  "scanpy-cluster": {
    slug: "scanpy-cluster",
    language: "Python",
    packages: ["scanpy==1.12.2", "igraph", "leidenalg"],
    code: SCANPY,
    inputLabel: "seeded synthetic (no input needed)",
    sampleInput: "",
    cloudOnly: true,
    expectedOutput: `cells=300 genes=60
n_clusters=7
cluster_sizes=[81, 53, 48, 42, 35, 25, 16]`,
    note: "Runs the real Scanpy library (scanpy==1.12.2 + igraph + leidenalg) in an E2B cloud microVM — it can't run in the browser. Verified to reproduce byte-for-byte across independent runs.",
  },
  "cellineage-vi": {
    slug: "cellineage-vi",
    language: "Python",
    packages: [],
    code: CELLINEAGE,
    inputLabel: "counts.csv",
    sampleInput: `cell,GENE1,GENE2,GENE3,GENE4,GENE5
c1,12,0,3,5,1
c2,0,9,1,4,0
c3,15,1,2,6,0
c4,1,11,0,3,8
c5,9,0,4,5,2
c6,0,8,1,2,9`,
    expectedOutput: `cells=6 genes=5
top_variable_genes=GENE1, GENE2, GENE5
lineage_A(n=3)=c2,c4,c6
lineage_B(n=3)=c1,c3,c5`,
  },
  neuroseg3d: {
    slug: "neuroseg3d",
    language: "Python",
    packages: [],
    code: NEUROSEG,
    inputLabel: "slice.csv",
    sampleInput: `10,12,15,200,210
14,11,205,220,215
12,190,230,225,30
180,235,240,40,20
30,33,28,22,18`,
    expectedOutput: `otsu_threshold=40
segmented_voxels=11/25 (44.0%)
mean_intensity_fg=213.6`,
  },
  "dockstream-ad": {
    slug: "dockstream-ad",
    language: "Python",
    packages: [],
    code: DOCKSTREAM,
    inputLabel: "ligand.xyz",
    note: "AutoDock Vina is an external dependency — the in-browser run is a quick rigid score; the full ensemble docking runs Vina on a licensed runner.",
    sampleInput: `0 0 0
C 0.5 0.2 -0.3
N 1.2 0.0 0.4
O -0.7 0.6 0.1
C 2.5 1.0 0.0
H 0.1 -0.4 0.2
C -1.8 0.3 1.1
N 3.2 0.5 -0.6
O 0.9 1.4 0.8`,
    expectedOutput: `pocket_center=(0.0,0.0,0.0)
n_atoms=8 contacts(<4A)=8
dock_score=-5.53 kcal/mol  (quick rigid score)
note: full ensemble docking runs AutoDock Vina on the licensed runner`,
  },
};

export function getPipeline(slug: string): Pipeline | undefined {
  return PIPELINES[slug];
}

interface WithRuntime {
  slug: string;
  language?: string;
  runtime?: { language: string; code: string; sampleInput: string; inputLabel?: string; packages?: string[] };
}

/**
 * Resolve a runnable pipeline for a method: a curated sample from PIPELINES, or
 * the runnable `runtime` embedded in a user-submitted method (Python code that
 * was executed at upload). Returns undefined if the method isn't runnable.
 */
export function resolvePipeline(method: WithRuntime): Pipeline | undefined {
  const curated = PIPELINES[method.slug];
  if (curated) return curated;
  const rt = method.runtime;
  if (rt && rt.language === "Python" && rt.code.trim()) {
    return {
      slug: method.slug,
      language: "Python",
      packages: rt.packages ?? [],
      code: rt.code,
      sampleInput: rt.sampleInput ?? "",
      inputLabel: rt.inputLabel || "input.txt",
    };
  }
  return undefined;
}
