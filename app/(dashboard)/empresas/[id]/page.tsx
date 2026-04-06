"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { useBreadcrumb } from "@/lib/contexts/BreadcrumbContext";
import { TabOverviewEnterprise } from "./_components/TabEnterprise";
import { DeleteEnterpriseDialog } from "../_components/DeleteEnterpriseDialog";
import { TabStocks } from "./_components/TabStocks";
import { TabSections } from "./_components/TabSections";
import { TabPositions } from "./_components/TabPositions";
import { Stock, Section, Position } from "./_components/logistic-columns";

interface EnterpriseWithRelations {
  id: bigint;
  publicCode: string;
  status: string;
  enterpriseType: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  stateRegistration: string;
  email: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  notes: string;
  stocks: Stock[];
  sections: Section[];
  positions: Position[];
}

export default function EnterpriseFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setLabel } = useBreadcrumb();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<EnterpriseWithRelations>>({
    publicCode: "",
    status: "Ativo",
    enterpriseType: "Juridica",
    legalName: "",
    tradeName: "",
    taxId: "",
    stateRegistration: "",
    email: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    notes: "",
    stocks: [],
    sections: [],
    positions: [],
  });

  const fetchEnterprise = useCallback(async () => {
    if (isNew) return;
    try {
      const response = await fetch(`/api/empresas/${id}`);
      if (!response.ok) {
        toast.error("Empresa não encontrada");
        router.push("/empresas");
        return;
      }
      const data = await response.json();
      setFormData(data);
      if (data.legalName) {
        setLabel(id, data.legalName);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados da empresa");
      router.push("/empresas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, isNew, router, setLabel]);

  useEffect(() => {
    fetchEnterprise();
  }, [fetchEnterprise]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<EnterpriseWithRelations>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<EnterpriseWithRelations>) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/empresas" : `/api/empresas/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        toast.error("Erro ao salvar empresa");
        return;
      }

      const savedData = await response.json();
      toast.success(
        isNew ? "Empresa criada com sucesso!" : "Alterações salvas!",
      );

      if (savedData.legalName) {
        setLabel(id || savedData.publicCode, savedData.legalName);
      }

      if (isNew) {
        router.push(`/empresas/${savedData.publicCode}`);
      } else {
        fetchEnterprise();
      }
    } catch (error) {
      toast.error("Erro ao salvar empresa");
      console.error(error);
    } finally {
      setSaving(false);
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
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/empresas")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isNew ? "Nova Empresa" : formData.legalName}
              </h1>
              {!isNew && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono border-slate-700 text-slate-400"
                  >
                    Público: {formData.publicCode}
                  </Badge>
                  <Badge
                    className={
                      formData.status === "Ativo"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                        : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
                    }
                  >
                    {formData.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <DeleteEnterpriseDialog
                id={id}
                onSuccess={() => router.push("/empresas")}
              />
            )}
            <Button
              type="submit"
              form="enterprise-form"
              disabled={saving}
              className="bg-sky-500 hover:bg-sky-400 text-white gap-2 min-w-[140px]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isNew ? "Criar Empresa" : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800/40 border-slate-700/50 overflow-hidden">
          <Tabs defaultValue="overview">
            <CardHeader className="pb-0 border-b border-slate-700/50">
              <TabsList className="bg-transparent border-none gap-6 p-0 h-10">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 transition-all"
                >
                  Cadastro
                </TabsTrigger>
                {!isNew && (
                  <>
                    <TabsTrigger
                      value="stocks"
                      className="rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 transition-all"
                    >
                      Estoques
                    </TabsTrigger>
                    <TabsTrigger
                      value="sections"
                      className="rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 transition-all"
                    >
                      Setores
                    </TabsTrigger>
                    <TabsTrigger
                      value="positions"
                      className="rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 data-[state=active]:text-sky-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 transition-all"
                    >
                      Posições
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="overview" className="mt-0">
                <form
                  id="enterprise-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <TabOverviewEnterprise
                    isNew={isNew}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                  />
                </form>
              </TabsContent>

              {!isNew && (
                <>
                  <TabsContent value="stocks" className="mt-0">
                    <TabStocks
                      enterpriseId={formData.id?.toString() || ""}
                      stocks={formData.stocks || []}
                      onRefresh={fetchEnterprise}
                    />
                  </TabsContent>
                  <TabsContent value="sections" className="mt-0">
                    <TabSections
                      enterpriseId={formData.id?.toString() || ""}
                      sections={formData.sections || []}
                      onRefresh={fetchEnterprise}
                    />
                  </TabsContent>
                  <TabsContent value="positions" className="mt-0">
                    <TabPositions
                      enterpriseId={formData.id?.toString() || ""}
                      positions={formData.positions || []}
                      stocks={formData.stocks || []}
                      sections={formData.sections || []}
                      onRefresh={fetchEnterprise}
                    />
                  </TabsContent>
                </>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}
