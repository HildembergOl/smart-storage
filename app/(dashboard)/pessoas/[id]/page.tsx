"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useBreadcrumb } from "@/lib/contexts/BreadcrumbContext";
import { useApp } from "@/lib/contexts/AppContext";
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
import { Trash2 } from "lucide-react";

interface PersonForm {
  publicCode: string;
  id: string;
  personType: string;
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
  isClient: boolean;
  isSupplier: boolean;
  isEmployee: boolean;
  isTenant: boolean;
  isVehicle: boolean;
  enterpriseId: string;
}

const emptyForm: PersonForm = {
  publicCode: "",
  id: "",
  personType: "Juridica",
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
  isClient: false,
  isSupplier: false,
  isEmployee: false,
  isTenant: false,
  isVehicle: false,
  enterpriseId: "",
};

const CATEGORIES = [
  { key: "isClient" as const, label: "Cliente" },
  { key: "isSupplier" as const, label: "Fornecedor" },
  { key: "isEmployee" as const, label: "Funcionário" },
  { key: "isTenant" as const, label: "Locatário" },
  { key: "isVehicle" as const, label: "Veículo" },
];

export default function PessoaFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setLabel } = useBreadcrumb();
  const { enterpriseId: activeEnterpriseId } = useApp();
  const isNew = id === "novo";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PersonForm>(emptyForm);

  const fetchPessoa = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pessoas/${id}`);
      if (!res.ok) { toast.error("Pessoa não encontrada"); router.push("/pessoas"); return; }
      const data = await res.json();
      setForm({
        publicCode: data.publicCode || "",
        id: data.id || "",
        personType: data.personType || "Juridica",
        legalName: data.legalName || "",
        tradeName: data.tradeName || "",
        taxId: data.taxId || "",
        stateRegistration: data.stateRegistration || "",
        email: data.email || "",
        address: data.address || "",
        number: data.number || "",
        complement: data.complement || "",
        neighborhood: data.neighborhood || "",
        city: data.city || "",
        state: data.state || "",
        notes: data.notes || "",
        isClient: !!data.isClient,
        isSupplier: !!data.isSupplier,
        isEmployee: !!data.isEmployee,
        isTenant: !!data.isTenant,
        isVehicle: !!data.isVehicle,
        enterpriseId: data.enterpriseId || "",
      });
      if (data.legalName) setLabel(id, data.legalName);
    } catch { toast.error("Erro ao carregar pessoa"); router.push("/pessoas"); }
    finally { setLoading(false); }
  }, [id, isNew, router, setLabel]);

  useEffect(() => { fetchPessoa(); }, [fetchPessoa]);

  const field = (name: keyof PersonForm) => ({
    value: (form[name] as string) || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [name]: e.target.value })),
    className: "bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-sm",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.legalName || !form.taxId) {
      toast.error("Razão social e CNPJ/CPF são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? "/api/pessoas" : `/api/pessoas/${id}`;
      const method = isNew ? "POST" : "PATCH";
      const body = isNew ? { ...form, enterpriseId: activeEnterpriseId } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao salvar pessoa");
        return;
      }
      const saved = await res.json();
      toast.success(isNew ? "Pessoa criada com sucesso!" : "Alterações salvas!");
      if (isNew) router.push(`/pessoas/${saved.publicCode}`);
      else fetchPessoa();
    } catch { toast.error("Erro ao conectar com o servidor"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/pessoas/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Pessoa excluída!"); router.push("/pessoas"); }
      else toast.error("Erro ao excluir pessoa.");
    } catch { toast.error("Erro de conexão."); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 min-h-[400px]">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.push("/pessoas")} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isNew ? "Nova Pessoa" : form.legalName}
              </h1>
              {!isNew && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
                    Código: {form.id}
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
                    <AlertDialogTitle className="text-white">Excluir Pessoa</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Tem certeza que deseja excluir <strong className="text-slate-200">{form.legalName}</strong>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" form="pessoa-form" disabled={saving} className="bg-sky-500 hover:bg-sky-400 text-white gap-2 min-w-[140px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isNew ? "Criar Pessoa" : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        <Card className="bg-slate-800/40 border-slate-700/50 overflow-hidden">
          <Tabs defaultValue="cadastro">
            <CardHeader className="pb-0 border-b border-slate-700/50">
              <TabsList className="bg-transparent border-none gap-6 p-0 h-10">
                <TabsTrigger value="cadastro" className="data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 rounded-none bg-transparent px-2 h-8 text-sm text-slate-400 transition-all">
                  Cadastro
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-6">
              <TabsContent value="cadastro" className="mt-0">
                <form id="pessoa-form" onSubmit={handleSave} className="space-y-5">
                  {/* Tipo + Status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de pessoa</Label>
                      <Select value={form.personType} onValueChange={(v) => setForm((p) => ({ ...p, personType: v }))}>
                        <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                          <SelectItem value="Juridica">Jurídica</SelectItem>
                          <SelectItem value="Fisica">Física</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Razão Social + Nome Fantasia */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Razão social</Label>
                      <Input {...field("legalName")} placeholder="Razão social ou nome completo" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome fantasia</Label>
                      <Input {...field("tradeName")} placeholder="Nome fantasia (opcional)" />
                    </div>
                  </div>

                  {/* CNPJ/CPF + IE/RG + E-mail */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>CNPJ/CPF</Label>
                      <Input {...field("taxId")} placeholder="00.000.000/0001-00" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Inscrição estadual / RG</Label>
                      <Input {...field("stateRegistration")} placeholder="Opcional" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input {...field("email")} type="email" placeholder="email@empresa.com" />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 space-y-2">
                      <Label>Endereço</Label>
                      <Input {...field("address")} placeholder="Rua, Avenida..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Número</Label>
                      <Input {...field("number")} placeholder="Nº" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Complemento</Label>
                      <Input {...field("complement")} placeholder="Sala, Apto..." />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <Label>Bairro</Label>
                      <Input {...field("neighborhood")} placeholder="Bairro" />
                    </div>
                  </div>

                  {/* Cidade + Estado + Observações */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-2">
                      <Label>Cidade</Label>
                      <Input {...field("city")} placeholder="Cidade" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>UF</Label>
                      <Input {...field("state")} placeholder="SP" maxLength={2} />
                    </div>
                    <div className="md:col-span-6 space-y-2">
                      <Label>Observações</Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        className="bg-slate-900/50 border-slate-700 text-slate-200 resize-none text-sm"
                        rows={2}
                        placeholder="Observações gerais..."
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-700/50" />

                  {/* Categorias */}
                  <div className="space-y-3">
                    <p className="text-slate-300 text-sm font-semibold">Categorias</p>
                    <div className="flex flex-wrap gap-6">
                      {CATEGORIES.map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`cat-${key}`}
                            checked={form[key]}
                            onCheckedChange={(v) => setForm((p) => ({ ...p, [key]: !!v }))}
                            className="border-slate-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                          />
                          <Label htmlFor={`cat-${key}`} className="text-slate-300 cursor-pointer">
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </>
  );
}
