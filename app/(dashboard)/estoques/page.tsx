"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/shared/DataTable";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EstoqueSintetico {
  id: string;
  codEstoque: string;
  descEstoque: string;
  codProduto: string;
  descProduto: string;
  custoUnit: number;
  quantidade: number;
  total: number;
}

interface EstoqueAnalitico {
  id: string;
  codigo: string;
  estoque: string;
  setor: string;
  rua: string;
  bloco: string;
  andar: string;
  locacao: string;
  quantidade: number;
  lote: string;
  validade: string;
  grade: string;
  numeroSerie: string;
}

const mockSintetico: EstoqueSintetico[] = [
  {
    id: "1",
    codEstoque: "EE 01",
    descEstoque: "Estoque Principal",
    codProduto: "PRD001",
    descProduto: "Parafuso M8 Inox 50mm",
    custoUnit: 2.5,
    quantidade: 12,
    total: 30,
  },
  {
    id: "2",
    codEstoque: "EE 01",
    descEstoque: "Estoque Principal",
    codProduto: "PRD002",
    descProduto: "Cabo USB-C 2m",
    custoUnit: 38.9,
    quantidade: 5,
    total: 194.5,
  },
  {
    id: "3",
    codEstoque: "EE 02",
    descEstoque: "Depósito Norte",
    codProduto: "PRD003",
    descProduto: "Luva de Segurança P",
    custoUnit: 15.0,
    quantidade: 3,
    total: 45,
  },
  {
    id: "4",
    codEstoque: "EE 02",
    descEstoque: "Depósito Norte",
    codProduto: "PRD047",
    descProduto: 'Monitor LED 24"',
    custoUnit: 890.0,
    quantidade: 45,
    total: 40050,
  },
  {
    id: "5",
    codEstoque: "EE 03",
    descEstoque: "Armazém Sul",
    codProduto: "PRD088",
    descProduto: "Filtro de Ar G4",
    custoUnit: 125.0,
    quantidade: 8,
    total: 1000,
  },
];

