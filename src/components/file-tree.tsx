"use client";

import { useState } from "react";
import {
  ChevronRight,
  Database,
  File,
  FileCode2,
  FileCog,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { type FileNode } from "@/lib/mockData";
import { cn } from "@/lib/utils";

function fileIcon(ft?: FileNode["fileType"]) {
  switch (ft) {
    case "code":
      return FileCode2;
    case "doc":
      return FileText;
    case "config":
    case "env":
      return FileCog;
    case "data":
      return Database;
    default:
      return File;
  }
}

function Node({ node, depth }: { node: FileNode; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const pad = { paddingLeft: `${depth * 16 + 10}px` };

  if (node.kind === "dir") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={pad}
          className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-sm hover:bg-muted/60 cursor-pointer"
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform",
              open && "rotate-90",
            )}
          />
          {open ? (
            <FolderOpen className="h-4 w-4 text-brand" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{node.name}</span>
        </button>
        {open && node.children?.map((c, i) => <Node key={i} node={c} depth={depth + 1} />)}
      </div>
    );
  }

  const Icon = fileIcon(node.fileType);
  return (
    <div
      style={pad}
      className="flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm hover:bg-muted/60"
    >
      <span className="w-3.5" />
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground/85">{node.name}</span>
      {node.size && (
        <span className="ml-auto font-mono text-xs text-subtle">{node.size}</span>
      )}
    </div>
  );
}

export function FileTree({ nodes }: { nodes: FileNode[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-1.5">
      {nodes.map((n, i) => (
        <Node key={i} node={n} depth={0} />
      ))}
    </div>
  );
}
