"use client";

import { useState } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/shared/DataTable";
import { toast } from "sonner";
import { getSectionColumns, Section } from "./logistic-columns";

interface TabSectionsProps {
  enterpriseId: string;
  sections: Section[];
  onRefresh: () => void;
}

export function TabSections({ enterpriseId, sections, onRefresh }: TabSectionsProps) {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: "",
  });

  const handleEdit = (row: Section) => {
    setEditingId(row.publicCode);
    setFormData({
      description: row.description,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (publicCode: string) => {
    if (!confirm("Tem certeza que deseja excluir este setor?")) return;

    try {
      const response = await fetch(`/api/sections/${publicCode}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Erro ao excluir setor");
        return;
      }

      toast.success("Setor excluído com sucesso!");
      onRefresh();
    } catch {
      toast.error("Erro ao excluir setor");
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
      const url = editingId ? `/api/sections/${editingId}` : "/api/sections";
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
        toast.error("Erro ao salvar setor");
        return;
      }

      toast.success(editingId ? "Setor atualizado!" : "Setor adicionado!");
      setFormData({ description: "" });
      setEditingId(null);
      onRefresh();
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const columns = getSectionColumns(handleEdit, handleDelete);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/20">
        <h3 className="text-slate-200 text-sm font-semibold mb-4">
          {editingId ? "Editar Setor" : "Cadastrar Setor"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-9 space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Setor A - Eletrônicos"
              value={formData.description}
              onChange={(e) => setFormData({ description: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-10"
            />
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
                  setFormData({ description: "" });
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
          data={sections}
          columns={columns}
          emptyMessage="Nenhum setor cadastrado."
          searchable={false}
        />
      </div>
    </div>
  );
}
