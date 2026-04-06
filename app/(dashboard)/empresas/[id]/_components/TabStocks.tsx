"use client";

import { useState } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { SearchEnterpriseInput } from "@/components/shared/SearchEnterpriseInput";
import { getStockColumns, Stock } from "./logistic-columns";

interface TabStocksProps {
  enterpriseId: string;
  stocks: Stock[];
  onRefresh: () => void;
}

export function TabStocks({ enterpriseId, stocks, onRefresh }: TabStocksProps) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    status: "Ativo",
    tenantId: "",
    tenantName: "",
  });

  const handleEdit = (row: Stock) => {
    setEditingId(row.publicCode);
    setFormData({
      description: row.description,
      status: row.status,
      tenantId: row.tenantId?.toString() || "",
      tenantName: row.tenant?.legalName || "",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (publicCode: string) => {
    if (!confirm("Tem certeza que deseja excluir este estoque?")) return;

    try {
      const response = await fetch(`/api/stocks/${publicCode}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Erro ao excluir estoque");
        return;
      }

      toast.success("Estoque excluído com sucesso!");
      onRefresh();
    } catch {
      toast.error("Erro ao excluir estoque");
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!formData.description) {
      toast.error("A descrição é obrigatória");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `/api/stocks/${editingId}` : "/api/stocks";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tenantId: formData.tenantId ? String(formData.tenantId) : null,
          enterpriseId,
        }),
      });

      if (!response.ok) {
        toast.error("Erro ao salvar estoque");
        return;
      }

      toast.success(editingId ? "Estoque atualizado!" : "Estoque adicionado!");
      setFormData({
        description: "",
        status: "Ativo",
        tenantId: "",
        tenantName: "",
      });
      setEditingId(null);
      onRefresh();
    } catch (error) {
      console.error("Error saving stock:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const columns = getStockColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/20">
        <h3 className="text-slate-200 text-sm font-semibold mb-4">
          {editingId ? "Editar Estoque" : "Cadastrar Estoque"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Estoque Principal"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-10"
            />
          </div>
          <div className="md:col-span-3 space-y-2">
            <Label>Depositante</Label>
            <SearchEnterpriseInput
              endpoint="/api/pessoas"
              extraFilters={{ isTenant: true, enterpriseId }}
              displayValue={formData.tenantName}
              onSelect={(p) =>
                setFormData({
                  ...formData,
                  tenantId: p?.id?.toString() || "",
                  tenantName: p?.legalName || "",
                })
              }
              placeholder="Pesquisar pessoa..."
              className="w-full"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Situação</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-10 gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                <Save className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    description: "",
                    status: "Ativo",
                    tenantId: "",
                    tenantName: "",
                  });
                }}
                className="text-slate-400 h-10"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/50 overflow-hidden">
        <DataTable
          data={stocks}
          columns={columns}
          emptyMessage="Nenhum estoque cadastrado."
          searchable={false}
        />
      </div>
    </div>
  );
}
