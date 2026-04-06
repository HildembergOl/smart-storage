"use client";

import { useState } from "react";
import { Plus, Save, Loader2, Pencil, Trash2 } from "lucide-react";
import { AttributeSearchSelect } from "@/components/shared/AttributeSearchSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { Column } from "@/components/shared/DataTable";
import { toast } from "sonner";

export interface Embalagem {
  id: string;
  productId: string;
  status: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  barcode: string | null;
  factor: number;
  height: number | null;
  width: number | null;
  length: number | null;
  cubage: number | null;
  grossWeight: number | null;
  netWeight: number | null;
}

interface TabEmbalagemProdutoProps {
  productPublicCode: string;
  embalagens: Embalagem[];
  onRefresh: () => void;
}

const emptyForm = {
  unitOfMeasureId: "",
  unitOfMeasureName: "UN",
  barcode: "",
  factor: "1",
  height: "",
  width: "",
  length: "",
  cubage: "",
  grossWeight: "",
  netWeight: "",
  status: "Ativo",
};

export function TabEmbalagemProduto({ productPublicCode, embalagens, onRefresh }: TabEmbalagemProdutoProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleEdit = (row: Embalagem) => {
    setEditingId(row.id);
    setForm({
      unitOfMeasureId: row.unitOfMeasureId,
      unitOfMeasureName: row.unitOfMeasureName,
      barcode: row.barcode || "",
      factor: String(row.factor),
      height: String(row.height ?? ""),
      width: String(row.width ?? ""),
      length: String(row.length ?? ""),
      cubage: String(row.cubage ?? ""),
      grossWeight: String(row.grossWeight ?? ""),
      netWeight: String(row.netWeight ?? ""),
      status: row.status,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta embalagem?")) return;
    try {
      const res = await fetch(`/api/produtos/${productPublicCode}/embalagens/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Embalagem excluída!"); onRefresh(); }
      else toast.error("Erro ao excluir embalagem.");
    } catch { toast.error("Erro de conexão."); }
  };

  const handleSubmit = async () => {
    if (!form.unitOfMeasureId) { toast.error("Unidade de medida é obrigatória"); return; }
    setLoading(true);
    try {
      const url = editingId
        ? `/api/produtos/${productPublicCode}/embalagens/${editingId}`
        : `/api/produtos/${productPublicCode}/embalagens`;
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(editingId ? "Embalagem atualizada!" : "Embalagem adicionada!");
        setForm(emptyForm);
        setEditingId(null);
        onRefresh();
      } else {
        toast.error("Erro ao salvar embalagem.");
      }
    } catch { toast.error("Erro de conexão."); }
    finally { setLoading(false); }
  };

  const numInput = (field: keyof typeof form, placeholder: string) => ({
    type: "number" as const,
    step: "any",
    placeholder,
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value })),
    className: "bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm font-mono",
  });

  const columns: Column<Embalagem>[] = [
    { key: "id", label: "Código", className: "font-mono text-xs" },
    { key: "unitOfMeasureName", label: "Unidade" },
    { key: "barcode", label: "Cód. barras", className: "font-mono text-xs", render: (v) => <span className="text-slate-400">{String(v || "—")}</span> },
    { key: "factor", label: "Fator" },
    { key: "grossWeight", label: "Peso bruto", render: (v) => <span className="text-slate-400">{v ? String(v) : "—"}</span> },
    { key: "netWeight", label: "Peso líquido", render: (v) => <span className="text-slate-400">{v ? String(v) : "—"}</span> },
    {
      key: "status",
      label: "Situação",
      render: (v) => (
        <Badge className={v === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"}>
          {String(v)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleEdit(row)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => handleDelete(row.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/20">
        <h3 className="text-slate-200 text-sm font-semibold mb-4">
          {editingId ? "Editar Embalagem" : "Cadastrar Embalagem"}
        </h3>
        <div className="space-y-4">
          {/* Unidade + Código Barras + Fator + Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Unidade de medida</Label>
              <AttributeSearchSelect
                type="unidade_medida"
                label="Unidade"
                value={form.unitOfMeasureId}
                displayText={form.unitOfMeasureName}
                onValueChange={(id, name) => setForm(f => ({ ...f, unitOfMeasureId: id, unitOfMeasureName: name }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Código de barras</Label>
              <Input
                placeholder="EAN/GTIN"
                value={form.barcode}
                onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Fator de conversão</Label>
              <Input {...numInput("factor", "1")} />
            </div>
            <div className="space-y-2">
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dimensões */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input {...numInput("height", "0")} />
            </div>
            <div className="space-y-2">
              <Label>Largura (cm)</Label>
              <Input {...numInput("width", "0")} />
            </div>
            <div className="space-y-2">
              <Label>Comprimento (cm)</Label>
              <Input {...numInput("length", "0")} />
            </div>
            <div className="space-y-2">
              <Label>Cubagem (m³)</Label>
              <Input {...numInput("cubage", "0")} />
            </div>
            <div className="space-y-2">
              <Label>Peso bruto (kg)</Label>
              <Input {...numInput("grossWeight", "0")} />
            </div>
            <div className="space-y-2">
              <Label>Peso líquido (kg)</Label>
              <Input {...numInput("netWeight", "0")} />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button type="button" onClick={handleSubmit} disabled={loading} className="bg-sky-500 hover:bg-sky-400 text-white h-9 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Salvar" : "Adicionar"}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-slate-400 h-9">
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/50 overflow-hidden">
        <DataTable<Embalagem> data={embalagens} columns={columns} emptyMessage="Nenhuma embalagem cadastrada." searchable={false} />
      </div>
    </div>
  );
}
