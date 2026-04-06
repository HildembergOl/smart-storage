"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Save,
  Camera,
  Shield,
  CheckCircle2,
  Send,
  UserPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApp } from "@/lib/contexts/AppContext";

export default function PerfilPage() {
  const {
    email,
    name,
    phone,
    jobTitle,
    enterprises,
    currentEnterprise,
    refreshMe,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    jobTitle: "",
  });

  // Invite Form State
  const [inviteData, setInviteData] = useState({
    email: "",
    publicCode: "",
    role: "Usuario",
  });

  // Init form with context values
  useEffect(() => {
    setFormData({
      name: name || "",
      phone: phone || "",
      jobTitle: jobTitle || "",
    });
  }, [name, phone, jobTitle]);

  // Set default enterprise for invite if available
  useEffect(() => {
    if (currentEnterprise?.publicCode && !inviteData.publicCode) {
      setInviteData((prev) => ({
        ...prev,
        publicCode: currentEnterprise.publicCode,
      }));
    }
  }, [currentEnterprise?.publicCode, inviteData.publicCode]);

  const initials = (name || email || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao salvar perfil");

      await refreshMe();
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData.email || !inviteData.publicCode) {
      toast.error("Preencha o e-mail e selecione a empresa.");
      return;
    }

    setInviting(true);
    try {
      const res = await fetch("/api/admin/usuarios/convidar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });

      if (!res.ok) throw new Error("Erro ao enviar convite");

      toast.success(`Convite enviado para ${inviteData.email}!`);
      setInviteData({ ...inviteData, email: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar convite.");
    } finally {
      setInviting(false);
    }
  };

  const inputCls =
    "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-sky-500 focus:ring-sky-500/20";
  const iconCls =
    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500";

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Meu Perfil
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-prose">
            Gerencie suas informações profissionais, consulte suas empresas
            ativas e convide novos membros para sua equipe.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Badge
            variant="outline"
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 py-1"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
            {currentEnterprise?.legalName || "Nenhuma empresa selecionada"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Perfil e Informações */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Hero Card */}
          <Card className="overflow-hidden border-none bg-slate-900 shadow-xl shadow-sky-500/5">
            <div className="h-24 bg-linear-to-r from-sky-600 to-blue-800 opacity-80" />
            <CardContent className="px-6 pb-6 -mt-12 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <div className="relative group shrink-0">
                  <Avatar className="h-24 w-24 ring-4 ring-slate-900 bg-slate-800">
                    <AvatarFallback className="bg-sky-500 text-white text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sky-500 border-2 border-slate-900 flex items-center justify-center text-white hover:bg-sky-400 transition-all shadow-lg scale-90 group-hover:scale-100"
                    title="Alterar avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 text-center sm:text-left mb-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {name || "Seu Nome"}
                  </h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 text-sm truncate">
                      {email}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Form */}
          <Card className="bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Atualize seus dados profissionais para facilitar a identificação
                no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-slate-300">
                      Nome Completo
                    </Label>
                    <div className="relative">
                      <User className={iconCls} />
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={`pl-9 ${inputCls}`}
                        placeholder="João da Silva"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-600 dark:text-slate-300">
                      Telefone
                    </Label>
                    <div className="relative">
                      <Phone className={iconCls} />
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className={`pl-9 ${inputCls}`}
                        placeholder="(11) 99999-0000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-300">
                    Cargo / Função
                  </Label>
                  <div className="relative">
                    <Shield className={iconCls} />
                    <Input
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      className={`pl-9 ${inputCls}`}
                      placeholder="Ex: Gerente de Logística"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white px-8 h-10 shadow-lg shadow-sky-500/10"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Salvando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Empresas e Convites */}
        <div className="lg:col-span-5 space-y-6">
          {/* Linked Enterprises */}
          <Card className="bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-500" />
                Empresas com Acesso
              </CardTitle>
              <CardDescription>
                Você possui alçada para visualizar e operar nas empresas
                listadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {enterprises.map((ent) => (
                  <div
                    key={ent.enterpriseId}
                    className="px-6 py-3 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {ent.legalName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {ent.publicCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentEnterprise?.enterpriseId === ent.enterpriseId ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-5">
                          Ativa
                        </Badge>
                      ) : null}
                      <CheckCircle2
                        className={`w-4 h-4 ${ent.status === "Ativo" ? "text-sky-500" : "text-slate-300"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invitation Section */}
          <Card className="bg-linear-to-br from-indigo-500/5 to-sky-500/5 dark:from-sky-500/10 dark:to-slate-800/40 border-sky-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-500" />
                Convidar Membro
              </CardTitle>
              <CardDescription>
                Envie um convite por e-mail para vincular um novo usuário a uma
                empresa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteUser} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-300 text-sm">
                    Destinatário
                  </Label>
                  <div className="relative">
                    <Mail className={iconCls} />
                    <Input
                      type="email"
                      value={inviteData.email}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, email: e.target.value })
                      }
                      className={`pl-9 ${inputCls}`}
                      placeholder="exemplo@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-slate-300 text-sm">
                    Empresa do Vínculo
                  </Label>
                  <Select
                    value={inviteData.publicCode}
                    onValueChange={(val) =>
                      setInviteData({ ...inviteData, publicCode: val })
                    }
                  >
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Selecione a empresa...">
                        {
                          enterprises.find(
                            (ent) => ent.publicCode === inviteData.publicCode,
                          )?.legalName
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      {enterprises.map((ent) => (
                        <SelectItem
                          key={ent.enterpriseId}
                          value={ent.publicCode}
                        >
                          {ent.legalName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={inviting}
                  className="w-full bg-slate-800 dark:bg-sky-500 hover:bg-slate-700 dark:hover:bg-sky-600 text-white h-10 transition-all font-medium"
                >
                  {inviting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar Convite
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
