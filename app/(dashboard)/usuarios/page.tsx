"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Trash2,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  UserCheck,
  ShieldBan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { SearchEnterpriseInput } from "@/components/shared/SearchEnterpriseInput";

interface UserEnterprise {
  userEnterpriseId: string;
  enterpriseId: string;
  enterprisePublicCode: string;
  enterpriseName: string;
}

interface UserTenant {
  userTenantId: string;
  tenantId: string;
  tenantPublicCode: string | null;
  tenantName: string;
}

interface AdminUser {
  id: string;
  email: string;
  publicKey: string;
  enterprises: UserEnterprise[];
  tenant: UserTenant | null;
}

function UserCard({
  user,
  onRefresh,
}: {
  user: AdminUser;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addEnterprise, setAddEnterprise] = useState("");
  const [addTenant, setAddTenant] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const patchUser = async (body: Record<string, string | null>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/usuarios/${user.publicKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success("Usuário atualizado!");
        onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEnterprise = async (userEnterpriseId: string) => {
    await patchUser({ removeUserEnterpriseId: userEnterpriseId });
  };

  const handleAddEnterprise = async () => {
    if (!addEnterprise) return;
    await patchUser({ addEnterprisePublicCode: addEnterprise });
    setAddEnterprise("");
  };

  const handleSetTenant = async () => {
    if (!addTenant) return;
    await patchUser({ tenantPublicCode: addTenant.id });
    setAddTenant(null);
  };

  const handleRemoveTenant = async () => {
    await patchUser({ tenantPublicCode: null });
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/usuarios/${user.publicKey}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Usuário excluído!");
        onRefresh();
      } else toast.error("Erro ao excluir usuário.");
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 overflow-hidden">
      {/* User header row */}
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">
              {user.email}
            </p>
            <p className="text-slate-500 text-xs font-mono truncate">
              {user.publicKey.slice(0, 16)}…
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Enterprises badges */}
          <div className="hidden md:flex gap-1 flex-wrap">
            {user.enterprises.length === 0 ? (
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500/30 text-amber-400"
              >
                <ShieldBan className="w-3 h-3 mr-1" /> Sem empresa
              </Badge>
            ) : (
              user.enterprises.slice(0, 2).map((ue) => (
                <Badge
                  key={ue.userEnterpriseId}
                  className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-[10px]"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {ue.enterpriseName}
                </Badge>
              ))
            )}
            {user.enterprises.length > 2 && (
              <Badge
                variant="outline"
                className="text-[10px] border-slate-600 text-slate-400"
              >
                +{user.enterprises.length - 2}
              </Badge>
            )}
          </div>
          {/* Tenant badge */}
          {user.tenant && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              <UserCheck className="w-3 h-3 mr-1" />
              {user.tenant.tenantName}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-sky-400"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                />
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Excluir Usuário
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Confirmar exclusão do usuário{" "}
                  <strong className="text-slate-200">{user.email}</strong>? O
                  acesso ao Supabase será mantido, apenas o vínculo no sistema
                  será removido.
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
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-slate-700/50 px-4 py-4 space-y-5 bg-slate-900/20">
          {/* Empresas */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Empresas vinculadas
            </p>
            {user.enterprises.length === 0 ? (
              <p className="text-slate-500 text-xs italic">
                Nenhuma empresa vinculada
              </p>
            ) : (
              <div className="space-y-1">
                {user.enterprises.map((ue) => (
                  <div
                    key={ue.userEnterpriseId}
                    className="flex items-center justify-between py-1.5 px-3 rounded bg-slate-800/50 border border-slate-700/30"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-slate-200 text-sm">
                        {ue.enterpriseName}
                      </span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10" />}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remover vínculo</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-400">
                            Confirmar remoção da empresa <strong className="text-slate-200">{ue.enterpriseName}</strong>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveEnterprise(ue.userEnterpriseId)} className="bg-red-500 hover:bg-red-600 text-white">Remover</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-9 space-y-2">
                <Label>Adicionar empresa</Label>
                <SearchEnterpriseInput
                  placeholder="Buscar empresa por nome..."
                  endpoint="/api/empresas"
                  onSelect={(v) => setAddEnterprise(v?.publicCode || "")}
                  displayValue=""
                />
              </div>
              <div className="md:col-span-3">
                <Button
                  type="button"
                  onClick={handleAddEnterprise}
                  disabled={saving || !addEnterprise}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white h-9 gap-1"
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                  Vincular
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Tenant */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Depositante (Tenant)
            </p>
            {user.tenant ? (
              <div className="flex items-center justify-between py-1.5 px-3 rounded bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200 text-sm">
                    {user.tenant.tenantName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveTenant}
                  disabled={saving}
                  className="text-slate-500 hover:text-red-400 text-xs h-6"
                >
                  <X className="w-3 h-3 mr-1" /> Remover
                </Button>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">
                Sem tenant configurado — todos os estoques serão visíveis
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-9 space-y-2">
                <Label>Definir depositante</Label>
                <SearchEnterpriseInput
                  placeholder="Buscar pessoa/depositante..."
                  endpoint="/api/pessoas"
                  onSelect={(v) =>
                    setAddTenant(
                      v
                        ? { id: v.id.toString(), label: v.legalName || "" }
                        : null,
                    )
                  }
                  displayValue={addTenant?.label || ""}
                  extraFilters={{ isTenant: true }}
                />
              </div>
              <div className="md:col-span-3">
                <Button
                  type="button"
                  onClick={handleSetTenant}
                  disabled={saving || !addTenant}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white h-9 gap-1"
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserCheck className="w-3 h-3" />
                  )}
                  Definir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedEnterprise, setSelectedEnterprise] = useState<{
    publicCode: string;
    label: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (!selectedEnterprise) {
      toast.error("Por favor, selecione uma empresa inicial");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          enterprisePublicCode: selectedEnterprise.publicCode,
        }),
      });
      if (res.ok) {
        toast.success("Usuário criado com sucesso!");
        setForm({
          email: "",
          password: "",
          confirmPassword: "",
        });
        setSelectedEnterprise(null);
        onCreated();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao criar usuário");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-sm";

  return (
    <Card className="bg-slate-800/40 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" />
          <CardTitle className="text-sm text-slate-300">
            Criar Novo Usuário
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="usuario@empresa.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputCls}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa inicial</Label>
              <SearchEnterpriseInput
                placeholder="Buscar empresa..."
                endpoint="/api/empresas"
                onSelect={(v) =>
                  setSelectedEnterprise(
                    v ? { publicCode: v.publicCode!, label: v.legalName! } : null,
                  )
                }
                displayValue={selectedEnterprise?.label || ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className={inputCls}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar senha</Label>
              <Input
                type="password"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                className={inputCls}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-sky-500 hover:bg-sky-400 text-white gap-2 min-w-[160px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Criar Usuário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/usuarios");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Usuários</h1>
        <p className="text-slate-400 text-sm">
          Gerencie os usuários do sistema, vínculos de empresa e permissões de
          tenant
        </p>
      </div>

      <CreateUserForm onCreated={fetchUsers} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {loading
              ? "Carregando..."
              : `${users.length} usuário${users.length !== 1 ? "s" : ""} cadastrado${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2 border border-dashed border-slate-700/50 rounded-lg">
            <Users className="w-10 h-10 opacity-30" />
            <p className="text-sm">Nenhum usuário cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <UserCard
                key={user.publicKey}
                user={user}
                onRefresh={fetchUsers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
