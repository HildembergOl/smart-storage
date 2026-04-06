"use client";

import { Plus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Enterprise } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCompanyColumns } from "./_components/company-columns";

export default function CompaniesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    id: "",
    publicCode: "",
    legalName: "",
    status: "todos",
  });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "todos") {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/empresas?${params.toString()}`);
      if (!response.ok) {
        toast.error("Erro ao buscar empresas");
        return;
      }
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      toast.error("Erro ao carregar lista de empresas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Busca inicial apenas
    const initialFetch = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/empresas");
        const data = await response.json();
        setEntries(data);
      } catch {
        toast.error("Erro ao carregar lista de empresas");
      } finally {
        setLoading(false);
      }
    };
    initialFetch();
  }, []);

  const handleClear = () => {
    const defaultFilters = {
      id: "",
      publicCode: "",
      legalName: "",
      status: "todos",
    };
    setFilters(defaultFilters);
    
    // Para limpar e já buscar, chamamos a API sem parâmetros
    const fetchAll = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/empresas");
        const data = await response.json();
        setEntries(data);
      } catch {
        toast.error("Erro ao carregar lista de empresas");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const columns = getCompanyColumns(fetchCompanies, router);

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
          onClick={() => router.push("/empresas/new")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="new-company-btn"
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
            <div className="flex-1 min-w-[120px] space-y-1">
              <label className="text-xs text-slate-400">Código</label>
              <Input
                placeholder="Código..."
                value={filters.id}
                onChange={(e) => handleFilterChange("id", e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-id"
              />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-xs text-slate-400">Cód. Público</label>
              <Input
                placeholder="Cód. público..."
                value={filters.publicCode}
                onChange={(e) =>
                  handleFilterChange("publicCode", e.target.value)
                }
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-public-code"
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">Razão Social</label>
              <Input
                placeholder="Razão social..."
                value={filters.legalName}
                onChange={(e) => handleFilterChange("legalName", e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-legal-name"
              />
            </div>
            <div className="min-w-[200px] space-y-1">
              <label className="text-xs text-slate-400">Situação</label>
              <Select
                value={filters.status}
                onValueChange={(v) => handleFilterChange("status", v)}
              >
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="filter-status"
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
              type="button"
              onClick={fetchCompanies}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 gap-1 h-9"
              id="execute-filter-btn"
            >
              <Filter className="w-3.5 h-3.5" />
              Filtrar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
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
          <DataTable<Enterprise>
            data={entries}
            columns={columns}
            loading={loading}
            onRowClick={(row: Enterprise) =>
              router.push(`/empresas/${row.publicCode}`)
            }
            emptyMessage="Nenhuma empresa encontrada."
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
