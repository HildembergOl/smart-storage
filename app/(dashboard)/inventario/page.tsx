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
import { getInventoryColumns, InventoryRow } from "./_components/inventario-columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface StockOption {
  id: string;
  description: string;
}

export default function InventariosPage() {
  const router = useRouter();
  const { enterprisePublicCode, ready } = useApp();

  const [inventories, setInventories] = useState<InventoryRow[]>([]);
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Estados de filtro
  const [filters, setFilters] = useState({
    stockId: "TODOS",
    status: "TODOS",
    startDate: "",
    endDate: "",
  });

  // Estados de criação de novo inventário
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newInventory, setNewInventory] = useState({
    description: "",
    stockId: "",
  });
  const [creating, setCreating] = useState(false);

  // Buscar lista de estoques
  const fetchStocks = useCallback(async () => {
    if (!ready || !enterprisePublicCode) return;
    try {
      const res = await fetch(`/api/stocks?enterpriseId=${enterprisePublicCode}&status=Ativo`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    }
  }, [enterprisePublicCode, ready]);

  // Buscar lista de inventários
  const fetchInventories = useCallback(async () => {
    if (!ready || !enterprisePublicCode) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        enterpriseId: enterprisePublicCode,
      });
      if (filters.stockId && filters.stockId !== "TODOS") {
        params.append("stockId", filters.stockId);
      }
      if (filters.status && filters.status !== "TODOS") {
        params.append("status", filters.status);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate);
      }

      const res = await fetch(`/api/inventario?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInventories(data);
      }
    } catch (error) {
      console.error("Error fetching inventories:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, enterprisePublicCode, ready]);

  useEffect(() => {
    if (ready && enterprisePublicCode) {
      fetchStocks();
      fetchInventories();
    }
  }, [ready, enterprisePublicCode, fetchStocks, fetchInventories]);

  const handleClear = () => {
    setFilters({
      stockId: "TODOS",
      status: "TODOS",
      startDate: "",
      endDate: "",
    });
    setInventories([]);
    setSearched(false);
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !enterprisePublicCode) return;
    if (!newInventory.description || !newInventory.stockId) {
      toast.error("Por favor, preencha a descrição e selecione um estoque.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enterpriseId: enterprisePublicCode,
          description: newInventory.description,
          stockId: newInventory.stockId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Inventário inicializado com sucesso!");
        setIsNewDialogOpen(false);
        setNewInventory({ description: "", stockId: "" });
        router.push(`/inventario/${data.publicCode}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erro ao criar inventário.");
      }
    } catch (error) {
      console.error("Error creating inventory:", error);
      toast.error("Erro ao conectar ao servidor.");
    } finally {
      setCreating(false);
    }
  };

  const columns = getInventoryColumns(fetchInventories);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Inventários</h1>
          <p className="text-slate-400 text-sm">
            Listagem e controle de lançamentos de inventários de estoque
          </p>
        </div>
        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger
            render={
              <Button
                className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
                id="new-inventario-btn"
              />
            }
          >
            <Plus className="w-4 h-4" />
            Novo Inventário
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-slate-200 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">Novo Inventário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateInventory} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-desc" className="text-slate-300">Descrição</Label>
                <Input
                  id="new-desc"
                  placeholder="Ex: Inventário de Fechamento de Mês"
                  value={newInventory.description}
                  onChange={(e) => setNewInventory((prev) => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-stock" className="text-slate-300">Estoque de Destino</Label>
                <Select
                  value={newInventory.stockId}
                  onValueChange={(val) => setNewInventory((prev) => ({ ...prev, stockId: val }))}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9" id="new-stock">
                    <SelectValue placeholder="Selecione o estoque..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    {stocks.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-6">
                <DialogClose render={<Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-9" />}>
                  Cancelar
                </DialogClose>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-sky-500 hover:bg-sky-400 text-white h-9"
                >
                  {creating ? "Criando..." : "Criar Inventário"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              <Label className="text-slate-300">Estoque</Label>
              <Select
                value={filters.stockId}
                onValueChange={(v) => setFilters((f) => ({ ...f, stockId: v }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm" id="filter-inv-stock">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="TODOS">Todos os Estoques</SelectItem>
                  {stocks.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-slate-300">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm" id="filter-inv-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-slate-300">Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-inv-startDate"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label className="text-slate-300">Data Final</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="filter-inv-endDate"
              />
            </div>

            <div className="md:col-span-3 flex gap-2">
              <Button
                onClick={fetchInventories}
                disabled={loading}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2"
                id="filter-inv-btn"
              >
                <Search className="w-3.5 h-3.5" />
                Filtrar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-200 gap-1 h-9"
                id="clear-inv-filters-btn"
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
            <DataTable<InventoryRow>
              data={inventories}
              columns={columns}
              onRowClick={(row) => router.push(`/inventario/${row.publicCode}`)}
              emptyMessage={searched ? "Nenhum inventário encontrado." : "Use os filtros acima para buscar inventários."}
              searchable={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
