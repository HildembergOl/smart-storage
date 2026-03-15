"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Filter,
  CreditCard,
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

interface ContaPagar {
  id: string;
  codigo: string;
  numero: string;
  pessoa: string;
  vencimento: string;
  formaPagamento: string;
  valor: number;
  saldo: number;
  situacao: "EmAberto" | "Pago" | "Vencido";
}

const mockContasPagar: ContaPagar[] = [
  {
    id: "1",
    codigo: "CP001",
    numero: "FAT-001",
    pessoa: "Fornecedor ABC",
    vencimento: "2025-03-20",
    formaPagamento: "Boleto",
    valor: 4500.0,
    saldo: 4500.0,
    situacao: "EmAberto",
  },
  {
    id: "2",
    codigo: "CP002",
    numero: "FAT-002",
    pessoa: "Distribuidora Norte",
    vencimento: "2025-03-10",
    formaPagamento: "PIX",
    valor: 8000.0,
    saldo: 8000.0,
    situacao: "Vencido",
  },
  {
    id: "3",
    codigo: "CP003",
    numero: "FAT-003",
    pessoa: "Fornecedor Beta",
    vencimento: "2025-02-28",
    formaPagamento: "Transferência",
    valor: 12500.0,
    saldo: 0.0,
    situacao: "Pago",
  },
  {
    id: "4",
    codigo: "CP004",
    numero: "FAT-004",
    pessoa: "Fornecedor ABC",
    vencimento: "2025-03-25",
    formaPagamento: "Boleto",
    valor: 3200.0,
    saldo: 3200.0,
    situacao: "EmAberto",
  },
  {
    id: "5",
    codigo: "CP005",
    numero: "FAT-005",
    pessoa: "Distribuidora Leste",
    vencimento: "2025-03-05",
    formaPagamento: "PIX",
    valor: 5750.0,
    saldo: 5750.0,
    situacao: "Vencido",
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
  if (s === "Pago")
    return {
      label: "Pago",
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

export default function ContasPagarPage() {
  const [filterPessoa, setFilterPessoa] = useState("");
  const [filterSituacao, setFilterSituacao] = useState("todos");

  const filtered = mockContasPagar.filter((c) => {
    const matchPessoa =
      !filterPessoa ||
      c.pessoa.toLowerCase().includes(filterPessoa.toLowerCase());
    const matchSit =
      filterSituacao === "todos" || c.situacao === filterSituacao;
    return matchPessoa && matchSit;
  });

  const totalAberto = mockContasPagar
    .filter((c) => c.situacao === "EmAberto")
    .reduce((s, c) => s + c.saldo, 0);
  const totalVencido = mockContasPagar
    .filter((c) => c.situacao === "Vencido")
    .reduce((s, c) => s + c.saldo, 0);
  const totalPago = mockContasPagar
    .filter((c) => c.situacao === "Pago")
    .reduce((s, c) => s + c.valor, 0);

  const columns: Column<ContaPagar>[] = [
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
            {dias > 0 ? `+${dias}d` : `${dias}d`}
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
          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border-emerald-500/30 border text-xs h-7 px-2"
          disabled={row.situacao === "Pago"}
          id={`pagar-cp-${row.id}`}
        >
          Pagar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Contas a Pagar</h1>
          <p className="text-slate-400 text-sm">
            Gerencie os títulos a pagar da empresa
          </p>
        </div>
        <Button
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-cp-btn"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-slate-400 text-xs">Total em Aberto</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalAberto)}
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
                <p className="text-slate-400 text-xs">Total Pago no Mês</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalPago)}
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
                placeholder="Fornecedor..."
                value={filterPessoa}
                onChange={(e) => setFilterPessoa(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-cp-pessoa"
              />
            </div>
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Situação</label>
              <Select value={filterSituacao} onValueChange={setFilterSituacao}>
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-cp-situacao"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="EmAberto">Em Aberto</SelectItem>
                  <SelectItem value="Vencido">Vencido</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
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
              id="clear-cp-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<ContaPagar>
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
