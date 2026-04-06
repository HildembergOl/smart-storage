"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProdutoColumns, Produto } from "./_components/produto-columns";
import { useApp } from "@/lib/contexts/AppContext";

export default function ProdutosPage() {
  const router = useRouter();
  const { enterprisePublicCode, ready } = useApp();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    controlType: "todos",
    status: "todos",
  });

  const fetchProdutos = useCallback(async () => {
    if (!ready || !enterprisePublicCode) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ 
        enterpriseId: enterprisePublicCode,
        ...(filters.search && { search: filters.search }),
        ...(filters.controlType !== "todos" && { controlType: filters.controlType }),
        ...(filters.status !== "todos" && { status: filters.status }),
      });

      const res = await fetch(`/api/produtos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProdutos(data);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, enterprisePublicCode, ready]);

  useEffect(() => {
    if (ready && enterprisePublicCode) {
      fetchProdutos();
    }
  }, [ready, enterprisePublicCode, fetchProdutos]);

  const handleClear = () => {
    setFilters({ search: "", controlType: "todos", status: "todos" });
    setProdutos([]);
    setSearched(false);
  };

  const columns = getProdutoColumns(fetchProdutos);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Produtos</h1>
          <p className="text-slate-400 text-sm">Gerencie o catálogo de produtos e serviços</p>
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-2">
              <Label>Descrição / Marca</Label>
              <Input
                placeholder="Descrição ou marca..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && fetchProdutos()}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-prod-search"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Tipo de controle</Label>
              <Select value={filters.controlType} onValueChange={(v) => setFilters((f) => ({ ...f, controlType: v }))}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm" id="filter-prod-tipo">
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
            <div className="md:col-span-2 space-y-2">
              <Label>Situação</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm" id="filter-prod-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button
                onClick={fetchProdutos}
                disabled={loading}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2"
                id="filter-prod-btn"
              >
                <Search className="w-3.5 h-3.5" />
                Filtrar
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-slate-400 hover:text-slate-200 gap-1 h-9" id="clear-prod-filters-btn">
                <X className="w-3.5 h-3.5" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 bg-slate-700/40 rounded" />
              ))}
            </div>
          ) : (
            <DataTable<Produto>
              data={produtos}
              columns={columns}
              onRowClick={(row) => router.push(`/produtos/${row.publicCode}`)}
              emptyMessage={searched ? "Nenhum produto encontrado." : "Use os filtros acima para buscar produtos."}
              searchable={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
