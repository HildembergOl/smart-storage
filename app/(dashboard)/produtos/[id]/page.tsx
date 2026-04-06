"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { TabCadastroProduto } from "./_components/TabCadastroProduto";
import { TabEmbalagemProduto, Embalagem } from "./_components/TabEmbalagemProduto";
import { TabEstoquesProduto, ProductoStock } from "./_components/TabEstoquesProduto";
import { TabPosicoesProduto, ProductPosition } from "./_components/TabPosicoesProduto";
import { TabMovimentosProduto } from "./_components/TabMovimentosProduto";

import { TabMarketplaceProduto, MarketplaceImage } from "./_components/TabMarketplaceProduto";

interface ProductForm {
  description: string;
  unitOfMeasureId: string;
  unitOfMeasureName: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  subgroupId: string;
  subgroupName: string;
  productType: string;
  controlType: string;
  status: string;
}

interface ProductData extends ProductForm {
  id: string;
  publicCode: string;
  enterpriseId: string;
  packages: Embalagem[];
  productStocks: ProductoStock[];
  productPositions: ProductPosition[];
  marketplaceImages: MarketplaceImage[];
}

const emptyForm: ProductForm = {
  description: "",
  unitOfMeasureId: "",
  unitOfMeasureName: "UN",
  brandId: "",
  brandName: "",
  categoryId: "",
  categoryName: "",
  groupId: "",
  groupName: "",
  subgroupId: "",
  subgroupName: "",
  productType: "Produto",
  controlType: "Padrao",
  status: "Ativo",
};

export default function ProdutoFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setLabel } = useBreadcrumb();
  const { enterpriseId: activeEnterpriseId } = useApp();
  const isNew = id === "novo";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [productData, setProductData] = useState<ProductData | null>(null);

  const fetchProduto = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/produtos/${id}`);
      if (!res.ok) {
        toast.error("Produto não encontrado");
        router.push("/produtos");
        return;
      }
      const data: ProductData = await res.json();
      setProductData(data);
      setForm({
        description: data.description || "",
        unitOfMeasureId: data.unitOfMeasureId || "",
        unitOfMeasureName: data.unitOfMeasureName || "UN",
        brandId: data.brandId || "",
        brandName: data.brandName || "",
        categoryId: data.categoryId || "",
        categoryName: data.categoryName || "",
        groupId: data.groupId || "",
        groupName: data.groupName || "",
        subgroupId: data.subgroupId || "",
        subgroupName: data.subgroupName || "",
        productType: data.productType || "Produto",
        controlType: data.controlType || "Padrao",
        status: data.status || "Ativo",
      });
      if (data.description) setLabel(id, data.description);
    } catch {
      toast.error("Erro ao carregar produto");
      router.push("/produtos");
    } finally {
      setLoading(false);
    }
  }, [id, isNew, router, setLabel]);

  useEffect(() => { fetchProduto(); }, [fetchProduto]);

  const handleFieldChange = (field: keyof ProductForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description) { toast.error("A descrição é obrigatória"); return; }
    setSaving(true);
    try {
      const url = isNew ? "/api/produtos" : `/api/produtos/${id}`;
      const method = isNew ? "POST" : "PATCH";
      const body = isNew
        ? { ...form, enterpriseId: activeEnterpriseId }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        toast.error("Erro ao salvar produto");
        return;
      }

      const saved = await res.json();
      toast.success(isNew ? "Produto criado com sucesso!" : "Alterações salvas!");
      if (isNew) router.push(`/produtos/${saved.publicCode}`);
      else fetchProduto();
    } catch { toast.error("Erro ao conectar com o servidor"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Produto excluído!"); router.push("/produtos"); }
      else toast.error("Erro ao excluir produto.");
    } catch { toast.error("Erro de conexão."); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 min-h-[400px]">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/produtos")} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isNew ? "Novo Produto" : form.description}
            </h1>
            {!isNew && productData && (
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
                  Código: {productData.id}
                </Badge>
                <Badge className={productData.status === "Ativo" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]" : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"}>
                  {productData.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400 hover:bg-red-500/10" />}>
                <Trash2 className="w-4 h-4" />
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-800 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Excluir Produto</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Tem certeza que deseja excluir <strong className="text-slate-200">{form.description}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" form="produto-form" disabled={saving} className="bg-sky-500 hover:bg-sky-400 text-white gap-2 min-w-[140px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? "Criar Produto" : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="bg-slate-800/40 border-slate-700/50 overflow-hidden">
        <Tabs defaultValue="cadastro">
          <CardHeader className="pb-0 border-b border-slate-700/50">
            <TabsList className="bg-transparent border-none gap-6 p-0 h-10">
              {[
                { value: "cadastro", label: "Cadastro" },
                ...(!isNew ? [
                  { value: "embalagem", label: "Embalagem" },
                  { value: "estoques", label: "Estoques" },
                  { value: "posicoes", label: "Posições" },
                  { value: "movimentos", label: "Movimentos" },
                  { value: "marketplace", label: "Marketplace" },
                ] : []),
              ].map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 transition-all"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            <TabsContent value="cadastro" className="mt-0">
              <form id="produto-form" onSubmit={handleSave}>
                <TabCadastroProduto form={form} onChange={handleFieldChange} />
              </form>
            </TabsContent>

            {!isNew && (
              <>
                <TabsContent value="embalagem" className="mt-0">
                  <TabEmbalagemProduto
                    productPublicCode={id}
                    embalagens={productData?.packages || []}
                    onRefresh={fetchProduto}
                  />
                </TabsContent>

                <TabsContent value="estoques" className="mt-0">
                  <TabEstoquesProduto productStocks={productData?.productStocks || []} />
                </TabsContent>

                <TabsContent value="posicoes" className="mt-0">
                  <TabPosicoesProduto productPositions={productData?.productPositions || []} />
                </TabsContent>

                <TabsContent value="movimentos" className="mt-0">
                  <TabMovimentosProduto movimentos={[]} />
                </TabsContent>

                <TabsContent value="marketplace" className="mt-0">
                  <TabMarketplaceProduto images={productData?.marketplaceImages || []} />
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
