"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
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
import { TabInfoSaida, FormOrderProps, ItemSaida } from "./_components/TabInfoSaida";

interface BackendItem {
  id: string;
  productId: string;
  codigo: string;
  descricao: string;
  quantity: number;
  unitValue: number;
  total: number;
}

export default function SaidaFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setLabel } = useBreadcrumb();
  const { enterpriseId: activeEnterpriseId, ready } = useApp();
  const isNew = id === "novo";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState<FormOrderProps>({});
  const [itens, setItens] = useState<ItemSaida[]>([]);

  const totalItens = itens.reduce((s, i) => s + i.total, 0);

  // Sync total value
  useEffect(() => {
    setForm((p) => ({ ...p, totalProduto: totalItens }));
  }, [totalItens]);

  // Load Breadcrumb Label
  useEffect(() => {
    if (!isNew && form.number) {
      setLabel(id, `Saída ${form.number}`);
    }
  }, [id, isNew, form.number, setLabel]);

  // Fetch single order details
  const getData = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/saidas/${id}`);
      if (!res.ok) {
        toast.error("Saída não encontrada");
        router.push("/saidas");
        return;
      }
      const data = await res.json();
      setForm({
        codigo: data.id,
        stockId: data.stockId,
        personId: data.personId,
        personName: data.person?.tradeName || data.person?.legalName || "",
        number: data.number || "",
        type: data.type || "NF-e",
        chaveNfe: data.nfeKey || "",
        totalProduto: data.totalProduct || 0,
        totalNfe: data.totalNfe || 0,
        observacoes: data.notes || "",
      });
      setItens(
        (data.items || []).map((item: BackendItem) => ({
          id: item.id,
          productId: item.productId,
          codigo: item.codigo,
          descricao: item.descricao,
          quantidade: item.quantity,
          valorUnit: item.unitValue,
          total: item.total,
        })),
      );
    } catch {
      toast.error("Erro ao carregar saída");
      router.push("/saidas");
    } finally {
      setLoading(false);
    }
  }, [id, isNew, router]);

  useEffect(() => {
    if (ready) {
      getData();
    }
  }, [ready, getData]);

  // Save changes
  const handleSave = async () => {
    if (!form.stockId) {
      toast.error("O estoque é obrigatório");
      return;
    }
    if (!form.personId) {
      toast.error("O cliente/pessoa é obrigatório");
      return;
    }
    if (!form.number) {
      toast.error("O número do documento é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/saidas" : `/api/saidas/${id}`;
      const method = isNew ? "POST" : "PATCH";
      const body = {
        stockId: form.stockId,
        personId: form.personId,
        number: form.number,
        type: form.type,
        nfeKey: form.chaveNfe || null,
        totalProduct: totalItens,
        totalNfe: Number(form.totalNfe || 0),
        notes: form.observacoes || null,
        enterpriseId: activeEnterpriseId,
        ...(isNew
          ? {
              itens: itens.map((i) => ({
                productId: i.productId,
                quantity: Number(i.quantidade),
                unitValue: Number(i.valorUnit),
              })),
            }
          : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved = await res.json();
        toast.success(
          isNew ? "Saída criada com sucesso!" : "Alterações salvas!",
        );
        if (isNew) {
          router.push(`/saidas/${saved.publicCode}`);
        } else {
          getData();
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar saída");
      }
    } catch {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setSaving(false);
    }
  };

  // Delete Order
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/saidas/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Saída excluída com sucesso!");
        router.push("/saidas");
      } else {
        toast.error("Erro ao excluir saída.");
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/saidas")}
            className="text-slate-400 hover:text-slate-200"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isNew ? "Nova Saída" : `Editar Saída ${form.number}`}
            </h1>
            {!isNew && (
              <p className="text-slate-400 text-sm">Código: {form.codigo}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    id="delete-saida-trigger"
                  />
                }
              >
                <Trash2 className="w-4 h-4" />
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Excluir Saída
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Tem certeza que deseja excluir esta saída? Esta ação não
                    pode ser desfeita.
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
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-sky-500 hover:bg-sky-400 text-white gap-2 min-w-[120px]"
            id="save-saida-btn"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="bg-slate-800/40 border-slate-700/50 overflow-hidden">
        <Tabs defaultValue="info">
          <CardHeader className="pb-0 border-b border-slate-700/50">
            <TabsList className="bg-transparent border-none gap-6 p-0 h-10 flex">
              {[
                { value: "info", label: "Informações", id: "tab-sai-info" },
              ].map(({ value, label, id }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 transition-all cursor-pointer"
                  id={id}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="info" className="mt-0">
              <TabInfoSaida
                form={form}
                setForm={setForm}
                itens={itens}
                setItens={setItens}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
