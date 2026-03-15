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

interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidadeMedida: string;
  marca: string;
  categoria: string;
  tipoControle: string;
  situacao: string;
}

const mockProdutos: Produto[] = [
  {
    id: "1",
    codigo: "PRD001",
    descricao: "Parafuso M8 Inox 50mm",
    unidadeMedida: "UN",
    marca: "Tramontina",
    categoria: "Ferragens",
    tipoControle: "Padrao",
    situacao: "Ativo",
  },
  {
    id: "2",
    codigo: "PRD002",
    descricao: "Cabo USB-C 2m Premium",
    unidadeMedida: "UN",
    marca: "Anker",
    categoria: "Eletrônicos",
    tipoControle: "NumeroSerie",
    situacao: "Ativo",
  },
  {
    id: "3",
    codigo: "PRD003",
    descricao: "Luva de Segurança Tátil P",
    unidadeMedida: "PAR",
    marca: "3M",
    categoria: "EPIs",
    tipoControle: "Padrao",
    situacao: "Ativo",
  },
  {
    id: "4",
    codigo: "PRD047",
    descricao: 'Monitor LED 24" Full HD',
    unidadeMedida: "UN",
    marca: "Dell",
    categoria: "Eletrônicos",
    tipoControle: "NumeroSerie",
    situacao: "Ativo",
  },
  {
    id: "5",
    codigo: "PRD088",
    descricao: "Filtro de Ar Industrial G4",
    unidadeMedida: "UN",
    marca: "Camfil",
    categoria: "Industrial",
    tipoControle: "Validade",
    situacao: "Ativo",
  },
  {
    id: "6",
    codigo: "PRD113",
    descricao: "Óleo Lubrificante 5W30 1L",
    unidadeMedida: "LT",
    marca: "Mobil",
    categoria: "Automotivo",
    tipoControle: "Lote",
    situacao: "Inativo",
  },
];

const tipoControleLabels: Record<string, string> = {
  Padrao: "Padrão",
  Lote: "Lote",
  Validade: "Validade",
  Grade: "Grade",
  NumeroSerie: "Nº Série",
};

export default function ProdutosPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [tipoControle, setTipoControle] = useState("todos");

  const filtered = mockProdutos.filter((p) => {
    const matchCod =
      !codigo || p.codigo.toLowerCase().includes(codigo.toLowerCase());
    const matchDesc =
      !descricao || p.descricao.toLowerCase().includes(descricao.toLowerCase());
    const matchCat = categoria === "todas" || p.categoria === categoria;
    const matchTipo =
      tipoControle === "todos" || p.tipoControle === tipoControle;
    return matchCod && matchDesc && matchCat && matchTipo;
  });

  const columns: Column<Produto>[] = [
    { key: "codigo", label: "Código", sortable: true, className: "font-mono" },
    { key: "descricao", label: "Descrição", sortable: true },
    { key: "unidadeMedida", label: "Unidade" },
    { key: "marca", label: "Marca" },
    { key: "categoria", label: "Categoria" },
    {
      key: "tipoControle",
      label: "Tipo Controle",
      render: (v) => (
        <Badge
          variant="outline"
          className="border-slate-600 text-slate-400 text-xs"
        >
          {tipoControleLabels[String(v)] || String(v)}
        </Badge>
      ),
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
              router.push(`/produtos/${row.id}`);
            }}
            id={`edit-produto-${row.id}`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={(e) => e.stopPropagation()}
            id={`delete-produto-${row.id}`}
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
          <h1 className="text-xl font-bold text-white">Produtos</h1>
          <p className="text-slate-400 text-sm">
            Gerencie o catálogo de produtos
          </p>
        </div>
        <Button
          onClick={() => router.push("/produtos/novo")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-produto-btn"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
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
                placeholder="PRD001"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-prod-codigo"
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">Descrição</label>
              <Input
                placeholder="Nome do produto..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-prod-descricao"
              />
            </div>
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-prod-categoria"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                  <SelectItem value="Ferragens">Ferragens</SelectItem>
                  <SelectItem value="EPIs">EPIs</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Automotivo">Automotivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Tipo Controle</label>
              <Select value={tipoControle} onValueChange={setTipoControle}>
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-prod-tipo"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Padrao">Padrão</SelectItem>
                  <SelectItem value="Lote">Lote</SelectItem>
                  <SelectItem value="Validade">Validade</SelectItem>
                  <SelectItem value="Grade">Grade</SelectItem>
                  <SelectItem value="NumeroSerie">Nº Série</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCodigo("");
                setDescricao("");
                setCategoria("todas");
                setTipoControle("todos");
              }}
              className="text-slate-400 hover:text-slate-200 gap-1 h-9"
              id="clear-prod-filters-btn"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          <DataTable<Produto>
            data={filtered}
            columns={columns}
            onRowClick={(row) => router.push(`/produtos/${row.id}`)}
            emptyMessage="Nenhum produto encontrado."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
