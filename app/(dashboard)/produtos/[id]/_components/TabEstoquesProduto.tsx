"use client";

import { Badge } from "@/components/ui/badge";
import { Column, DataTable } from "@/components/shared/DataTable";

export interface ProductoStock {
  id: string;
  stockId: string;
  quantity: number;
  costPrice: number;
  active: boolean;
  stock: {
    id: string;
    description: string;
    status: string;
  } | null;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const columns: Column<ProductoStock>[] = [
  {
    key: "stock",
    label: "Estoque",
    render: (v) => <span className="text-slate-200">{(v as ProductoStock["stock"])?.description || "—"}</span>,
  },
  {
    key: "quantity",
    label: "Quantidade",
    render: (v) => <span className="font-mono text-slate-200">{Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 3 })}</span>,
  },
  {
    key: "costPrice",
    label: "Preço de custo",
    render: (v) => <span className="font-mono text-slate-300">{formatCurrency(Number(v))}</span>,
  },
  {
    key: "active",
    label: "Situação",
    render: (v) => (
      <Badge className={v ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-slate-500/20 text-slate-400 border-slate-500/30 text-[10px]"}>
        {v ? "Ativo" : "Inativo"}
      </Badge>
    ),
  },
];

export function TabEstoquesProduto({ productStocks }: { productStocks: ProductoStock[] }) {
  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
      <DataTable<ProductoStock>
        data={productStocks}
        columns={columns}
        emptyMessage="Nenhum estoque vinculado a este produto."
        searchable={false}
      />
    </div>
  );
}
