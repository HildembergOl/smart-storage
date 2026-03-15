"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/shared/DataTable";

interface Entrada {
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

const mockEntradas: Entrada[] = [
  {
    id: "1",
    codigo: "ENT001",
    estoque: "EE 01",
    pessoa: "Fornecedor ABC",
    numero: "NF-002341",
    tipo: "NF-e",
    totalProduto: 4500.0,
    totalNfe: 4725.0,
    createdAt: "14/03/2025",
  },
  {
    id: "2",
    codigo: "ENT002",
    estoque: "EE 02",
    pessoa: "Distribuidora Norte",
    numero: "NF-002342",
    tipo: "NF-e",
    totalProduto: 8000.0,
    totalNfe: 8400.0,
    createdAt: "13/03/2025",
  },
  {
    id: "3",
    codigo: "ENT003",
    estoque: "EE 01",
    pessoa: "Fornecedor Beta",
    numero: "MAN-0042",
    tipo: "Manual",
    totalProduto: 12500.0,
    totalNfe: 12500.0,
    createdAt: "12/03/2025",
  },
  {
    id: "4",
    codigo: "ENT004",
    estoque: "EE 03",
    pessoa: "Fornecedor ABC",
    numero: "NF-002215",
    tipo: "NF-e",
    totalProduto: 7200.0,
    totalNfe: 7560.0,
    createdAt: "11/03/2025",
  },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function EntradasPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [numero, setNumero] = useState("");
  const [pessoa, setPessoa] = useState("");

  const filtered = mockEntradas.filter((e) => {
    const matchCod =
      !codigo || e.codigo.toLowerCase().includes(codigo.toLowerCase());
    const matchNum =
      !numero || e.numero.toLowerCase().includes(numero.toLowerCase());
    const matchPessoa =
      !pessoa || e.pessoa.toLowerCase().includes(pessoa.toLowerCase());
    return matchCod && matchNum && matchPessoa;
  });

  const columns: Column<Entrada>[] = [
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
        <span className="font-semibold text-emerald-400">
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
              router.push(`/entradas/${row.id}`);
            }}
            id={`edit-entrada-${row.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={(e) => e.stopPropagation()}
            id={`delete-entrada-${row.id}`}
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
          <h1 className="text-xl font-bold text-white">Entradas</h1>
          <p className="text-slate-400 text-sm">
            Registro de entradas de produtos no estoque
          </p>
        </div>
        <Button
          onClick={() => router.push("/entradas/novo")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-entrada-btn"
        >
          <Plus className="w-4 h-4" />
          Nova Entrada
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
            <div className="flex-1 min-w-[120px] space-y-1">
              <label className="text-xs text-slate-400">Código</label>
              <Input
                placeholder="ENT001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-ent-codigo"
              />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Número NF</label>
              <Input
                placeholder="NF-002341"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-ent-numero"
              />
            </div>
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-xs text-slate-400">Pessoa</label>
              <Input
                placeholder="Fornecedor..."
                value={pessoa}
                onChange={(e) => setPessoa(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-ent-pessoa"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCodigo("");
                setNumero("");
                setPessoa("");
              }}
              className="text-slate-400 hover:text-slate-200 gap-1 h-9"
              id="clear-ent-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<Entrada>
            data={filtered}
            columns={columns}
            onRowClick={(row) => router.push(`/entradas/${row.id}`)}
            emptyMessage="Nenhuma entrada encontrada."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
