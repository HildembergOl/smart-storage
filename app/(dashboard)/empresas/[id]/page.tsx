"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { mockPessoas } from "../../pessoas/page";

const mockEstoques = [
  {
    id: "1",
    codigo: "EE 01",
    codigoPublico: "EE-PUB-01",
    descricao: "Estoque Principal",
    locatario: "",
    situacao: "Ativo",
  },
  {
    id: "2",
    codigo: "EE 02",
    codigoPublico: "EE-PUB-02",
    descricao: "Depósito Norte",
    locatario: "João Silva",
    situacao: "Ativo",
  },
];

const mockSetores = [
  { id: "1", codigo: "SET-A", descricao: "Setor A - Eletrônicos" },
  { id: "2", codigo: "SET-B", descricao: "Setor B - Ferramentas" },
];

const mockPosicoes = [
  {
    id: "1",
    codigo: "POS-A01-R01",
    estoqueId: "EE 01",
    setorId: "SET-A",
    rua: "01",
    bloco: "A",
    andar: "1",
    locacao: "01",
  },
];

export default function EmpresaFormPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNovo = id === "novo";

  const [form, setForm] = useState({
    codigo: isNovo ? "" : "EMP001",
    codigoPublico: isNovo ? "" : "SMART01",
    situacao: "Ativo",
    tipoEmpresa: "Juridica",
    razaoSocial: isNovo ? "" : "Smart Tecnologia LTDA",
    nomeFantasia: isNovo ? "" : "SmartTech",
    cnpjCpf: isNovo ? "" : "12.345.678/0001-90",
    inscricaoEstadual: "",
    email: isNovo ? "" : "contato@smarttech.com",
    endereco: isNovo ? "" : "Av. Paulista",
    numero: isNovo ? "" : "1234",
    complemento: "Sala 45",
    bairro: "Bela Vista",
    cidade: isNovo ? "" : "São Paulo",
    estado: isNovo ? "" : "SP",
    observacoes: "",
  });

  const field = (name: keyof typeof form) => ({
    value: form[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [name]: e.target.value })),
    className:
      "bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500",
  });

  const handleSave = () => {
    toast.success("Empresa salva com sucesso!");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-slate-200"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isNovo ? "Nova Empresa" : "Editar Empresa"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isNovo ? "Cadastre uma nova empresa" : `Código: ${form.codigo}`}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="save-empresa-btn"
        >
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <Tabs defaultValue="cadastro">
          <div className="px-6 pt-5">
            <TabsList className="bg-slate-900/50 border border-slate-700/50">
              <TabsTrigger
                value="cadastro"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                id="tab-emp-cadastro"
              >
                Cadastro
              </TabsTrigger>
              <TabsTrigger
                value="estoques"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                id="tab-emp-estoques"
              >
                Estoques
              </TabsTrigger>
              <TabsTrigger
                value="setores"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                id="tab-emp-setores"
              >
                Setores
              </TabsTrigger>
              <TabsTrigger
                value="posicoes"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                id="tab-emp-posicoes"
              >
                Posições
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="pt-5">
            {/* Aba 1: Cadastro */}
            <TabsContent value="cadastro" className="mt-0 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Código</Label>
                  <Input
                    {...field("codigo")}
                    placeholder="EMP001"
                    id="emp-codigo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Código Público
                  </Label>
                  <Input
                    {...field("codigoPublico")}
                    placeholder="PUB001"
                    id="emp-codigo-publico"
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Situação</Label>
                  <Select
                    value={form.situacao}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, situacao: v }))
                    }
                  >
                    <SelectTrigger
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-9"
                      id="emp-situacao"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Tipo de Empresa
                  </Label>
                  <Select
                    value={form.tipoEmpresa}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, tipoEmpresa: v }))
                    }
                  >
                    <SelectTrigger
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-9"
                      id="emp-tipo"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="Juridica">Jurídica</SelectItem>
                      <SelectItem value="Fisica">Física</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Razão Social</Label>
                  <Input
                    {...field("razaoSocial")}
                    placeholder="Nome completo / Razão social"
                    id="emp-razao-social"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Nome Fantasia
                  </Label>
                  <Input
                    {...field("nomeFantasia")}
                    placeholder="Nome Fantasia"
                    id="emp-nome-fantasia"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">CNPJ / CPF</Label>
                  <Input
                    {...field("cnpjCpf")}
                    placeholder="00.000.000/0001-00"
                    id="emp-cnpj"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Inscrição Estadual / RG
                  </Label>
                  <Input
                    {...field("inscricaoEstadual")}
                    placeholder="Insc. Estadual"
                    id="emp-ie"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">E-mail</Label>
                  <Input
                    {...field("email")}
                    type="email"
                    placeholder="contato@empresa.com"
                    id="emp-email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-slate-300 text-xs">Endereço</Label>
                  <Input
                    {...field("endereco")}
                    placeholder="Rua / Avenida"
                    id="emp-endereco"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Número</Label>
                  <Input
                    {...field("numero")}
                    placeholder="123"
                    id="emp-numero"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Complemento</Label>
                  <Input
                    {...field("complemento")}
                    placeholder="Sala, Andar"
                    id="emp-complemento"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Bairro</Label>
                  <Input
                    {...field("bairro")}
                    placeholder="Bairro"
                    id="emp-bairro"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Cidade</Label>
                  <Input
                    {...field("cidade")}
                    placeholder="Cidade"
                    id="emp-cidade"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Estado</Label>
                  <Input
                    {...field("estado")}
                    placeholder="SP"
                    maxLength={2}
                    id="emp-estado"
                  />
                </div>
                <div className="col-span-3 space-y-1.5">
                  <Label className="text-slate-300 text-xs">Observações</Label>
                  <Textarea
                    value={form.observacoes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, observacoes: e.target.value }))
                    }
                    placeholder="Observações adicionais..."
                    className="bg-slate-900/50 border-slate-700 text-slate-200 resize-none"
                    rows={2}
                    id="emp-obs"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba 2: Estoques */}
            <TabsContent value="estoques" className="mt-0 space-y-4">
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
                <h3 className="text-slate-300 text-sm font-semibold">
                  Cadastrar Estoque
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Código</Label>
                    <Input
                      placeholder="EE 01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="est-codigo-input"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">
                      Código Público
                    </Label>
                    <Input
                      placeholder="PUB-01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="est-pub-input"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <Label className="text-slate-300 text-xs">Descrição</Label>
                    <Input
                      placeholder="Estoque Principal"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="est-desc-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Locatário</Label>
                    <Select>
                      <SelectTrigger
                        className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                        id="pos-pessoa-select"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        {mockPessoas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.codigo} — {p.nomeFantasia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-400 text-white gap-1"
                  id="add-estoque-btn"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/40">
                    <tr>
                      {[
                        "Código",
                        "Cód. Público",
                        "Descrição",
                        "Locatário",
                        "Situação",
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
                    {mockEstoques.map((e) => (
                      <tr
                        key={e.id}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-2.5 text-slate-300 font-mono">
                          {e.codigo}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {e.codigoPublico}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {e.descricao}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {e.locatario || "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge
                            className={
                              e.situacao === "Ativo"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                                : "bg-red-500/20 text-red-400 border-red-500/30 text-xs"
                            }
                          >
                            {e.situacao}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-sky-400"
                              id={`edit-est-${e.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-red-400"
                              id={`del-est-${e.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Aba 3: Setores */}
            <TabsContent value="setores" className="mt-0 space-y-4">
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
                <h3 className="text-slate-300 text-sm font-semibold">
                  Cadastrar Setor
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Código</Label>
                    <Input
                      placeholder="SET-A"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="set-codigo-input"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Descrição</Label>
                    <Input
                      placeholder="Setor A - Eletrônicos"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="set-desc-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Pessoa</Label>
                    <Select>
                      <SelectTrigger
                        className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                        id="set-pessoa-select"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        {mockPessoas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.codigo} — {p.nomeFantasia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-400 text-white gap-1"
                  id="add-setor-btn"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/40">
                    <tr>
                      {["Código", "Descrição", "Ações"].map((h) => (
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
                    {mockSetores.map((s) => (
                      <tr
                        key={s.id}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-2.5 text-slate-300 font-mono">
                          {s.codigo}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {s.descricao}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-sky-400"
                              id={`edit-set-${s.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-red-400"
                              id={`del-set-${s.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Aba 4: Posições */}
            <TabsContent value="posicoes" className="mt-0 space-y-4">
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
                <h3 className="text-slate-300 text-sm font-semibold">
                  Cadastrar Posição
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Código</Label>
                    <Input
                      placeholder="POS-A01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="pos-codigo-input"
                      disabled
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Estoque</Label>
                    <Select>
                      <SelectTrigger
                        className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                        id="pos-estoque-select"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        {mockEstoques.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.codigo} — {e.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Setor</Label>
                    <Select>
                      <SelectTrigger
                        className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                        id="pos-setor-select"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        {mockSetores.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.codigo} — {s.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Pessoa</Label>
                    <Select>
                      <SelectTrigger
                        className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                        id="pos-pessoa-select"
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                        {mockPessoas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.codigo} — {p.nomeFantasia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Corredor</Label>
                    <Input
                      placeholder="01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="pos-corredor-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Bloco</Label>
                    <Input
                      placeholder="01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="pos-bloco-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Prateleira</Label>
                    <Input
                      placeholder="01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="pos-prateleira-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Locação</Label>
                    <Input
                      placeholder="01"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="pos-locacao-input"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-sky-500 hover:bg-sky-400 text-white gap-1"
                  id="add-posicao-btn"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/40">
                    <tr>
                      {[
                        "Código",
                        "Estoque",
                        "Setor",
                        "Corredor",
                        "Bloco",
                        "Prateleira",
                        "Locação",
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
                    {mockPosicoes.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">
                          {p.codigo}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {p.estoqueId}
                        </td>
                        <td className="px-4 py-2.5 text-slate-300">
                          {p.setorId}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{p.rua}</td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {p.bloco}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {p.andar}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">
                          {p.locacao}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-sky-400"
                              id={`edit-pos-${p.id}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-400 hover:text-red-400"
                              id={`del-pos-${p.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
