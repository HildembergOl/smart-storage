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
import { getPessoaColumns, Pessoa } from "./_components/pessoa-columns";
import { useApp } from "@/lib/contexts/AppContext";

export default function PessoasPage() {
  const router = useRouter();
  const { enterprisePublicCode, ready } = useApp();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    categoria: "todas",
  });

  const fetchPessoas = useCallback(async () => {
    if (!ready || !enterprisePublicCode) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ 
        search: filters.search,
        enterpriseId: enterprisePublicCode
      });
      const catMap: Record<string, string> = {
        Cliente: "isClient",
        Fornecedor: "isSupplier",
        Funcionário: "isEmployee",
        Locatário: "isTenant",
        Veículo: "isVehicle",
      };
      if (filters.categoria !== "todas" && catMap[filters.categoria]) {
        params.append(catMap[filters.categoria], "true");
      }
      const res = await fetch(`/api/pessoas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPessoas(data);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, enterprisePublicCode, ready]);

  useEffect(() => {
    if (ready && enterprisePublicCode) {
      fetchPessoas();
    }
  }, [ready, enterprisePublicCode, fetchPessoas]);

  const handleClear = () => {
    setFilters({ search: "", categoria: "todas" });
    setTimeout(() => fetchPessoas(), 0);
  };

  const columns = getPessoaColumns(fetchPessoas);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Pessoas</h1>
          <p className="text-slate-400 text-sm">Clientes, fornecedores, funcionários e outros</p>
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <Label>Nome / Razão social</Label>
              <Input
                placeholder="Nome ou razão social..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && fetchPessoas()}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-pes-nome"
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filters.categoria}
                onValueChange={(v) => setFilters((f) => ({ ...f, categoria: v }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm" id="filter-pes-categoria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="Funcionário">Funcionário</SelectItem>
                  <SelectItem value="Locatário">Locatário</SelectItem>
                  <SelectItem value="Veículo">Veículo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <Button
                onClick={fetchPessoas}
                disabled={loading}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2"
                id="filter-pes-btn"
              >
                <Search className="w-3.5 h-3.5" />
                Filtrar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-200 gap-1 h-9"
                id="clear-pes-filters-btn"
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
            <DataTable<Pessoa>
              data={pessoas}
              columns={columns}
              onRowClick={(row) => router.push(`/pessoas/${row.publicCode}`)}
              emptyMessage={searched ? "Nenhuma pessoa encontrada." : "Use os filtros acima para buscar pessoas."}
              searchable={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
