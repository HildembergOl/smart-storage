"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Save, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useApp } from "@/lib/contexts/AppContext";
import { InventoryFormHeader, InventoryFormItem } from "../page";

interface ProductResult {
  id: string;
  publicCode: string;
  description: string;
  controlType: string;
}

interface PositionOption {
  id: string;
  publicCode: string | null;
  barcode: string | null;
  aisle: string | null;
  block: string | null;
  floor: string | null;
  location: string | null;
}

export interface ItemContagemInput {
  id?: string;
  productId?: string;
  codigo?: string;
  descricao?: string;
  controlType?: string;
  positionId?: string;
  positionCode?: string;
  batch?: string;
  expiry?: string;
  manufacturingDate?: string;
  serialNumber?: string;
  grid?: string;
  quantity?: number;
}

interface TabInfoInventarioProps {
  form: InventoryFormHeader;
  setForm: React.Dispatch<React.SetStateAction<InventoryFormHeader>>;
  items: InventoryFormItem[];
  setItems: React.Dispatch<React.SetStateAction<InventoryFormItem[]>>;
  onRefresh: () => Promise<void>;
}

export function TabInfoInventario({
  form,
  setForm,
  items,
  setItems,
  onRefresh,
}: TabInfoInventarioProps) {
  const { enterprisePublicCode, ready } = useApp();
  const isFinished = form.status === "Finalizado";

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const posInputRef = useRef<HTMLInputElement>(null);
  const eanInputRef = useRef<HTMLInputElement>(null);

  const [manterPosicao, setManterPosicao] = useState(false);

  // Item form states
  const [novoItem, setNovoItem] = useState<ItemContagemInput>({
    positionId: "",
    positionCode: "",
    batch: "",
    expiry: "",
    manufacturingDate: "",
    serialNumber: "",
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Autocomplete products
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductResult[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // EAN search state
  const [eanSearch, setEanSearch] = useState("");
  const [eanLoading, setEanLoading] = useState(false);
  const [eanError, setEanError] = useState(false);
  const [eanFoundProduct, setEanFoundProduct] = useState<string | null>(null);

  // Positions selection
  const [positions, setPositions] = useState<PositionOption[]>([]);

  // Load physical positions for this stock to validate on frontend
  useEffect(() => {
    if (!ready || !enterprisePublicCode || !form.stockId) return;
    async function fetchPositions() {
      try {
        const res = await fetch(
          `/api/positions?enterpriseId=${enterprisePublicCode}&stockId=${form.stockId}`,
        );
        if (res.ok) {
          const data = await res.json();
          setPositions(data);
        }
      } catch (err) {
        console.error("Error fetching positions:", err);
      }
    }
    fetchPositions();
  }, [ready, enterprisePublicCode, form.stockId]);

  // Product autocomplete search (does not verify EAN)
  useEffect(() => {
    if (novoItem.productId) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }
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
  }, [productSearch, enterprisePublicCode, novoItem.productId]);

  // EAN product scanning search
  useEffect(() => {
    if (eanSearch.length < 3) {
      setEanError(false);
      setEanFoundProduct(null);
      return;
    }
    const timer = setTimeout(async () => {
      setEanLoading(true);
      setEanError(false);
      try {
        const res = await fetch(
          `/api/produtos?enterpriseId=${enterprisePublicCode}&ean=${eanSearch}&status=Ativo`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const p = data[0];
            setNovoItem((prev) => ({
              ...prev,
              productId: p.id,
              codigo: p.publicCode,
              descricao: p.description,
              controlType: p.controlType,
            }));
            setProductSearch(p.description);
            setEanFoundProduct(p.description);
            setEanError(false);
            setShowProductDropdown(false);
            toast.success(`EAN Localizado: ${p.description}`);
            setTimeout(() => {
              qtyInputRef.current?.focus();
            }, 50);
          } else {
            setEanError(true);
            setEanFoundProduct(null);
            setProductSearch("");
            setNovoItem((prev) => ({
              ...prev,
              productId: undefined,
              codigo: undefined,
              descricao: undefined,
              controlType: undefined,
            }));
            toast.error("Produto não encontrado.");
          }
        }
      } catch (err) {
        console.error("Error searching product by EAN:", err);
        setEanError(true);
        setEanFoundProduct(null);
        setProductSearch("");
        setNovoItem((prev) => ({
          ...prev,
          productId: undefined,
          codigo: undefined,
          descricao: undefined,
          controlType: undefined,
        }));
        toast.error("Produto não encontrado.");
      } finally {
        setEanLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [eanSearch, enterprisePublicCode]);

  // Frontend Position Validation Lookup
  const matchedPosition = novoItem.positionCode
    ? positions.find(
        (pos) =>
          pos.barcode === novoItem.positionCode ||
          pos.publicCode === novoItem.positionCode ||
          pos.id.toString() === novoItem.positionCode ||
          [pos.aisle, pos.block, pos.floor, pos.location]
            .filter(Boolean)
            .join("")
            .replace(/\s+/g, "")
            .toLowerCase() ===
            novoItem.positionCode?.replace(/\s+/g, "").toLowerCase(),
      )
    : null;

  // Add or edit counted item
  const handleSaveItem = async () => {
    if (isFinished) return;
    const {
      productId,
      quantity,
      positionCode,
      batch,
      expiry,
      serialNumber,
      grid,
    } = novoItem;

    if (!productId || quantity === undefined) {
      toast.error(
        "Por favor, selecione um produto e insira a quantidade contada.",
      );
      return;
    }

    if (!positionCode) {
      toast.error("Por favor, bipado ou digitada a posição logística.");
      return;
    }

    if (!matchedPosition) {
      toast.error("Posição inválida. Verifique o código bipado.");
      return;
    }

    if (novoItem.controlType === "Lote") {
      if (!batch) {
        toast.error("Por favor, informe o lote.");
        return;
      }
      if (!novoItem.manufacturingDate) {
        toast.error("Por favor, informe a data de fabricação.");
        return;
      }
    }

    if (novoItem.controlType === "Validade") {
      if (!expiry) {
        toast.error("Por favor, informe a data de validade.");
        return;
      }
    }

    if (novoItem.controlType === "Grade") {
      if (!grid) {
        toast.error("Por favor, informe a grade.");
        return;
      }
    }

    if (novoItem.controlType === "NumeroSerie") {
      if (!serialNumber) {
        toast.error("Por favor, informe o número de série.");
        return;
      }
    }

    const payload = {
      productId,
      quantity,
      positionId: matchedPosition.id.toString(),
      positionCode,
      batch: batch || null,
      expiry: expiry || null,
      manufacturingDate: novoItem.manufacturingDate || null,
      serialNumber: serialNumber || null,
      grid: grid || null,
    };

    const areDatesEqual = (
      d1: string | null | undefined,
      d2: string | null | undefined,
    ) => {
      if (!d1 && !d2) return true;
      if (!d1 || !d2) return false;
      try {
        const date1 = new Date(d1).toISOString().split("T")[0];
        const date2 = new Date(d2).toISOString().split("T")[0];
        return date1 === date2;
      } catch {
        return false;
      }
    };

    const previousItems = items;

    try {
      if (editingItemId) {
        const itemInList = previousItems.find((i) => i.id === editingItemId);
        if (!itemInList) return;

        const updatedLocalItem: InventoryFormItem = {
          ...itemInList,
          quantity,
          batch: batch || null,
          expiry: expiry ? new Date(expiry).toISOString() : null,
          manufacturingDate: novoItem.manufacturingDate
            ? new Date(novoItem.manufacturingDate).toISOString()
            : null,
          serialNumber: serialNumber || null,
          grid: grid || null,
          positionId: matchedPosition.id.toString(),
          position: {
            id: matchedPosition.id.toString(),
            publicCode: matchedPosition.publicCode || "",
            aisle: matchedPosition.aisle,
            block: matchedPosition.block,
            floor: matchedPosition.floor,
            location: matchedPosition.location,
          },
          saving: "pending" as const,
        };

        // Optimistically update list
        setItems((prev) =>
          prev.map((i) => (i.id === editingItemId ? updatedLocalItem : i)),
        );

        // Edit counted item
        const res = await fetch(`/api/inventario/${form.publicCode}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: editingItemId,
            ...payload,
          }),
        });

        if (res.ok) {
          const savedItem = await res.json();
          toast.success("Item atualizado na contagem!");
          setEditingItemId(null);
          setNovoItem((prev) => ({
            positionId: manterPosicao ? prev.positionId : "",
            positionCode: manterPosicao ? prev.positionCode : "",
            batch: "",
            expiry: "",
            manufacturingDate: "",
            serialNumber: "",
            grid: "",
          }));
          setProductSearch("");
          setEanSearch("");

          // Update local state with DB response + success flag
          setItems((prev) =>
            prev.map((i) =>
              i.id === editingItemId
                ? { ...savedItem, saving: "success" as const }
                : i,
            ),
          );

          // Clear success flag after timeout
          const finalId = savedItem.id;
          setTimeout(() => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === finalId ? { ...i, saving: undefined } : i,
              ),
            );
          }, 2500);

          setTimeout(() => {
            if (manterPosicao) {
              eanInputRef.current?.focus();
            } else {
              posInputRef.current?.focus();
            }
          }, 50);
        } else {
          // Revert on error
          setItems(previousItems);
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || "Erro ao atualizar item.");
        }
      } else {
        // Find if an identical item exists in the list (for accumulation)
        const existingIndex = previousItems.findIndex((item) => {
          const matchProduct = item.productId === productId;
          const matchPosition =
            (item.positionId || null) ===
            (matchedPosition.id.toString() || null);
          const matchBatch = (item.batch || null) === (batch || null);
          const matchExpiry = areDatesEqual(item.expiry, expiry);
          const matchMfg = areDatesEqual(
            item.manufacturingDate,
            novoItem.manufacturingDate,
          );
          const matchSerial =
            (item.serialNumber || null) === (serialNumber || null);
          const matchGrid = (item.grid || null) === (grid || null);
          return (
            matchProduct &&
            matchPosition &&
            matchBatch &&
            matchExpiry &&
            matchMfg &&
            matchSerial &&
            matchGrid
          );
        });

        let targetId: string;
        if (existingIndex !== -1) {
          const existingItem = previousItems[existingIndex];
          targetId = existingItem.id;

          const updatedLocalItem: InventoryFormItem = {
            ...existingItem,
            quantity: existingItem.quantity + quantity,
            saving: "pending" as const,
          };

          setItems((prev) =>
            prev.map((i, idx) =>
              idx === existingIndex ? updatedLocalItem : i,
            ),
          );
        } else {
          const tempId = `temp-${Date.now()}`;
          targetId = tempId;

          const tempLocalItem: InventoryFormItem = {
            id: tempId,
            productId,
            positionId: matchedPosition.id.toString(),
            batch: batch || null,
            expiry: expiry ? new Date(expiry).toISOString() : null,
            manufacturingDate: novoItem.manufacturingDate
              ? new Date(novoItem.manufacturingDate).toISOString()
              : null,
            serialNumber: serialNumber || null,
            grid: grid || null,
            userId: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            quantity,
            recordedQty: 0,
            saving: "pending" as const,
            product: {
              id: productId,
              publicCode: novoItem.codigo || "",
              description: novoItem.descricao || "",
              controlType: novoItem.controlType || "Padrao",
            },
            position: {
              id: matchedPosition.id.toString(),
              publicCode: matchedPosition.publicCode || "",
              aisle: matchedPosition.aisle,
              block: matchedPosition.block,
              floor: matchedPosition.floor,
              location: matchedPosition.location,
            },
          };

          setItems((prev) => [tempLocalItem, ...prev]);
        }

        // Add new counted item
        const res = await fetch(`/api/inventario/${form.publicCode}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const savedItem = await res.json();
          toast.success("Item adicionado à contagem!");
          setNovoItem((prev) => ({
            positionId: manterPosicao ? prev.positionId : "",
            positionCode: manterPosicao ? prev.positionCode : "",
            batch: "",
            expiry: "",
            manufacturingDate: "",
            serialNumber: "",
            grid: "",
          }));
          setProductSearch("");
          setEanSearch("");

          // Update local state with real DB item and success state
          setItems((prev) =>
            prev.map((i) =>
              i.id === targetId
                ? { ...savedItem, saving: "success" as const }
                : i,
            ),
          );

          // Clear success flag after timeout
          const finalId = savedItem.id;
          setTimeout(() => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === finalId ? { ...i, saving: undefined } : i,
              ),
            );
          }, 2500);

          setTimeout(() => {
            if (manterPosicao) {
              eanInputRef.current?.focus();
            } else {
              posInputRef.current?.focus();
            }
          }, 50);
        } else {
          // Revert on error
          setItems(previousItems);
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || "Erro ao adicionar item.");
        }
      }
    } catch {
      setItems(previousItems);
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  // Delete counted item
  const handleDeleteItem = async (itemId: string) => {
    if (isFinished) return;
    const previousItems = items;

    // Optimistically update list
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      const res = await fetch(
        `/api/inventario/${form.publicCode}/items?itemId=${itemId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        toast.success("Item removido da contagem.");
      } else {
        setItems(previousItems);
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Erro ao remover item.");
      }
    } catch {
      setItems(previousItems);
      toast.error("Erro de conexão ao remover item.");
    }
  };

  const handleEditClick = (item: InventoryFormItem) => {
    if (isFinished) return;
    setEditingItemId(item.id);
    setNovoItem({
      id: item.id,
      productId: item.productId,
      codigo: item.product.publicCode,
      descricao: item.product.description,
      controlType: item.product.controlType,
      positionId: item.positionId || "",
      positionCode: item.position?.publicCode || "",
      batch: item.batch || "",
      expiry: item.expiry ? item.expiry.split("T")[0] : "",
      manufacturingDate: item.manufacturingDate
        ? item.manufacturingDate.split("T")[0]
        : "",
      serialNumber: item.serialNumber || "",
      grid: item.grid || "",
      quantity: item.quantity,
    });
    setProductSearch(item.product.description);
    setEanSearch("");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNovoItem({
      positionId: "",
      positionCode: "",
      batch: "",
      expiry: "",
      manufacturingDate: "",
      serialNumber: "",
      grid: "",
    });
    setProductSearch("");
    setEanSearch("");
  };

  // Check if product requires batch, manufacturing, expiry, serial or grid controls
  const needsBatch =
    !novoItem.controlType ||
    novoItem.controlType === "Lote" ||
    novoItem.controlType === "Validade";
  const needsManufacturing =
    !novoItem.controlType || novoItem.controlType === "Lote";
  const needsExpiry =
    !novoItem.controlType || novoItem.controlType === "Validade";
  const needsGrid = !novoItem.controlType || novoItem.controlType === "Grade";
  const needsSerial =
    !novoItem.controlType || novoItem.controlType === "NumeroSerie";

  return (
    <div className="space-y-6">
      {/* Header Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-300 text-xs">Estoque de Destino</Label>
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-md px-3 h-9 flex items-center text-slate-300 text-sm">
            {form.stockDescription || "—"}
          </div>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="inv-description" className="text-slate-300 text-xs">
            Descrição do Inventário
          </Label>
          <Input
            id="inv-description"
            value={form.description || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
            disabled={isFinished}
          />
        </div>
      </div>

      {/* Item count launch form */}
      {!isFinished && (
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h3 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">
              {editingItemId
                ? "Editar Contagem do Item"
                : "Lançar Nova Contagem"}
            </h3>

            {/* Toggle manterPosicao */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="manter-posicao-toggle"
                checked={manterPosicao}
                onChange={(e) => setManterPosicao(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
              <Label
                htmlFor="manter-posicao-toggle"
                className="text-slate-300 text-xs font-semibold cursor-pointer select-none"
              >
                Manter Posição
              </Label>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Top row controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Position Code Input */}
              <div className="md:col-span-2 space-y-1">
                <Label className="text-slate-300 text-xs font-semibold">
                  Posição (Código/Bipar)
                </Label>
                <Input
                  ref={posInputRef}
                  value={novoItem.positionCode || ""}
                  onChange={(e) =>
                    setNovoItem((prev) => ({
                      ...prev,
                      positionCode: e.target.value,
                    }))
                  }
                  placeholder="Bipar..."
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm font-mono"
                  id="inv-item-pos-code"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label className="text-slate-300 text-xs font-semibold">
                  Posição Identificada
                </Label>
                <div className="bg-slate-900/70 border border-slate-700/50 rounded-md px-3 h-8 flex items-center text-xs font-semibold text-slate-300 select-none truncate">
                  {novoItem.positionCode ? (
                    matchedPosition ? (
                      <span className="text-emerald-400">
                        ✔{" "}
                        {[
                          matchedPosition.aisle
                            ? `R-${matchedPosition.aisle}`
                            : "",
                          matchedPosition.block
                            ? `B-${matchedPosition.block}`
                            : "",
                          matchedPosition.floor
                            ? `A-${matchedPosition.floor}`
                            : "",
                          matchedPosition.location
                            ? `L-${matchedPosition.location}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" - ")}
                      </span>
                    ) : (
                      <span className="text-rose-400">❌ Posição Inválida</span>
                    )
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </div>
              </div>

              {/* EAN scan field */}
              <div className="md:col-span-2 space-y-1">
                <Label className="text-slate-300 text-xs font-semibold">
                  EAN (Bipar barras)
                </Label>
                <div className="relative">
                  <Input
                    ref={eanInputRef}
                    value={eanSearch}
                    onChange={(e) => setEanSearch(e.target.value)}
                    placeholder="Código de barras..."
                    className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 pr-7 text-sm font-mono"
                    id="inv-item-ean"
                    autoComplete="off"
                  />
                  {eanSearch && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      {eanLoading ? (
                        <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                      ) : eanFoundProduct ? (
                        <span title={eanFoundProduct}>
                          <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                        </span>
                      ) : eanError ? (
                        <span
                          className="text-rose-400 text-[10px] font-bold"
                          title="Não cadastrado"
                        >
                          ❌
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Product selection autocomplete */}
              <div className="md:col-span-4 relative space-y-1">
                <Label className="text-slate-300 text-xs">Produto</Label>
                <Input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                    if (novoItem.productId) {
                      setNovoItem((prev) => ({
                        ...prev,
                        productId: undefined,
                        codigo: undefined,
                        descricao: undefined,
                        controlType: undefined,
                      }));
                    }
                  }}
                  placeholder="Pesquisar produto por nome..."
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                  id="inv-item-prod-search"
                  disabled={!!editingItemId || !!eanFoundProduct}
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
                                setNovoItem((prev) => ({
                                  ...prev,
                                  productId: p.id,
                                  codigo: p.publicCode,
                                  descricao: p.description,
                                  controlType: p.controlType,
                                }));
                                setProductSearch(p.description);
                                setShowProductDropdown(false);
                              }}
                              className="px-3 py-2 text-sm text-slate-200 hover:bg-sky-500/20 cursor-pointer flex flex-col gap-0.5"
                            >
                              <span className="font-medium text-slate-100">
                                {p.description}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Controle: {p.controlType} | Cód: {p.id}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
              </div>

              {/* Counted Quantity */}
              <div className="md:col-span-2 space-y-1">
                <Label className="text-slate-300 text-xs">Qtd Contada</Label>
                <Input
                  ref={qtyInputRef}
                  type="number"
                  value={novoItem.quantity ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNovoItem((p) => ({
                      ...p,
                      quantity:
                        Number(val) < 0 || isNaN(Number(val)) ? 0 : Number(val),
                    }));
                  }}
                  placeholder="0"
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Bottom row options (Lote, Fabricação, Validade, Grade, Número de Série) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Lote</Label>
                <Input
                  value={novoItem.batch || ""}
                  onChange={(e) =>
                    setNovoItem((prev) => ({ ...prev, batch: e.target.value }))
                  }
                  placeholder={needsBatch ? "Ex: L12" : "Não aplicável"}
                  disabled={!needsBatch}
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Fabricação</Label>
                <Input
                  type="date"
                  value={novoItem.manufacturingDate || ""}
                  onChange={(e) =>
                    setNovoItem((prev) => ({
                      ...prev,
                      manufacturingDate: e.target.value,
                    }))
                  }
                  disabled={!needsManufacturing}
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Validade</Label>
                <Input
                  type="date"
                  value={novoItem.expiry || ""}
                  onChange={(e) =>
                    setNovoItem((prev) => ({ ...prev, expiry: e.target.value }))
                  }
                  disabled={!needsExpiry}
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">Grade</Label>
                <Input
                  value={novoItem.grid || ""}
                  onChange={(e) =>
                    setNovoItem((prev) => ({ ...prev, grid: e.target.value }))
                  }
                  placeholder={needsGrid ? "Ex: M/Verde" : "Não aplicável"}
                  disabled={!needsGrid}
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300 text-xs">
                  Número de Série
                </Label>
                <Input
                  value={novoItem.serialNumber || ""}
                  onChange={(e) =>
                    setNovoItem((prev) => ({
                      ...prev,
                      serialNumber: e.target.value,
                    }))
                  }
                  placeholder={
                    needsSerial ? "Bipar ou digitar série..." : "Não aplicável"
                  }
                  disabled={!needsSerial}
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm font-mono"
                />
              </div>
            </div>

            {/* Action buttons full-width */}
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveItem}
                className="flex-1 bg-sky-500 hover:bg-sky-400 text-white gap-1.5 h-9 text-xs font-semibold uppercase tracking-wider"
                id="save-item-count-btn"
              >
                {editingItemId ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingItemId ? "Salvar Item" : "Adicionar Item"}
              </Button>
              {editingItemId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="bg-slate-900/50 border-slate-700 text-slate-300 hover:text-slate-200 hover:bg-slate-800 h-9 px-4 text-xs font-semibold uppercase tracking-wider"
                >
                  <X className="w-4 h-4 mr-1.5 inline-block" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items list card */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-slate-200 font-semibold text-sm">
            Itens do Inventário ({items.length})
          </h2>
        </div>
        <Separator className="bg-slate-700/50" />
        <CardContent className="pt-4">
          {/* Layout de Tabela no Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/40 text-slate-400 border-b border-slate-700/50">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Posição</th>
                  <th className="px-4 py-3">Controle (Lote/Val/Série)</th>
                  <th className="px-4 py-3 text-right">Qtd Sistema</th>
                  <th className="px-4 py-3 text-right">Qtd Contada</th>
                  <th className="px-4 py-3 text-center">Diferença</th>
                  {!isFinished && (
                    <th className="px-4 py-3 text-center">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isFinished ? 6 : 7}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Nenhum item lançado neste inventário.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const diff = item.quantity - item.recordedQty;
                    let diffBadgeClass =
                      "border-slate-500/20 bg-slate-500/10 text-slate-400";
                    let diffPrefix = "";
                    if (diff > 0) {
                      diffBadgeClass =
                        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold";
                      diffPrefix = "+";
                    } else if (diff < 0) {
                      diffBadgeClass =
                        "border-rose-500/30 bg-rose-500/10 text-rose-400 font-semibold";
                    }

                    // Format position label
                    let posLabel = "Geral";
                    if (item.position) {
                      posLabel = [
                        item.position.aisle ? `R-${item.position.aisle}` : "",
                        item.position.block ? `B-${item.position.block}` : "",
                        item.position.floor ? `A-${item.position.floor}` : "",
                        item.position.location
                          ? `L-${item.position.location}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" - ");
                    }

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-700/10 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-200">
                              {item.product?.description}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Cód: {item.product?.publicCode || item.productId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                          {posLabel}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {item.batch ||
                          item.manufacturingDate ||
                          item.expiry ||
                          item.grid ||
                          item.serialNumber ? (
                            <div className="flex flex-col gap-0.5">
                              {item.batch && <span>Lote: {item.batch}</span>}
                              {item.manufacturingDate && (
                                <span>
                                  Fab:{" "}
                                  {new Date(
                                    item.manufacturingDate,
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                              )}
                              {item.expiry && (
                                <span>
                                  Val:{" "}
                                  {new Date(item.expiry).toLocaleDateString(
                                    "pt-BR",
                                  )}
                                </span>
                              )}
                              {item.grid && <span>Grade: {item.grid}</span>}
                              {item.serialNumber && (
                                <span>Série: {item.serialNumber}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-400">
                          {item.recordedQty}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-100">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs border ${diffBadgeClass}`}
                          >
                            {diffPrefix}
                            {diff}
                          </span>
                        </td>
                        {!isFinished && (
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1 min-h-[28px]">
                              {item.saving === "pending" ? (
                                <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                              ) : item.saving === "success" ? (
                                <Check className="w-4 h-4 text-emerald-400 font-bold" />
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditClick(item)}
                                    className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
                                    id={`edit-item-btn-${item.id}`}
                                    disabled={item.id.startsWith("temp-")}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                    id={`delete-item-btn-${item.id}`}
                                    disabled={item.id.startsWith("temp-")}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Layout de Cards no Mobile */}
          <div className="md:hidden space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhum item lançado neste inventário.
              </div>
            ) : (
              items.map((item) => {
                const diff = item.quantity - item.recordedQty;
                const diffBadgeClass =
                  diff > 0
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold"
                    : diff < 0
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400 font-semibold"
                      : "border-slate-500/20 bg-slate-500/10 text-slate-400";
                const diffPrefix = diff > 0 ? "+" : "";

                let posLabel = "Geral";
                if (item.position) {
                  posLabel = [
                    item.position.aisle ? `Rua ${item.position.aisle}` : "",
                    item.position.block ? `Bl ${item.position.block}` : "",
                    item.position.floor ? `Andar ${item.position.floor}` : "",
                    item.position.location
                      ? `Loc ${item.position.location}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" - ");
                }

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/20 space-y-3"
                  >
                    {/* Header: Produto e Divergência */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-200 text-sm break-words">
                          {item.product?.description}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Cód: {item.product?.publicCode || item.productId}
                        </span>
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs border shrink-0 ${diffBadgeClass}`}
                      >
                        {diffPrefix}
                        {diff}
                      </span>
                    </div>

                    <Separator className="bg-slate-700/30" />

                    {/* Detalhes do Item */}
                    <div className="space-y-2.5 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 block">Posição</span>
                        <span className="text-slate-300 font-mono">
                          {posLabel}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-slate-500 block">Controle</span>
                        {item.batch ||
                        item.manufacturingDate ||
                        item.expiry ||
                        item.grid ||
                        item.serialNumber ? (
                          <div className="flex flex-col text-[11px] text-slate-300 gap-0.5">
                            {item.batch && <span>Lote: {item.batch}</span>}
                            {item.manufacturingDate && (
                              <span>
                                Fab:{" "}
                                {new Date(
                                  item.manufacturingDate,
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                            {item.expiry && (
                              <span>
                                Val:{" "}
                                {new Date(item.expiry).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </span>
                            )}
                            {item.grid && <span>Grade: {item.grid}</span>}
                            {item.serialNumber && (
                              <span>Série: {item.serialNumber}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="space-y-0.5">
                          <span className="text-slate-500 block">
                            Qtd Sistema
                          </span>
                          <span className="text-slate-300 font-mono font-semibold">
                            {item.recordedQty}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-slate-500 block">
                            Qtd Contada
                          </span>
                          <span className="text-slate-100 font-mono font-bold">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ações / Status de salvamento */}
                    {!isFinished && (
                      <div className="pt-2 border-t border-slate-700/30 flex items-center justify-end gap-2 min-h-[32px]">
                        {item.saving === "pending" ? (
                          <Loader2 className="w-4 h-4 text-sky-500 animate-spin" />
                        ) : item.saving === "success" ? (
                          <Check className="w-4 h-4 text-emerald-400 font-bold" />
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(item)}
                              className="h-8 px-3 text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 text-xs gap-1.5"
                              disabled={item.id.startsWith("temp-")}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 px-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 text-xs gap-1.5"
                              disabled={item.id.startsWith("temp-")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
