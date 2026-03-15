"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Filter,
  Wallet,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/shared/DataTable";
import { differenceInDays, parseISO } from "date-fns";

interface ContaReceber {
  id: string;
  codigo: string;
  numero: string;
  pessoa: string;
  vencimento: string;
  formaPagamento: string;
  valor: number;
  saldo: number;
  situacao: "EmAberto" | "Recebido" | "Vencido";
}

const mockContasReceber: ContaReceber[] = [
  {
    id: "1",
    codigo: "CR001",
    numero: "REC-001",
    pessoa: "Empresa XYZ",
    vencimento: "2025-03-18",
    formaPagamento: "Boleto",
    valor: 1260.0,
    saldo: 1260.0,
    situacao: "EmAberto",
  },
  {
    id: "2",
    codigo: "CR002",
    numero: "REC-002",
    pessoa: "Cliente Sul",
    vencimento: "2025-03-08",
    formaPagamento: "PIX",
    valor: 3543.75,
    saldo: 3543.75,
    situacao: "Vencido",
  },
  {
    id: "3",
    codigo: "CR003",
    numero: "REC-003",
    pessoa: "Distribuidora Leste",
    vencimento: "2025-02-25",
    formaPagamento: "Transferência",
    valor: 5800.0,
    saldo: 0.0,
    situacao: "Recebido",
  },
  {
    id: "4",
    codigo: "CR004",
    numero: "REC-004",
    pessoa: "Empresa XYZ",
    vencimento: "2025-03-28",
    formaPagamento: "Boleto",
    valor: 934.5,
    saldo: 934.5,
    situacao: "EmAberto",
  },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const getDiasEmAberto = (venc: string) => {
  const today = new Date();
  const vDate = parseISO(venc);
  return differenceInDays(today, vDate);
};

const getSituacaoInfo = (s: string) => {
  if (s === "Recebido")
    return {
      label: "Recebido",
      cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
  if (s === "Vencido")
    return {
      label: "Vencido",
      cls: "bg-red-500/20 text-red-400 border-red-500/30",
    };
  return {
    label: "Em Aberto",
    cls: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
};

export default function ContasReceberPage() {
  const [filterPessoa, setFilterPessoa] = useState("");
  const [filterSituacao, setFilterSituacao] = useState("todos");

  const filtered = mockContasReceber.filter((c) => {
    const matchPessoa =
      !filterPessoa ||
      c.pessoa.toLowerCase().includes(filterPessoa.toLowerCase());
    const matchSit =
      filterSituacao === "todos" || c.situacao === filterSituacao;
    return matchPessoa && matchSit;
  });

  const totalReceber = mockContasReceber
    .filter((c) => c.situacao === "EmAberto")
    .reduce((s, c) => s + c.saldo, 0);
  const totalVencido = mockContasReceber
    .filter((c) => c.situacao === "Vencido")
    .reduce((s, c) => s + c.saldo, 0);
  const totalRecebido = mockContasReceber
    .filter((c) => c.situacao === "Recebido")
    .reduce((s, c) => s + c.valor, 0);

  const columns: Column<ContaReceber>[] = [
    { key: "codigo", label: "Código", sortable: true, className: "font-mono" },
    { key: "numero", label: "Número" },
    { key: "pessoa", label: "Pessoa", sortable: true },
    {
      key: "vencimento",
      label: "Vencimento",
      render: (v) => formatDate(String(v)),
    },
    { key: "formaPagamento", label: "Forma Pag." },
    {
      key: "valor",
      label: "Valor",
      render: (v) => formatCurrency(v as number),
    },
    {
      key: "saldo",
      label: "Saldo",
      render: (v) => (
        <span className="font-semibold">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "dias",
      label: "Dias",
      render: (v) => {
        const dias = getDiasEmAberto(String(v));
        return (
          <span
            className={`font-semibold text-xs ${dias > 0 ? "text-red-400" : "text-emerald-400"}`}
          >
            {dias > 0 ? `+${dias}d` : `${Math.abs(dias)}d`}
          </span>
        );
      },
    },
    {
      key: "situacao",
      label: "Situação",
      render: (v) => {
        const { label, cls } = getSituacaoInfo(String(v));
        return <Badge className={`${cls} text-xs`}>{label}</Badge>;
      },
    },
    {
      key: "id",
      label: "Ações",
      render: (_, row) => (
        <Button
          size="sm"
          className="bg-sky-500/20 text-sky-400 hover:bg-sky-500/40 border-sky-500/30 border text-xs h-7 px-2"
          disabled={row.situacao === "Recebido"}
          id={`receber-cr-${row.id}`}
        >
          Receber
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Contas a Receber</h1>
          <p className="text-slate-400 text-sm">
            Gerencie os títulos a receber da empresa
          </p>
        </div>
        <Button
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-cr-btn"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-sky-500/10 border-sky-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-sky-400" />
              <div>
                <p className="text-slate-400 text-xs">Total a Receber</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalReceber)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-slate-400 text-xs">Total Vencido</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalVencido)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-slate-400 text-xs">Total Recebido no Mês</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalRecebido)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <CardTitle className="text-sm text-slate-300">Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">Pessoa</label>
              <Input
                placeholder="Cliente/Empresa..."
                value={filterPessoa}
                onChange={(e) => setFilterPessoa(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-cr-pessoa"
              />
            </div>
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Situação</label>
              <Select value={filterSituacao} onValueChange={setFilterSituacao}>
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-cr-situacao"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="EmAberto">Em Aberto</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterPessoa("");
                setFilterSituacao("todos");
              }}
              className="text-slate-400 hover:text-slate-200 gap-1 h-9"
              id="clear-cr-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<ContaReceber>
            data={filtered}
            columns={columns}
            emptyMessage="Nenhuma conta encontrada."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