const mockAnalitico: EstoqueAnalitico[] = [
  {
    id: "1",
    codigo: "POS-A01-R01",
    estoque: "EE 01",
    setor: "A",
    rua: "01",
    bloco: "A",
    andar: "1",
    locacao: "01",
    quantidade: 12,
    lote: "LOT-2024-001",
    validade: "31/12/2025",
    grade: "",
    numeroSerie: "",
  },
  {
    id: "2",
    codigo: "POS-A01-R02",
    estoque: "EE 01",
    setor: "A",
    rua: "01",
    bloco: "A",
    andar: "1",
    locacao: "02",
    quantidade: 5,
    lote: "",
    validade: "",
    grade: "",
    numeroSerie: "SN-2024-8847",
  },
  {
    id: "3",
    codigo: "POS-B02-R01",
    estoque: "EE 02",
    setor: "B",
    rua: "02",
    bloco: "B",
    andar: "2",
    locacao: "01",
    quantidade: 3,
    lote: "",
    validade: "",
    grade: "G",
    numeroSerie: "",
  },
  {
    id: "4",
    codigo: "POS-B02-R03",
    estoque: "EE 02",
    setor: "B",
    rua: "02",
    bloco: "B",
    andar: "2",
    locacao: "03",
    quantidade: 45,
    lote: "",
    validade: "",
    grade: "",
    numeroSerie: "SN-2024-1122",
  },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function EstoquesPage() {
  const [filterEstoque, setFilterEstoque] = useState("todos");
  const [filterProduto, setFilterProduto] = useState("");

  const filteredSintetico = mockSintetico.filter((e) => {
    const matchEst =
      filterEstoque === "todos" || e.codEstoque === filterEstoque;
    const matchProd =
      !filterProduto ||
      e.descProduto.toLowerCase().includes(filterProduto.toLowerCase()) ||
      e.codProduto.toLowerCase().includes(filterProduto.toLowerCase());
    return matchEst && matchProd;
  });

  const colsSintetico: Column<EstoqueSintetico>[] = [
    { key: "codEstoque", label: "Cód. Estoque", sortable: true },
    { key: "descEstoque", label: "Desc. Estoque" },
    { key: "codProduto", label: "Cód. Produto", className: "font-mono" },
    { key: "descProduto", label: "Desc. Produto", sortable: true },
    {
      key: "custoUnit",
      label: "Custo Unit.",
      render: (v) => (
        <span className="text-slate-300">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "quantidade",
      label: "Quantidade",
      render: (v) => (
        <span className="font-semibold text-sky-400">{String(v)}</span>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (v) => (
        <span className="font-bold text-emerald-400">
          {formatCurrency(v as number)}
        </span>
      ),
    },
  ];

  const colsAnalitico: Column<EstoqueAnalitico>[] = [
    {
      key: "codigo",
      label: "Código",
      sortable: true,
      className: "font-mono text-xs",
    },
    { key: "estoque", label: "Estoque" },
    { key: "setor", label: "Setor" },
    { key: "rua", label: "Rua" },
    { key: "bloco", label: "Bloco" },
    { key: "andar", label: "Andar" },
    { key: "locacao", label: "Locação" },
    {
      key: "quantidade",
      label: "Qtd",
      render: (v) => (
        <span className="font-semibold text-sky-400">{String(v)}</span>
      ),
    },
    { key: "lote", label: "Lote" },
    { key: "validade", label: "Validade" },
    { key: "grade", label: "Grade" },
    { key: "numeroSerie", label: "Nº Série" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Consulta de Estoques</h1>
        <p className="text-slate-400 text-sm">
          Visão sintética e analítica do inventário
        </p>
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <Tabs defaultValue="sintetico">
          <CardHeader className="pb-0">
            <TabsList className="bg-slate-900/50 border border-slate-700/50">
              <TabsTrigger
                value="sintetico"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                id="tab-sintetico"
              >
                Sintético
              </TabsTrigger>
              <TabsTrigger
                value="analitico"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                id="tab-analitico"
              >
                Analítico
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-4">
            <TabsContent value="sintetico" className="mt-0 space-y-4">
              <div className="flex flex-wrap gap-3 items-end p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                <Filter className="w-4 h-4 text-slate-500 mt-1" />
                <div className="flex-1 min-w-[150px] space-y-1">
                  <label className="text-xs text-slate-400">Estoque</label>
                  <Select
                    value={filterEstoque}
                    onValueChange={setFilterEstoque}
                  >
                    <SelectTrigger
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                      id="filter-est-estoque"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="EE 01">
                        EE 01 — Estoque Principal
                      </SelectItem>
                      <SelectItem value="EE 02">
                        EE 02 — Depósito Norte
                      </SelectItem>
                      <SelectItem value="EE 03">EE 03 — Armazém Sul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px] space-y-1">
                  <label className="text-xs text-slate-400">
                    Produto (código ou descrição)
                  </label>
                  <Input
                    placeholder="Buscar produto..."
                    value={filterProduto}
                    onChange={(e) => setFilterProduto(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                    id="filter-est-produto"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterEstoque("todos");
                    setFilterProduto("");
                  }}
                  className="text-slate-400 hover:text-slate-200 gap-1 h-9"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar
                </Button>
              </div>
              <DataTable<EstoqueSintetico>
                data={filteredSintetico}
                columns={colsSintetico}
                searchable={false}
                emptyMessage="Nenhum estoque encontrado."
              />
            </TabsContent>

            <TabsContent value="analitico" className="mt-0">
              <DataTable<EstoqueAnalitico>
                data={mockAnalitico}
                columns={colsAnalitico}
                emptyMessage="Nenhuma posição encontrada."
                searchPlaceholder="Buscar por posição, lote, série..."
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
