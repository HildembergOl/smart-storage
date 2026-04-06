"use client";

import { Column, DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";

export interface ProductPosition {
  id: string;
  positionId: string;
  quantity: number;
  batch: string | null;
  expiry: string | null;
  grid: string | null;
  serialNumber: string | null;
  position: {
    aisle: string | null;
    block: string | null;
    floor: string | null;
    location: string | null;
    stock: { description: string } | null;
    section: { description: string } | null;
  } | null;
}

const columns: Column<ProductPosition>[] = [
  {
    key: "position",
    label: "Posição",
    render: (v) => {
      const p = v as ProductPosition["position"];
      if (!p) return <span className="text-slate-500">—</span>;
      return (
        <span className="font-mono text-slate-300 text-xs">
          {[p.aisle, p.block, p.floor, p.location].map((x) => x || "?").join(".")}
        </span>
      );
    },
  },
  {
    key: "position",
    label: "Estoque",
    render: (v) => <span className="text-slate-400">{(v as ProductPosition["position"])?.stock?.description || "—"}</span>,
  },
  {
    key: "quantity",
    label: "Quantidade",
    render: (v) => <span className="font-mono text-slate-200">{Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 3 })}</span>,
  },
  { key: "batch", label: "Lote", render: (v) => <span className="text-slate-400 text-xs">{String(v || "—")}</span> },
  {
    key: "expiry",
    label: "Validade",
    render: (v) => v ? <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">{new Date(String(v)).toLocaleDateString("pt-BR")}</Badge> : <span className="text-slate-500">—</span>,
  },
];

export function TabPosicoesProduto({ productPositions }: { productPositions: ProductPosition[] }) {
  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
      <DataTable<ProductPosition>
        data={productPositions}
        columns={columns}
        emptyMessage="Nenhuma posição vinculada a este produto."
        searchable={false}
      />
    </div>
  );
}
