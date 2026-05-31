"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

export interface Fatura {
  id: string;
  paymentMethod: string;
  number: string;
  dueDate: string;
  value: number;
}

interface TabFaturasEntradaProps {
  faturas: Fatura[];
  setFaturas: React.Dispatch<React.SetStateAction<Fatura[]>>;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export function TabFaturasEntrada({
  faturas,
  setFaturas,
}: TabFaturasEntradaProps) {
  // Inputs state for adding new faturas
  const [novaFatura, setNovaFatura] = useState({
    paymentMethod: "boleto",
    number: "",
    dueDate: "",
    value: 0,
  });

  // Add Fatura to local list
  const handleAddFatura = () => {
    if (!novaFatura.number || !novaFatura.dueDate || !novaFatura.value) {
      toast.error("Preencha todos os campos da fatura.");
      return;
    }
    setFaturas((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        paymentMethod: novaFatura.paymentMethod,
        number: novaFatura.number,
        dueDate: novaFatura.dueDate,
        value: Number(novaFatura.value),
      },
    ]);
    setNovaFatura({
      paymentMethod: "boleto",
      number: "",
      dueDate: "",
      value: 0,
    });
    toast.success("Fatura adicionada!");
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
        <h3 className="text-slate-300 text-sm font-semibold">Nova Fatura</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-slate-300 text-xs">Forma de Pagamento</Label>
            <Select
              value={novaFatura.paymentMethod}
              onValueChange={(v) =>
                setNovaFatura((p) => ({ ...p, paymentMethod: v }))
              }
            >
              <SelectTrigger
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-xs"
                id="fat-forma-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Pix">PIX</SelectItem>
                <SelectItem value="Cartao">Cartão de Crédito</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-slate-300 text-xs">Número da Fatura</Label>
            <Input
              placeholder="Ex: FAT-001"
              value={novaFatura.number}
              onChange={(e) =>
                setNovaFatura((p) => ({ ...p, number: e.target.value }))
              }
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-xs font-mono"
              id="fat-num-input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-slate-300 text-xs">Vencimento</Label>
            <Input
              type="date"
              value={novaFatura.dueDate}
              onChange={(e) =>
                setNovaFatura((p) => ({
                  ...p,
                  dueDate: e.target.value,
                }))
              }
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-xs"
              id="fat-venc-input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-slate-300 text-xs">Valor (R$)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={novaFatura.value || ""}
              onChange={(e) =>
                setNovaFatura((p) => ({ ...p, value: +e.target.value }))
              }
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-xs"
              id="fat-valor-input"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddFatura}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-1"
          id="add-fatura-btn"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </Button>
      </div>

      <div className="rounded-lg border border-slate-700/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40">
            <tr>
              {["Número", "Forma Pag.", "Vencimento", "Valor", "Ações"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-slate-400 text-xs font-semibold uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {faturas.map((f, i) => (
              <tr
                key={f.id || i}
                className="border-t border-slate-700/30 hover:bg-slate-700/20"
              >
                <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">
                  {f.number}
                </td>
                <td className="px-4 py-2.5 text-slate-300">
                  {f.paymentMethod}
                </td>
                <td className="px-4 py-2.5 text-slate-400">
                  {new Date(f.dueDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-2.5 text-emerald-400 font-semibold">
                  {formatCurrency(f.value)}
                </td>
                <td className="px-4 py-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-red-400"
                    onClick={() =>
                      setFaturas((prev) =>
                        prev.filter((item) => item.id !== f.id),
                      )
                    }
                    id={`del-fat-${f.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {faturas.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhuma fatura lançada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
