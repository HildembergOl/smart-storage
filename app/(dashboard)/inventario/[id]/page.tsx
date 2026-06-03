"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useBreadcrumb } from "@/lib/contexts/BreadcrumbContext";
import { useApp } from "@/lib/contexts/AppContext";
import { TabInfoInventario } from "./_components/TabInfoInventario";

export interface InventoryFormHeader {
  id?: string;
  codigo?: string;
  publicCode?: string;
  description?: string;
  stockId?: string;
  stockDescription?: string;
  status?: string;
  finishedAt?: string | null;
  createdAt?: string;
}

export interface InventoryFormItem {
  id: string;
  productId: string;
  positionId: string | null;
  batch: string | null;
  expiry: string | null;
  manufacturingDate: string | null;
  serialNumber: string | null;
  grid: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  quantity: number;
  recordedQty: number;
  saving?: "pending" | "success";
  product: {
    id: string;
    publicCode: string;
    description: string;
    controlType: string;
  };
  position: {
    id: string;
    publicCode: string;
    aisle: string | null;
    block: string | null;
    floor: string | null;
    location: string | null;
  } | null;
}

export default function InventarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setLabel } = useBreadcrumb();
  const { enterpriseId: activeEnterpriseId, ready } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [form, setForm] = useState<InventoryFormHeader>({});
  const [items, setItems] = useState<InventoryFormItem[]>([]);

  // Load Breadcrumb Label
  useEffect(() => {
    if (form.description) {
      setLabel(id, `Inventário: ${form.description}`);
    } else {
      setLabel(id, "Detalhe do Inventário");
    }
  }, [id, form.description, setLabel]);

  // Fetch inventory details
  const getInventoryDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventario/${id}`);
      if (!res.ok) {
        toast.error("Inventário não encontrado");
        router.push("/inventario");
        return;
      }
      const data = await res.json();
      setForm({
        id: data.id,
        codigo: data.id,
        publicCode: data.publicCode,
        description: data.description,
        stockId: data.stockId,
        stockDescription: data.stock?.description || "",
        status: data.status,
        finishedAt: data.finishedAt,
        createdAt: data.createdAt,
      });
      setItems(data.items || []);
    } catch (err) {
      console.error("Error loading inventory:", err);
      toast.error("Erro ao carregar detalhes do inventário");
      router.push("/inventario");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (ready) {
      getInventoryDetails();
    }
  }, [ready, getInventoryDetails]);

  // Save general header changes
  const handleSaveHeader = async () => {
    if (!form.description) {
      toast.error("Descrição é obrigatória");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/inventario/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          stockId: form.stockId,
        }),
      });

      if (res.ok) {
        toast.success("Cabeçalho do inventário atualizado!");
        getInventoryDetails();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erro ao salvar alterações");
      }
    } catch {
      toast.error("Erro de conexão ao salvar alterações");
    } finally {
      setSaving(false);
    }
  };

  // Finalize Inventory
  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      const res = await fetch(`/api/inventario/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Finalizado",
        }),
      });

      if (res.ok) {
        toast.success(
          "Inventário finalizado com sucesso! Estoques atualizados.",
        );
        getInventoryDetails();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erro ao finalizar inventário");
      }
    } catch {
      toast.error("Erro ao conectar ao servidor para finalizar");
    } finally {
      setFinalizing(false);
    }
  };

  // Delete Inventory
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/inventario/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Inventário excluído com sucesso!");
        router.push("/inventario");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erro ao excluir inventário.");
      }
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  const isFinished = form.status === "Finalizado";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventario")}
            className="text-slate-400 hover:text-slate-200"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">{form.description}</h1>
            <p className="text-slate-400 text-sm">
              Código: {form.codigo} • Status:{" "}
              <span
                className={
                  isFinished
                    ? "text-emerald-400 font-semibold"
                    : "text-amber-400 font-semibold"
                }
              >
                {form.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 w-full md:w-auto justify-start md:justify-end overflow-x-auto pb-1 md:pb-0">
          {!isFinished && (
            <>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      id="delete-inventario-trigger"
                    />
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Excluir Inventário
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Tem certeza que deseja excluir este inventário? Esta ação
                      não pode ser desfeita e apagará todos os seus registros de
                      contagem.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      className="bg-emerald-500 hover:bg-emerald-400 text-white gap-2 h-9 px-4 py-2 inline-flex items-center justify-center min-w-[120px]"
                      id="finalize-inventario-trigger"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Finalizar
                    </Button>
                  }
                />
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Finalizar Inventário
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Ao finalizar este inventário, os saldos físicos do estoque
                      de destino serão atualizados conforme a contagem
                      atualizada. Esta ação é irreversível e bloqueará novas
                      edições. Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleFinalize}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Finalizar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                type="button"
                onClick={handleSaveHeader}
                disabled={saving}
                className="bg-sky-500 hover:bg-sky-400 text-white gap-2 h-9 px-4 py-2 inline-flex items-center justify-center min-w-[120px]"
                id="save-header-btn"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Layout */}
      <Card className="bg-slate-800/40 border-slate-700/50 overflow-hidden">
        <Tabs defaultValue="contagem">
          <CardHeader className="pb-0 border-b border-slate-700/50">
            <TabsList className="bg-transparent border-none gap-6 p-0 h-10 flex">
              <TabsTrigger
                value="contagem"
                className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 transition-all cursor-pointer"
                id="tab-inv-contagem"
              >
                Contagem Estoque
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="contagem" className="mt-0">
              <TabInfoInventario
                form={form}
                setForm={setForm}
                items={items}
                setItems={setItems}
                onRefresh={getInventoryDetails}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
