"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/shared/DataTable";

interface Saida {
  id: string;
  codigo: string;
  estoque: string;
  pessoa: string;
  numero: string;
  tipo: string;
  totalProduto: number;
  totalNfe: number;
  createdAt: string;
}

const mockSaidas: Saida[] = [
  {
    id: "1",
    codigo: "SAI001",
    estoque: "EE 01",
    pessoa: "Empresa XYZ",
    numero: "NF-001823",
    tipo: "NF-e",
    totalProduto: 1200.0,
    totalNfe: 1260.0,
    createdAt: "14/03/2025",
  },
  {
    id: "2",
    codigo: "SAI002",
    estoque: "EE 03",
    pessoa: "Cliente Sul",
    numero: "NF-001824",
    tipo: "NF-e",
    totalProduto: 3375.0,
    totalNfe: 3543.75,
    createdAt: "13/03/2025",
  },
  {
    id: "3",
    codigo: "SAI003",
    estoque: "EE 02",
    pessoa: "Distribuidora Leste",
    numero: "MAN-0031",
    tipo: "Manual",
    totalProduto: 5800.0,
    totalNfe: 5800.0,
    createdAt: "12/03/2025",
  },
  {
    id: "4",
    codigo: "SAI004",
    estoque: "EE 01",
    pessoa: "Empresa XYZ",
    numero: "CF-e-00421",
    tipo: "CF-e",
    totalProduto: 890.0,
    totalNfe: 934.5,
    createdAt: "11/03/2025",
  },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function SaidasPage() {
  const router = useRouter();
  const [pessoa, setPessoa] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  const filtered = mockSaidas.filter((s) => {
    const matchPessoa =
      !pessoa || s.pessoa.toLowerCase().includes(pessoa.toLowerCase());
    return matchPessoa;
  });

  const columns: Column<Saida>[] = [
    { key: "codigo", label: "Código", sortable: true, className: "font-mono" },
    { key: "estoque", label: "Estoque" },
    { key: "pessoa", label: "Pessoa", sortable: true },
    { key: "numero", label: "Número", className: "font-mono" },
    {
      key: "tipo",
      label: "Tipo",
      render: (v) => (
        <Badge
          variant="outline"
          className="border-slate-600 text-slate-400 text-xs"
        >
          {String(v)}
        </Badge>
      ),
    },
    {
      key: "totalProduto",
      label: "Total Produto",
      render: (v) => (
        <span className="text-slate-300">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "totalNfe",
      label: "Total NF-e",
      render: (v) => (
        <span className="font-semibold text-orange-400">
          {formatCurrency(v as number)}
        </span>
      ),
    },
    { key: "createdAt", label: "Data", sortable: true },
    {
      key: "id",
      label: "Ações",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/saidas/${row.id}`);
            }}
            id={`edit-saida-${row.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={(e) => e.stopPropagation()}
            id={`delete-saida-${row.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Saídas</h1>
          <p className="text-slate-400 text-sm">
            Registro de saídas de produtos do estoque
          </p>
        </div>
        <Button
          onClick={() => router.push("/saidas/novo")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-saida-btn"
        >
          <Plus className="w-4 h-4" />
          Nova Saída
        </Button>
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <CardTitle className="text-sm text-slate-300">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-xs text-slate-400">Pessoa</label>
              <Input
                placeholder="Cliente/Empresa..."
                value={pessoa}
                onChange={(e) => setPessoa(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-sai-pessoa"
              />
            </div>
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Data Inicial</label>
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-sai-data-inicial"
              />
            </div>
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Data Final</label>
              <Input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-sai-data-final"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPessoa("");
                setDataInicial("");
                setDataFinal("");
              }}
              className="text-slate-400 hover:text-slate-200 gap-1 h-9"
              id="clear-sai-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<Saida>
            data={filtered}
            columns={columns}
            onRowClick={(row) => router.push(`/saidas/${row.id}`)}
            emptyMessage="Nenhuma saída encontrada."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
