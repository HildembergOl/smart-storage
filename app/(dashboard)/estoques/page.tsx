"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable, Column } from "@/components/shared/DataTable";
import { X, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/contexts/AppContext";
import { toast } from "sonner";

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
  produto: string;
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

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function EstoquesPage() {
  const { enterpriseId, tenantId } = useApp();
  
  // States for Sintético
  const [sinteticoData, setSinteticoData] = useState<EstoqueSintetico[]>([]);
  const [loadingSintetico, setLoadingSintetico] = useState(false);
  const [filterEstoque, setFilterEstoque] = useState("todos");
  const [filterProduto, setFilterProduto] = useState("");
  
  // States for Analítico
  const [analiticoData, setAnaliticoData] = useState<EstoqueAnalitico[]>([]);
  const [loadingAnalitico, setLoadingAnalitico] = useState(false);
  const [searchAnalitico, setSearchAnalitico] = useState("");

  const fetchSintetico = useCallback(async () => {
    if (!enterpriseId) return;
    setLoadingSintetico(true);
    try {
      const params = new URLSearchParams({
        enterpriseId,
        ...(tenantId && { tenantId }),
        ...(filterProduto && { search: filterProduto }),
      });
      const res = await fetch(`/api/estoques/sintetico?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSinteticoData(data);
      } else {
        toast.error("Erro ao carregar saldo sintético");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão");
    } finally {
      setLoadingSintetico(false);
    }
  }, [enterpriseId, tenantId, filterProduto]);

  const fetchAnalitico = useCallback(async () => {
    if (!enterpriseId) return;
    setLoadingAnalitico(true);
    try {
      const params = new URLSearchParams({
        enterpriseId,
        ...(tenantId && { tenantId }),
        ...(searchAnalitico && { search: searchAnalitico }),
      });
      const res = await fetch(`/api/estoques/analitico?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAnaliticoData(data);
      } else {
        toast.error("Erro ao carregar detalhamento analítico");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão");
    } finally {
      setLoadingAnalitico(false);
    }
  }, [enterpriseId, tenantId, searchAnalitico]);

  useEffect(() => {
    fetchSintetico();
  }, [fetchSintetico]); // Auto load when context or fetch callback changes

  const handleFiltrarSintetico = () => fetchSintetico();
  const handleFiltrarAnalitico = () => fetchAnalitico();

  const colsSintetico: Column<EstoqueSintetico>[] = [
    { key: "codEstoque", label: "Cód. estoque", sortable: true },
    { key: "descEstoque", label: "Desc. estoque" },
    { key: "codProduto", label: "Cód. produto", className: "font-mono" },
    { key: "descProduto", label: "Desc. produto", sortable: true },
    {
      key: "custoUnit",
      label: "Custo unit.",
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
    { key: "produto", label: "Produto" },
    { key: "estoque", label: "Estoque" },
    { key: "setor", label: "Setor" },
    { key: "rua", label: "Rua" },
    { key: "bloco", label: "Bloco" },
    { key: "andar", label: "Andar" },
    { key: "locacao", label: "Locação" },
    {
      key: "quantidade",
      label: "Quantidade",
      render: (v) => (
        <span className="font-semibold text-sky-400">{String(v)}</span>
      ),
    },
    { key: "lote", label: "Lote" },
    { key: "validade", label: "Validade" },
    { key: "grade", label: "Grade" },
    { key: "numeroSerie", label: "Nº série" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Consulta de Estoques</h1>
          <p className="text-slate-400 text-sm">
            Visão sintética e analítica do inventário
          </p>
        </div>
        {tenantId && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Filtrado por Depositante
          </Badge>
        )}
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <Tabs defaultValue="sintetico" onValueChange={(v) => v === "analitico" && analiticoData.length === 0 && fetchAnalitico()}>
          <CardHeader className="pb-0">
            <TabsList className="bg-slate-900/50 border border-slate-700/50">
              <TabsTrigger
                value="sintetico"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
              >
                Sintético
              </TabsTrigger>
              <TabsTrigger
                value="analitico"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
              >
                Analítico
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-4">
            <TabsContent value="sintetico" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
                <div className="md:col-span-4 space-y-2">
                  <Label>Estoque</Label>
                  <Select
                    value={filterEstoque}
                    onValueChange={setFilterEstoque}
                  >
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="todos">Todos</SelectItem>
                      {/* Would be populated by an API in a real scenario */}
                      <SelectItem value="GERAL">Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-5 space-y-2">
                  <Label>Produto (código ou descrição)</Label>
                  <Input
                    placeholder="Buscar produto..."
                    value={filterProduto}
                    onChange={(e) => setFilterProduto(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  />
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <Button
                    onClick={handleFiltrarSintetico}
                    className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2"
                    disabled={loadingSintetico}
                  >
                    {loadingSintetico ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Filtrar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFilterEstoque("todos");
                      setFilterProduto("");
                    }}
                    className="h-9 w-9 text-slate-400 hover:text-slate-200 border border-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <DataTable<EstoqueSintetico>
                data={sinteticoData}
                columns={colsSintetico}
                searchable={false}
                loading={loadingSintetico}
                emptyMessage="Nenhum estoque encontrado."
              />
            </TabsContent>

            <TabsContent value="analitico" className="mt-0 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
                <div className="md:col-span-9 space-y-2">
                  <Label>Busca analítica (posição, lote, série...)</Label>
                  <Input
                    placeholder="Filtrar detalhes..."
                    value={searchAnalitico}
                    onChange={(e) => setSearchAnalitico(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  />
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <Button
                    onClick={handleFiltrarAnalitico}
                    className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2"
                    disabled={loadingAnalitico}
                  >
                    {loadingAnalitico ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Filtrar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchAnalitico("")}
                    className="h-9 w-9 text-slate-400 hover:text-slate-200 border border-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <DataTable<EstoqueAnalitico>
                data={analiticoData}
                columns={colsAnalitico}
                loading={loadingAnalitico}
                searchable={false}
                emptyMessage="Nenhuma posição encontrada."
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
