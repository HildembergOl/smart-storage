"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Filter } from "lucide-react";
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

interface Pessoa {
  id: string;
  codigo: string;
  tipoPessoa: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpjCpf: string;
  cidade: string;
  estado: string;
  categorias: string[];
}

export const mockPessoas: Pessoa[] = [
  {
    id: "1",
    codigo: "PES001",
    tipoPessoa: "Juridica",
    razaoSocial: "Fornecedor ABC LTDA",
    nomeFantasia: "Fornecedor ABC",
    cnpjCpf: "12.345.678/0001-90",
    cidade: "São Paulo",
    estado: "SP",
    categorias: ["Fornecedor"],
  },
  {
    id: "2",
    codigo: "PES002",
    tipoPessoa: "Fisica",
    razaoSocial: "João Silva Santos",
    nomeFantasia: "",
    cnpjCpf: "123.456.789-00",
    cidade: "Campinas",
    estado: "SP",
    categorias: ["Cliente", "Funcionário"],
  },
  {
    id: "3",
    codigo: "PES003",
    tipoPessoa: "Juridica",
    razaoSocial: "Distribuidora Beta S.A.",
    nomeFantasia: "DisBeta",
    cnpjCpf: "98.765.432/0001-11",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    categorias: ["Fornecedor", "Cliente"],
  },
  {
    id: "4",
    codigo: "PES004",
    tipoPessoa: "Fisica",
    razaoSocial: "Maria Oliveira Cruz",
    nomeFantasia: "",
    cnpjCpf: "987.654.321-00",
    cidade: "Belo Horizonte",
    estado: "MG",
    categorias: ["Funcionário", "Locatário"],
  },
];

export default function PessoasPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("todas");

  const filtered = mockPessoas.filter((p) => {
    const matchCod =
      !codigo || p.codigo.toLowerCase().includes(codigo.toLowerCase());
    const matchNome =
      !nome || p.razaoSocial.toLowerCase().includes(nome.toLowerCase());
    const matchCat = categoria === "todas" || p.categorias.includes(categoria);
    return matchCod && matchNome && matchCat;
  });

  const columns: Column<Pessoa>[] = [
    { key: "codigo", label: "Código", sortable: true, className: "font-mono" },
    {
      key: "tipoPessoa",
      label: "Tipo",
      render: (v) => (
        <Badge
          variant="outline"
          className="border-slate-600 text-slate-400 text-xs"
        >
          {v === "Juridica" ? "Jurídica" : "Física"}
        </Badge>
      ),
    },
    { key: "razaoSocial", label: "Razão Social", sortable: true },
    { key: "nomeFantasia", label: "Nome Fantasia" },
    { key: "cnpjCpf", label: "CNPJ/CPF", className: "font-mono text-xs" },
    {
      key: "cidade",
      label: "Cidade/UF",
      render: (_, row) => `${row.cidade}/${row.estado}`,
    },
    {
      key: "categorias",
      label: "Categorias",
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {(v as string[]).map((cat) => (
            <Badge
              key={cat}
              className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-xs"
            >
              {cat}
            </Badge>
          ))}
        </div>
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
              router.push(`/pessoas/${row.id}`);
            }}
            id={`edit-pessoa-${row.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={(e) => e.stopPropagation()}
            id={`delete-pessoa-${row.id}`}
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
          <h1 className="text-xl font-bold text-white">Pessoas</h1>
          <p className="text-slate-400 text-sm">
            Clientes, fornecedores, funcionários e outros
          </p>
        </div>
        <Button
          onClick={() => router.push("/pessoas/novo")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-pessoa-btn"
        >
          <Plus className="w-4 h-4" />
          Nova Pessoa
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
                placeholder="PES001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-pes-codigo"
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">
                Nome / Razão Social
              </label>
              <Input
                placeholder="Nome da pessoa..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-pes-nome"
              />
            </div>
            <div className="min-w-[160px] space-y-1">
              <label className="text-xs text-slate-400">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-pes-categoria"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Funcionário">Funcionário</SelectItem>
                  <SelectItem value="Locatário">Locatário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCodigo("");
                setNome("");
                setCategoria("todas");
              }}
              className="text-slate-400 hover:text-slate-200 gap-1 h-9"
              id="clear-pes-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<Pessoa>
            data={filtered}
            columns={columns}
            onRowClick={(row) => router.push(`/pessoas/${row.id}`)}
            emptyMessage="Nenhuma pessoa encontrada."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
