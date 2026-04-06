"use client";

import { Column, DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";

export interface Movimento {
  id: string;
  date: string;
  type: string;
  document: string;
  person: string;
  stock: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const columns: Column<Movimento>[] = [
  { key: "date", label: "Data", className: "text-slate-400 text-xs" },
  {
    key: "type",
    label: "Tipo",
    render: (v) => (
      <Badge className={v === "Entrada" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"}>
        {String(v)}
      </Badge>
    ),
  },
  { key: "document", label: "Documento", className: "font-mono text-xs" },
  { key: "person", label: "Pessoa / Fornecedor" },
  { key: "stock", label: "Estoque" },
  { key: "quantity", label: "Quantidade", render: (v) => <span className="font-mono text-slate-200">{Number(v).toLocaleString("pt-BR")}</span> },
  { key: "unitPrice", label: "Valor unit.", render: (v) => <span className="font-mono text-slate-300 text-xs">{formatCurrency(Number(v))}</span> },
  { key: "total", label: "Total", render: (v) => <span className="font-mono font-semibold text-sky-400">{formatCurrency(Number(v))}</span> },
];

export function TabMovimentosProduto({ movimentos }: { movimentos: Movimento[] }) {
  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-xs">Histórico de entradas e saídas deste produto.</p>
      <div className="rounded-lg border border-slate-700/50 overflow-hidden">
        <DataTable<Movimento>
          data={movimentos}
          columns={columns}
          emptyMessage="Nenhum movimento registrado para este produto."
          searchable={false}
        />
      </div>
    </div>
  );
}
