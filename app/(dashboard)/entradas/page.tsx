"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/contexts/AppContext";
import { getEntradaColumns, EntryRow } from "./_components/entrada-columns";

export default function EntradasPage() {
  const router = useRouter();
  const { enterprisePublicCode, ready } = useApp();
  
  const [entradas, setEntradas] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({
    codigo: "",
    numero: "",
    pessoa: "",
  });

  const fetchEntradas = useCallback(async () => {
    if (!ready || !enterprisePublicCode) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        enterpriseId: enterprisePublicCode,
        ...(filters.codigo && { codigo: filters.codigo }),
        ...(filters.numero && { numero: filters.numero }),
        ...(filters.pessoa && { pessoa: filters.pessoa }),
      });

      const res = await fetch(`/api/entradas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntradas(data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, enterprisePublicCode, ready]);

  useEffect(() => {
    if (ready && enterprisePublicCode) {
      fetchEntradas();
    }
  }, [ready, enterprisePublicCode, fetchEntradas]);

  const handleClear = () => {
    setFilters({ codigo: "", numero: "", pessoa: "" });
    setEntradas([]);
    setSearched(false);
  };

  const columns = getEntradaColumns(fetchEntradas);

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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-3 space-y-2">
              <Label className="text-slate-300">Código</Label>
              <Input
                placeholder="Ex: 1 ou publicCode"
                value={filters.codigo}
                onChange={(e) => setFilters((f) => ({ ...f, codigo: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && fetchEntradas()}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-ent-codigo"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label className="text-slate-300">Número NF</Label>
              <Input
                placeholder="Ex: NF-002341"
                value={filters.numero}
                onChange={(e) => setFilters((f) => ({ ...f, numero: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && fetchEntradas()}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-ent-numero"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label className="text-slate-300">Pessoa (Fornecedor)</Label>
              <Input
                placeholder="Nome ou Razão Social..."
                value={filters.pessoa}
                onChange={(e) => setFilters((f) => ({ ...f, pessoa: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && fetchEntradas()}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-ent-pessoa"
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button
                onClick={fetchEntradas}
                disabled={loading}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2"
                id="filter-ent-btn"
              >
                <Search className="w-3.5 h-3.5" />
                Filtrar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-200 gap-1 h-9"
                id="clear-ent-filters-btn"
              >
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
            <DataTable<EntryRow>
              data={entradas}
              columns={columns}
              onRowClick={(row) => router.push(`/entradas/${row.publicCode}`)}
              emptyMessage={searched ? "Nenhuma entrada encontrada." : "Use os filtros acima para buscar entradas."}
              searchable={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
