"use client";

import { useState } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import {
  getPositionColumns,
  Position,
  Stock,
  Section,
} from "./logistic-columns";

interface TabPositionsProps {
  enterpriseId: string;
  positions: Position[];
  stocks: Stock[];
  sections: Section[];
  onRefresh: () => void;
}

export function TabPositions({
  enterpriseId,
  positions,
  stocks,
  sections,
  onRefresh,
}: TabPositionsProps) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    stockId: "",
    sectionId: "",
    aisle: "",
    block: "",
    floor: "",
    location: "",
  });

  const handleEdit = (row: Position) => {
    setEditingId(row.publicCode || null);
    setFormData({
      stockId: row.stockId.toString(),
      sectionId: row.sectionId.toString(),
      aisle: row.aisle || "",
      block: row.block || "",
      floor: row.floor || "",
      location: row.location || "",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (publicCode: string) => {
    if (!confirm("Tem certeza que deseja excluir esta posição?")) return;

    try {
      const response = await fetch(`/api/positions/${publicCode}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Erro ao excluir posição");
        return;
      }

      toast.success("Posição excluída com sucesso!");
      onRefresh();
    } catch {
      toast.error("Erro ao excluir posição");
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!formData.stockId || !formData.sectionId) {
      toast.error("Estoque e Setor são obrigatórios");
      return;
    }
    if (
      !formData.aisle ||
      !formData.block ||
      !formData.floor ||
      !formData.location
    ) {
      toast.error("Rua, Bloco, Andar e Locação são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `/api/positions/${editingId}` : "/api/positions";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          enterpriseId,
        }),
      });

      if (!response.ok) {
        toast.error("Erro ao salvar posição");
        return;
      }

      toast.success(editingId ? "Posição atualizada!" : "Posição adicionada!");
      setFormData({
        stockId: "",
        sectionId: "",
        aisle: "",
        block: "",
        floor: "",
        location: "",
      });
      setEditingId(null);
      onRefresh();
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const columns = getPositionColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/20">
        <h3 className="text-slate-200 text-sm font-semibold mb-4">
          {editingId ? "Editar Posição" : "Cadastrar Posição"}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Select
                value={formData.stockId}
                onValueChange={(v) => setFormData({ ...formData, stockId: v })}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-10">
                  <SelectValue placeholder="Selecione o estoque">
                    {stocks.find((s) => s.id.toString() === formData.stockId)
                      ?.description || "Selecione o estoque"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  {stocks.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Setor</Label>
              <Select
                value={formData.sectionId}
                onValueChange={(v) =>
                  setFormData({ ...formData, sectionId: v })
                }
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-10">
                  <SelectValue placeholder="Selecione o setor">
                    {sections.find(
                      (s) => s.id.toString() === formData.sectionId,
                    )?.description || "Selecione o setor"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  {sections.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      {s.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label>Rua</Label>
              <Input
                placeholder="Ex: 01"
                value={formData.aisle}
                onChange={(e) =>
                  setFormData({ ...formData, aisle: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-10 font-mono"
                type="number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Bloco</Label>
              <Input
                placeholder="Ex: 1"
                value={formData.block}
                onChange={(e) =>
                  setFormData({ ...formData, block: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                type="number"
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-10 font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Andar</Label>
              <Input
                placeholder="Ex: 1"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                type="number"
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-10 font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Locação</Label>
              <Input
                placeholder="Ex: 10"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                type="number"
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-10 font-mono"
                required
              />
            </div>
            <div className="col-span-2 lg:col-span-1 flex gap-2">
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
                      stockId: "",
                      sectionId: "",
                      aisle: "",
                      block: "",
                      floor: "",
                      location: "",
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
      </div>

      <div className="rounded-lg border border-slate-700/50 overflow-hidden">
        <DataTable
          data={positions}
          columns={columns}
          emptyMessage="Nenhuma posição cadastrada."
          searchable={false}
        />
      </div>
    </div>
  );
}
