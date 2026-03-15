"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function PessoaFormPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "PES001",
    tipoPessoa: "Juridica",
    razaoSocial: "Fornecedor ABC LTDA",
    nomeFantasia: "Fornecedor ABC",
    cnpjCpf: "12.345.678/0001-90",
    inscricaoEstadual: "",
    email: "contato@fornecedorabc.com",
    endereco: "Av. Industrial",
    numero: "500",
    complemento: "Galpão 3",
    bairro: "Distrito Industrial",
    cidade: "São Paulo",
    estado: "SP",
    observacoes: "",
    isCliente: false,
    isFornecedor: true,
    isFuncionario: false,
    isLocatario: false,
    isVeiculo: false,
  });

  const field = (name: string) => ({
    value: (form as Record<string, unknown>)[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [name]: e.target.value })),
    className:
      "bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm h-9",
  });

  const checkField = (name: keyof typeof form) => ({
    checked: form[name] as boolean,
    onCheckedChange: (v: boolean) =>
      setForm((prev) => ({ ...prev, [name]: v })),
  });

  const handleSave = () => {
    toast.success("Pessoa salva com sucesso!");
  };

  return (
    <div className="space-y-4">
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
            <h1 className="text-xl font-bold text-white">Editar Pessoa</h1>
            <p className="text-slate-400 text-sm">Código: {form.codigo}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="save-pessoa-btn"
        >
          <Save className="w-4 h-4" />
          Salvar
        </Button>
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Código</Label>
              <Input
                {...field("codigo")}
                placeholder="PES001"
                id="pes-codigo"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Tipo de Pessoa</Label>
              <Select
                value={form.tipoPessoa}
                onValueChange={(v) => setForm((p) => ({ ...p, tipoPessoa: v }))}
              >
                <SelectTrigger
                  className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                  id="pes-tipo"
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
              <Input {...field("razaoSocial")} id="pes-razao" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Nome Fantasia</Label>
              <Input {...field("nomeFantasia")} id="pes-fantasia" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">CNPJ / CPF</Label>
              <Input {...field("cnpjCpf")} id="pes-cnpj" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">
                Inscrição Estadual / RG
              </Label>
              <Input {...field("inscricaoEstadual")} id="pes-ie" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">E-mail</Label>
              <Input {...field("email")} type="email" id="pes-email" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-slate-300 text-xs">Endereço</Label>
              <Input {...field("endereco")} id="pes-endereco" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Número</Label>
              <Input {...field("numero")} id="pes-numero" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Complemento</Label>
              <Input {...field("complemento")} id="pes-compl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Bairro</Label>
              <Input {...field("bairro")} id="pes-bairro" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Cidade</Label>
              <Input {...field("cidade")} id="pes-cidade" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs">Estado</Label>
              <Input {...field("estado")} maxLength={2} id="pes-estado" />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label className="text-slate-300 text-xs">Observações</Label>
              <Textarea
                value={form.observacoes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, observacoes: e.target.value }))
                }
                className="bg-slate-900/50 border-slate-700 text-slate-200 resize-none"
                rows={2}
                id="pes-obs"
              />
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Categories */}
          <div>
            <CardTitle className="text-slate-300 text-sm mb-4">
              Categorias
            </CardTitle>
            <div className="flex flex-wrap gap-6">
              {[
                { id: "isCliente", label: "Cliente" },
                { id: "isFornecedor", label: "Fornecedor" },
                { id: "isFuncionario", label: "Funcionário" },
                { id: "isLocatario", label: "Locatário" },
                { id: "isVeiculo", label: "Veículos" },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center gap-2">
                  <Checkbox
                    id={`pes-cat-${id}`}
                    {...checkField(id as keyof typeof form)}
                    className="border-slate-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                  />
                  <Label
                    htmlFor={`pes-cat-${id}`}
                    className="text-slate-300 text-sm cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
