"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ItemSaida {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnit: number;
  total: number;
}

const mockItens: ItemSaida[] = [
  {
    id: "1",
    codigo: "PRD047",
    descricao: 'Monitor LED 24" Full HD',
    quantidade: 2,
    valorUnit: 1200.0,
    total: 2400.0,
  },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function SaidaFormPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "SAI001",
    estoqueId: "ee01",
    numero: "NF-001823",
    tipo: "NF-e",
    chaveNfe: "",
    totalNfe: 1260.0,
    observacoes: "",
  });

  const [itens, setItens] = useState<ItemSaida[]>(mockItens);
  const [novoItem, setNovoItem] = useState({
    codigo: "",
    descricao: "",
    quantidade: 0,
    valorUnit: 0,
  });
  const totalItens = itens.reduce((s, i) => s + i.total, 0);

  const handleAddItem = () => {
    if (!novoItem.codigo || !novoItem.quantidade || !novoItem.valorUnit) return;
    const total = novoItem.quantidade * novoItem.valorUnit;
    setItens((prev) => [
      ...prev,
      { id: Date.now().toString(), ...novoItem, total },
    ]);
    setNovoItem({ codigo: "", descricao: "", quantidade: 0, valorUnit: 0 });
    toast.success("Item adicionado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-200"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Editar Saída</h1>
            <p className="text-slate-400 text-sm">Código: {form.codigo}</p>
          </div>
        </div>
        <Button
          onClick={() => toast.success("Saída salva!")}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="save-saida-btn"
        >
          <Save className="w-4 h-4" /> Salvar
        </Button>
      </div>

      {/* Seção 1: Cabeçalho */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <div className="px-6 pt-5 pb-2">
          <h2 className="text-slate-200 font-semibold text-sm">Cabeçalho</h2>
        </div>
        <Separator className="bg-slate-700/50" />
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Código</Label>
              <Input
                value={form.codigo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, codigo: e.target.value }))
                }
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="sai-codigo"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Estoque</Label>
              <Select
                value={form.estoqueId}
                onValueChange={(v) => setForm((p) => ({ ...p, estoqueId: v }))}
              >
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="sai-estoque"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="ee01">
                    EE 01 — Estoque Principal
                  </SelectItem>
                  <SelectItem value="ee02">EE 02 — Depósito Norte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Número</Label>
              <Input
                value={form.numero}
                onChange={(e) =>
                  setForm((p) => ({ ...p, numero: e.target.value }))
                }
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="sai-numero"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm((p) => ({ ...p, tipo: v }))}
              >
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="sai-tipo"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectItem value="NF-e">NF-e</SelectItem>
                  <SelectItem value="CF-e">CF-e</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-slate-300 text-xs">Chave NF-e</Label>
              <Input
                value={form.chaveNfe}
                onChange={(e) =>
                  setForm((p) => ({ ...p, chaveNfe: e.target.value }))
                }
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm font-mono"
                id="sai-chave"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Total NF-e</Label>
              <Input
                type="number"
                value={form.totalNfe}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalNfe: +e.target.value }))
                }
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="sai-total-nfe"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Observações</Label>
            <Textarea
              className="bg-slate-900/50 border-slate-700 text-slate-200 resize-none"
              rows={2}
              id="sai-obs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Itens */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold">Itens da Saída</h2>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Total:</span>
            <span className="text-orange-400 font-bold text-lg">
              {formatCurrency(totalItens)}
            </span>
          </div>
        </div>
        <Separator className="bg-slate-700/50" />
        <CardContent className="pt-4 space-y-4">
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Cód. Produto</Label>
                <Input
                  value={novoItem.codigo}
                  onChange={(e) =>
                    setNovoItem((p) => ({ ...p, codigo: e.target.value }))
                  }
                  placeholder="PRD001"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="sai-item-cod"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-slate-300 text-xs">Descrição</Label>
                <Input
                  value={novoItem.descricao}
                  onChange={(e) =>
                    setNovoItem((p) => ({ ...p, descricao: e.target.value }))
                  }
                  placeholder="Auto-preenchido"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="sai-item-desc"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Quantidade</Label>
                <Input
                  type="number"
                  value={novoItem.quantidade || ""}
                  onChange={(e) =>
                    setNovoItem((p) => ({ ...p, quantidade: +e.target.value }))
                  }
                  placeholder="0"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="sai-item-qtd"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Valor Unitário</Label>
                <Input
                  type="number"
                  value={novoItem.valorUnit || ""}
                  onChange={(e) =>
                    setNovoItem((p) => ({ ...p, valorUnit: +e.target.value }))
                  }
                  placeholder="0.00"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="sai-item-val"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-slate-400 text-xs">
                Total do item:{" "}
                <span className="text-sky-400 font-semibold">
                  {formatCurrency(novoItem.quantidade * novoItem.valorUnit)}
                </span>
              </p>
              <Button
                size="sm"
                onClick={handleAddItem}
                className="bg-sky-500 hover:bg-sky-400 text-white gap-1"
                id="add-sai-item-btn"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Item
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/40">
                <tr>
                  {[
                    "Código",
                    "Nome Produto",
                    "Quantidade",
                    "Valor Unit.",
                    "Total",
                    "Ações",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-slate-400 text-xs font-semibold uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-slate-700/30 hover:bg-slate-700/20"
                  >
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {item.codigo}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.descricao}
                    </td>
                    <td className="px-4 py-3 text-sky-400 font-semibold">
                      {item.quantidade}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatCurrency(item.valorUnit)}
                    </td>
                    <td className="px-4 py-3 text-orange-400 font-bold">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-400"
                        onClick={() =>
                          setItens((p) => p.filter((i) => i.id !== item.id))
                        }
                        id={`del-sai-item-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
