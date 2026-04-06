"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Person } from "@prisma/client";

export interface BaseLogistic {
  id: bigint;
  publicCode: string;
  description: string;
}

export interface Stock extends BaseLogistic {
  status: string;
  tenantId?: bigint | string;
  tenant?: Person;
}

export type Section = BaseLogistic;

export interface Position extends BaseLogistic {
  aisle?: string;
  block?: string;
  floor?: string;
  location?: string;
  stock?: Stock;
  section?: Section;
  stockId: bigint;
  sectionId: bigint;
}

export const getStockColumns = (
  onEdit: (row: Stock) => void,
  onDelete: (id: string) => void,
): Column<Stock>[] => [
  { key: "id", label: "Código", className: "font-mono text-xs" },
  { key: "description", label: "Descrição" },
  {
    key: "tenant",
    label: "Depositante",
    render: (v) => {
      const person = v as { legalName?: string } | null;
      return (
        <span className="text-slate-300 text-sm">
          {person?.legalName || (
            <span className="text-slate-600 italic">—</span>
          )}
        </span>
      );
    },
  },
  {
    key: "status",
    label: "Situação",
    render: (v) => (
      <Badge
        className={
          v === "Ativo"
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
            : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
        }
      >
        {String(v)}
      </Badge>
    ),
  },
  {
    key: "actions",
    label: "Ações",
    className: "text-right",
    render: (_, row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white"
          onClick={() => onEdit(row)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-400"
          onClick={() => onDelete(row.publicCode)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];

export const getSectionColumns = (
  onEdit: (row: Section) => void,
  onDelete: (id: string) => void,
): Column<Section>[] => [
  { key: "id", label: "Código", className: "font-mono text-xs" },
  { key: "description", label: "Descrição" },
  {
    key: "actions",
    label: "Ações",
    className: "text-right",
    render: (_, row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white"
          onClick={() => onEdit(row)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-400"
          onClick={() => onDelete(row.publicCode)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];

export const getPositionColumns = (
  onEdit: (row: Position) => void,
  onDelete: (id: string) => void,
): Column<Position>[] => [
  { key: "id", label: "Código", className: "font-mono text-xs" },
  {
    key: "aisle",
    label: "Locação (R.B.A.L)",
    render: (_, row) => (
      <span className="text-slate-300">
        {row.aisle || ""}.{row.block || ""}.{row.floor || ""}.
        {row.location || ""}
      </span>
    ),
  },
  {
    key: "stock",
    label: "Estoque",
    render: (v) => (
      <span className="text-xs text-slate-400">
        {(v as Stock)?.description || "-"}
      </span>
    ),
  },
  {
    key: "section",
    label: "Setor",
    render: (v) => (
      <span className="text-xs text-slate-400">
        {(v as Section)?.description || "-"}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Ações",
    className: "text-right",
    render: (_, row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white"
          onClick={() => onEdit(row)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-red-400"
          onClick={() => onDelete(row.publicCode)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
