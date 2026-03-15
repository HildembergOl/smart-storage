"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Empresa {
  id: string;
  codigo: string;
  codigoPublico: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjCpf: string;
  cidade: string;
  estado: string;
  situacao: string;
}

const mockEmpresas: Empresa[] = [
  {
    id: "1",
    codigo: "EMP001",
    codigoPublico: "SMART01",
    razaoSocial: "Smart Tecnologia LTDA",
    nomeFantasia: "SmartTech",
    cnpjCpf: "12.345.678/0001-90",
    cidade: "São Paulo",
    estado: "SP",
    situacao: "Ativo",
  },
  {
    id: "2",
    codigo: "EMP002",
    codigoPublico: "DIST02",
    razaoSocial: "Distribuidora Norte S.A.",
    nomeFantasia: "DisNorte",
    cnpjCpf: "98.765.432/0001-11",
    cidade: "Manaus",
    estado: "AM",
    situacao: "Ativo",
  },
  {
    id: "3",
    codigo: "EMP003",
    codigoPublico: "ALFA03",
    razaoSocial: "Alfa Comércio e Serviços ME",
    nomeFantasia: "AlfaStore",
    cnpjCpf: "11.222.333/0001-44",
    cidade: "Curitiba",
    estado: "PR",
    situacao: "Inativo",
  },
  {
    id: "4",
    codigo: "EMP004",
    codigoPublico: "BETA04",
    razaoSocial: "Beta Indústria e Comércio LTDA",
    nomeFantasia: "BetaInd",
    cnpjCpf: "55.666.777/0001-88",
    cidade: "Porto Alegre",
    estado: "RS",
    situacao: "Ativo",
  },
];

export default function EmpresasPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [situacao, setSituacao] = useState("todos");

  const filtered = mockEmpresas.filter((e) => {
    const matchCodigo =
      !codigo || e.codigo.toLowerCase().includes(codigo.toLowerCase());
    const matchRazao =
      !razaoSocial ||
      e.razaoSocial.toLowerCase().includes(razaoSocial.toLowerCase());
    const matchSituacao = situacao === "todos" || e.situacao === situacao;
    return matchCodigo && matchRazao && matchSituacao;
  });

  const columns: Column<Empresa>[] = [
    { key: "codigo", label: "Código", sortable: true, className: "font-mono" },
    { key: "codigoPublico", label: "Cód. Público", sortable: true },
    { key: "razaoSocial", label: "Razão Social", sortable: true },
    { key: "nomeFantasia", label: "Nome Fantasia" },
    { key: "cnpjCpf", label: "CNPJ/CPF", className: "font-mono text-xs" },
    {
      key: "cidade",
      label: "Cidade/UF",
      render: (_, row) => `${row.cidade}/${row.estado}`,
    },
    {
      key: "situacao",
      label: "Situação",
      render: (v) => (
        <Badge
          className={
            v === "Ativo"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }
        >
          {String(v)}
        </Badge>
      ),
    },
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
              router.push(`/empresas/${row.id}`);
            }}
            id={`edit-empresa-${row.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={(e) => e.stopPropagation()}
            id={`delete-empresa-${row.id}`}
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
          <h1 className="text-xl font-bold text-white">Empresas</h1>
          <p className="text-slate-400 text-sm">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <Button
          onClick={() => router.push("/empresas/novo")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-empresa-btn"
        >
          <Plus className="w-4 h-4" />
          Nova Empresa
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
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Código</label>
              <Input
                placeholder="EMP001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-codigo"
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">Razão Social</label>
              <Input
                placeholder="Nome da empresa..."
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-razao-social"
              />
            </div>
            <div className="min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">Situação</label>
              <Select value={situacao} onValueChange={setSituacao}>
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-situacao"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCodigo("");
                setRazaoSocial("");
                setSituacao("todos");
              }}
              className="text-slate-400 hover:text-slate-200 gap-1 h-9"
              id="clear-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<Empresa>
            data={filtered}
            columns={columns}
            onRowClick={(row) => router.push(`/empresas/${row.id}`)}
            emptyMessage="Nenhuma empresa encontrada."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
