"use client";

import { useState } from "react";
import {
  Settings,
  Building2,
  Globe,
  Palette,
  Database,
  Save,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  FileText,
  CircleDollarSign,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MOEDAS = ["BRL – Real Brasileiro", "USD – Dólar Americano", "EUR – Euro"];
const FUSOS = [
  "America/Sao_Paulo (GMT-3)",
  "America/Manaus (GMT-4)",
  "America/Belem (GMT-3)",
  "America/Fortaleza (GMT-3)",
];
const FORMATOS_DATA = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const selectCls =
  "w-full px-3 py-2 rounded-md bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-sky-500 appearance-none cursor-pointer";

const inputCls =
  "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-sky-500";

const iconCls =
  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 z-10";

const cardCls =
  "bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50";
const titleCls = "text-slate-700 dark:text-slate-200 text-base";
const labelCls = "text-slate-600 dark:text-slate-300 text-sm";

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState({
    razaoSocial: "SmartStorage Ltda.",
    nomeFantasia: "SmartStorage",
    cnpj: "00.000.000/0001-00",
    email: "contato@smartstorage.com.br",
    telefone: "(11) 3000-0000",
    endereco: "Av. Paulista, 1000 – São Paulo/SP",
  });

  const [regional, setRegional] = useState({
    moeda: MOEDAS[0],
    fuso: FUSOS[0],
    formatoData: FORMATOS_DATA[0],
    idioma: "Português (Brasil)",
  });

  const [sistema, setSistema] = useState({
    estoqueMinimoPadrao: "10",
    diasAlertaVencimento: "30",
    prefixoDocumento: "SS",
    backupAutomatico: true,
    modoManutencao: false,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Configurações
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gerencie as configurações gerais do sistema
          </p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs">
          v1.0.0
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Data */}
        <Card className={cardCls}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-500" />
              <CardTitle className={titleCls}>Dados da Empresa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Razão Social",
                  key: "razaoSocial" as const,
                  icon: FileText,
                  placeholder: "Razão Social",
                },
                {
                  label: "Nome Fantasia",
                  key: "nomeFantasia" as const,
                  icon: Building2,
                  placeholder: "Nome Fantasia",
                },
                {
                  label: "CNPJ",
                  key: "cnpj" as const,
                  icon: FileText,
                  placeholder: "00.000.000/0001-00",
                },
                {
                  label: "E-mail",
                  key: "email" as const,
                  icon: Mail,
                  placeholder: "contato@empresa.com",
                  type: "email",
                },
                {
                  label: "Telefone",
                  key: "telefone" as const,
                  icon: Phone,
                  placeholder: "(00) 0000-0000",
                },
                {
                  label: "Endereço",
                  key: "endereco" as const,
                  icon: MapPin,
                  placeholder: "Rua, Número – Cidade/UF",
                },
              ].map(({ label, key, icon: Icon, placeholder, type }) => (
                <div key={key} className="space-y-1.5">
                  <Label className={labelCls}>{label}</Label>
                  <div className="relative">
                    <Icon className={iconCls} />
                    <Input
                      type={type ?? "text"}
                      value={empresa[key]}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, [key]: e.target.value })
                      }
                      className={`pl-9 ${inputCls}`}
                      placeholder={placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className={cardCls}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-500" />
              <CardTitle className={titleCls}>
                Configurações Regionais
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className={labelCls}>Moeda</Label>
                <div className="relative">
                  <CircleDollarSign className={iconCls} />
                  <select
                    value={regional.moeda}
                    onChange={(e) =>
                      setRegional({ ...regional, moeda: e.target.value })
                    }
                    className={`${selectCls} pl-9`}
                  >
                    {MOEDAS.map((m) => (
                      <option
                        key={m}
                        value={m}
                        className="bg-white dark:bg-slate-800"
                      >
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Fuso Horário</Label>
                <select
                  value={regional.fuso}
                  onChange={(e) =>
                    setRegional({ ...regional, fuso: e.target.value })
                  }
                  className={selectCls}
                >
                  {FUSOS.map((f) => (
                    <option
                      key={f}
                      value={f}
                      className="bg-white dark:bg-slate-800"
                    >
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Formato de Data</Label>
                <select
                  value={regional.formatoData}
                  onChange={(e) =>
                    setRegional({ ...regional, formatoData: e.target.value })
                  }
                  className={selectCls}
                >
                  {FORMATOS_DATA.map((f) => (
                    <option
                      key={f}
                      value={f}
                      className="bg-white dark:bg-slate-800"
                    >
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Idioma</Label>
                <div className="relative">
                  <Palette className={iconCls} />
                  <select
                    value={regional.idioma}
                    onChange={(e) =>
                      setRegional({ ...regional, idioma: e.target.value })
                    }
                    className={`${selectCls} pl-9`}
                  >
                    <option className="bg-white dark:bg-slate-800">
                      Português (Brasil)
                    </option>
                    <option className="bg-white dark:bg-slate-800">
                      English (US)
                    </option>
                    <option className="bg-white dark:bg-slate-800">
                      Español
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className={cardCls}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-500" />
              <CardTitle className={titleCls}>Parâmetros do Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className={labelCls}>Estoque mínimo padrão (un.)</Label>
                <Input
                  type="number"
                  value={sistema.estoqueMinimoPadrao}
                  onChange={(e) =>
                    setSistema({
                      ...sistema,
                      estoqueMinimoPadrao: e.target.value,
                    })
                  }
                  min={0}
                  className={inputCls}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Alerta de vencimento (dias)</Label>
                <Input
                  type="number"
                  value={sistema.diasAlertaVencimento}
                  onChange={(e) =>
                    setSistema({
                      ...sistema,
                      diasAlertaVencimento: e.target.value,
                    })
                  }
                  min={0}
                  className={inputCls}
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Prefixo de documentos</Label>
                <Input
                  value={sistema.prefixoDocumento}
                  onChange={(e) =>
                    setSistema({
                      ...sistema,
                      prefixoDocumento: e.target.value.toUpperCase(),
                    })
                  }
                  maxLength={5}
                  className={`${inputCls} uppercase`}
                  placeholder="SS"
                />
              </div>
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700/50" />

            <div className="space-y-3">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Funcionalidades
              </p>
              {[
                {
                  key: "backupAutomatico" as const,
                  label: "Backup automático diário",
                  desc: "Realiza backup do banco de dados às 02:00",
                  icon: Database,
                },
                {
                  key: "modoManutencao" as const,
                  label: "Modo manutenção",
                  desc: "Bloqueia acesso de outros usuários temporariamente",
                  icon: AlertTriangle,
                  danger: true,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <div className="mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={sistema[item.key]}
                      onChange={(e) =>
                        setSistema({ ...sistema, [item.key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 accent-sky-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-start gap-2 flex-1">
                    <item.icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${item.danger ? "text-amber-500" : "text-slate-400"}`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${item.danger ? "text-amber-600 dark:text-amber-300" : "text-slate-700 dark:text-slate-300"} group-hover:text-slate-900 dark:group-hover:text-slate-200`}
                      >
                        {item.label}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save / Reset Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Configurações
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white"
            onClick={() =>
              toast.info("Configurações restauradas para os padrões.")
            }
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </Button>
        </div>
      </form>

      {/* System Info Footer */}
      <Card className="bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Versão:
              </span>{" "}
              1.0.0
            </p>
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Banco:
              </span>{" "}
              PostgreSQL (Supabase)
            </p>
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Ambiente:
              </span>{" "}
              Produção
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
