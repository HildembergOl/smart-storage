"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchEnterpriseInput } from "@/components/shared/SearchEnterpriseInput";
import { toast } from "sonner";

import { useParams } from "next/navigation";
import { useApp } from "@/lib/contexts/AppContext";

export interface ItemSaida {
  id: string;
  productId: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnit: number;
  total: number;
}

export interface FormOrderProps {
  id?: string;
  codigo?: string;
  stockId?: string;
  personId?: string;
  personName?: string;
  number?: string;
  type?: string;
  chaveNfe?: string;
  totalProduto?: number;
  totalNfe?: number;
  observacoes?: string;
}

export interface StockOption {
  id: string;
  description: string;
}

export interface ItemEntryProps {
  id?: string;
  productId?: string;
  codigo?: string;
  descricao?: string;
  quantidade?: number;
  valorUnit?: number;
}

interface ProductResult {
  id: string;
  publicCode: string;
  description: string;
  unitOfMeasureName?: string;
}

interface TabInfoSaidaProps {
  form: FormOrderProps;
  setForm: React.Dispatch<React.SetStateAction<FormOrderProps>>;
  itens: ItemSaida[];
  setItens: React.Dispatch<React.SetStateAction<ItemSaida[]>>;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export function TabInfoSaida({
  form,
  setForm,
  itens,
  setItens,
}: TabInfoSaidaProps) {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "novo";
  const {
    enterpriseId: activeEnterpriseId,
    enterprisePublicCode,
    ready,
  } = useApp();

  const [stocks, setStocks] = useState<StockOption[]>([]);

  // Inputs state for adding/editing items
  const [novoItem, setNovoItem] = useState<ItemEntryProps>({});
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Product Autocomplete Dropdown State
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Load stocks list
  useEffect(() => {
    if (!ready || !enterprisePublicCode) return;
    async function fetchStocks() {
      try {
        const res = await fetch(
          `/api/stocks?enterpriseId=${enterprisePublicCode}&status=Ativo`,
        );
        if (res.ok) {
          const data = await res.json();
          setStocks(data);
        }
      } catch (err) {
        console.error("Error fetching stocks list:", err);
      }
    }
    fetchStocks();
  }, [ready, enterprisePublicCode]);

  // Product autocomplete search effect
  useEffect(() => {
    if (productSearch.length < 2) {
      setProductResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setProductLoading(true);
      try {
        const res = await fetch(
          `/api/produtos?enterpriseId=${enterprisePublicCode}&search=${productSearch}&status=Ativo`,
        );
        if (res.ok) {
          const data = await res.json();
          setProductResults(data);
        }
      } catch (err) {
        console.error("Error searching products:", err);
      } finally {
        setProductLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, enterprisePublicCode]);

  // Delete Item from list
  const handleDeleteItem = async (item: ItemSaida) => {
    if (isNew) {
      setItens((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Item removido da lista.");
    } else {
      try {
        const res = await fetch(`/api/saidas/${id}/items?itemId=${item.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setItens((prev) => prev.filter((i) => i.id !== item.id));
          toast.success("Item excluído do banco com sucesso!");
        } else {
          const data = await res.json();
          toast.error(data.error || "Erro ao excluir item");
        }
      } catch {
        toast.error("Erro ao conectar ao servidor para excluir item");
      }
    }
  };

  // Add/Update Item
  const handleAddItem = async () => {
    const productId = novoItem.productId;
    const codigo = novoItem.codigo;
    const descricao = novoItem.descricao;
    const quantidade = novoItem.quantidade;
    const valorUnit = novoItem.valorUnit;

    if (!productId || !codigo || !descricao || !quantidade || !valorUnit) {
      toast.error("Preencha todos os campos do item.");
      return;
    }

    if (editingItemId) {
      if (isNew) {
        setItens((prev) =>
          prev.map((i) =>
            i.id === editingItemId
              ? {
                  ...i,
                  productId,
                  codigo,
                  descricao,
                  quantidade,
                  valorUnit,
                  total: quantidade * valorUnit,
                }
              : i,
          ),
        );
        setEditingItemId(null);
        setNovoItem({});
        setProductSearch("");
        return toast.success("Item atualizado!");
      } else {
        try {
          const res = await fetch(
            `/api/saidas/${id}/items?itemId=${editingItemId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId,
                quantity: Number(quantidade),
                unitValue: Number(valorUnit),
              }),
            },
          );

          if (res.ok) {
            const data = await res.json();
            setItens((prev) =>
              prev.map((i) =>
                i.id === editingItemId
                  ? {
                      id: data.id,
                      productId: data.productId,
                      codigo: data.codigo,
                      descricao: data.descricao,
                      quantidade: data.quantity,
                      valorUnit: data.unitValue,
                      total: data.total,
                    }
                  : i,
              ),
            );
            toast.success("Item atualizado com sucesso!");
            setEditingItemId(null);
            setNovoItem({});
            setProductSearch("");
          } else {
            const data = await res.json();
            toast.error(data.error || "Erro ao atualizar item");
          }
        } catch {
          toast.error("Erro ao salvar item");
        }
        return;
      }
    }

    const hasItem = itens.some((i) => i.productId === productId);
    if (hasItem) {
      toast.error("Item já adicionado");
      return;
    }

    if (isNew) {
      const total = quantidade * valorUnit;
      setItens((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          productId,
          codigo,
          descricao,
          quantidade,
          valorUnit,
          total,
        },
      ]);
      setNovoItem({});
      setProductSearch("");
      return toast.success("Item adicionado!");
    } else {
      try {
        const res = await fetch(`/api/saidas/${id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            quantity: Number(quantidade),
            unitValue: Number(valorUnit),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setItens((prev) => [
            ...prev,
            {
              id: data.id,
              productId: data.productId,
              codigo: data.codigo,
              descricao: data.descricao,
              quantidade: data.quantity,
              valorUnit: data.unitValue,
              total: data.total,
            },
          ]);
          toast.success("Item adicionado com sucesso!");
          setNovoItem({});
          setProductSearch("");
        } else {
          const data = await res.json();
          toast.error(data.error || "Erro ao adicionar item à saída");
        }
      } catch {
        toast.error("Erro ao salvar item");
      }
    }
  };

  const totalItens = itens.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Informações da Nota */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Estoque</Label>
            <Select
              value={form.stockId || ""}
              onValueChange={(v) => setForm((p) => ({ ...p, stockId: v }))}
            >
              <SelectTrigger
                className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                id="sai-estoque"
              >
                <SelectValue placeholder="Selecionar Estoque..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {stocks.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-semibold">
              Cliente (Pessoa)
            </Label>
            <SearchEnterpriseInput
              endpoint="/api/pessoas"
              extraFilters={{
                isClient: true,
                enterpriseId: activeEnterpriseId || "",
              }}
              displayValue={form.personName || ""}
              onSelect={(p) =>
                setForm((prev) => ({
                  ...prev,
                  personId: p?.id?.toString() || "",
                  personName: p?.legalName || "",
                }))
              }
              placeholder="Pesquisar cliente..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Número NF</Label>
            <Input
              value={form.number || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, number: e.target.value }))
              }
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm font-mono"
              id="sai-numero"
              placeholder="NF-000000"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs">Tipo</Label>
            <Select
              value={form.type || ""}
              onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
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
              value={form.chaveNfe || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, chaveNfe: e.target.value }))
              }
              className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm font-mono"
              id="sai-chave"
              placeholder="Chave de 44 dígitos"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Total Produto</Label>
              <div className="bg-slate-900/70 border border-slate-700 rounded-md px-3 h-9 flex items-center text-orange-400 font-bold text-sm">
                {formatCurrency(totalItens)}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Total NF-e</Label>
              <Input
                value={form.totalNfe || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalNfe: +e.target.value }))
                }
                type="number"
                className="bg-slate-900/50 border-slate-700 h-9 text-sm font-semibold text-orange-400"
                id="sai-total-nfe"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Observações</Label>
          <Textarea
            value={form.observacoes || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, observacoes: e.target.value }))
            }
            className="bg-slate-900/50 border-slate-700 text-slate-200 resize-none"
            rows={2}
            id="sai-obs"
            placeholder="Observações internas..."
          />
        </div>
      </div>

      {/* Itens da Saída */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h2 className="text-slate-200 font-semibold text-sm">
            Itens da Saída
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs">Total:</span>
            <span className="text-orange-400 font-bold text-base">
              {formatCurrency(totalItens)}
            </span>
          </div>
        </div>
        <Separator className="bg-slate-700/50" />
        <CardContent className="pt-4 space-y-4">
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-2 relative space-y-1">
                <Label className="text-slate-300 text-xs">Produto</Label>
                <Input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  placeholder="Digite nome/descrição..."
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="item-prod-search"
                  onFocus={() => setShowProductDropdown(true)}
                />
                {showProductDropdown &&
                  (productResults.length > 0 || productLoading) && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl max-h-60 overflow-auto">
                      {productLoading ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Buscando...
                        </div>
                      ) : (
                        <ul className="py-1">
                          {productResults.map((p) => (
                            <li
                              key={p.id}
                              onClick={() => {
                                setNovoItem({
                                  ...novoItem,
                                  productId: p.id,
                                  codigo: p.publicCode,
                                  descricao: p.description,
                                });
                                setProductSearch(p.description);
                                setShowProductDropdown(false);
                              }}
                              className="px-3 py-2 text-sm text-slate-200 hover:bg-sky-500/20 cursor-pointer flex flex-col gap-0.5"
                            >
                              <span className="font-medium text-slate-100">
                                {p.description}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Cód: {p.id} | Medida:{" "}
                                {p.unitOfMeasureName || "UN"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Quantidade</Label>
                <Input
                  type="number"
                  value={novoItem.quantidade ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNovoItem((p) => ({
                      ...p,
                      quantidade: val === "" ? undefined : Number(val),
                    }));
                  }}
                  placeholder="0"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="item-qtd-input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs font-semibold">
                  Valor Unitário (R$)
                </Label>
                <Input
                  type="number"
                  value={novoItem.valorUnit ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNovoItem((p) => ({
                      ...p,
                      valorUnit: val === "" ? undefined : Number(val),
                    }));
                  }}
                  placeholder="0.00"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="item-val-input"
                />
              </div>
              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddItem}
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-white gap-1 h-8 text-xs font-semibold"
                  id="add-item-btn"
                >
                  {editingItemId ? (
                    <Save className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {editingItemId ? "Atualizar" : "Adicionar Item"}
                </Button>
                {editingItemId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingItemId(null);
                      setNovoItem({});
                      setProductSearch("");
                    }}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 h-8 text-xs font-medium px-2"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-slate-400 text-xs">
                Subtotal do item:{" "}
                <span className="text-sky-400 font-semibold">
                  {formatCurrency(
                    (novoItem.quantidade || 0) * (novoItem.valorUnit || 0),
                  )}
                </span>
              </p>
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
                {itens.map((item, i) => (
                  <tr
                    key={item.id || i}
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
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-sky-400"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setNovoItem({
                              productId: item.productId,
                              codigo: item.codigo,
                              descricao: item.descricao,
                              quantidade: item.quantidade,
                              valorUnit: item.valorUnit,
                            });
                            setProductSearch(item.descricao);
                          }}
                          id={`edit-item-${item.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-400"
                          onClick={() => handleDeleteItem(item)}
                          id={`del-item-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {itens.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500 text-sm"
                    >
                      Nenhum item adicionado a esta saída.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
