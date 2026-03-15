"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { useState } from "react";
import { toast } from "sonner";

interface Embalagem {
  id: string;
  codigo: string;
  situacao: string;
  unidadeMedida: string;
  codigoBarras: string;
  fator: number;
  altura: number;
  largura: number;
  comprimento: number;
  cubagem: number;
  pesoBruto: number;
  pesoLiquido: number;
}

const mockMovimentos = [
  {
    data: "14/03/2025",
    tipo: "Entrada",
    documento: "NF-002341",
    pessoa: "Fornecedor ABC",
    estoque: "EE 01",
    qtd: 150,
    valorUnit: 30.0,
    total: 4500.0,
  },
  {
    data: "10/03/2025",
    tipo: "Saída",
    documento: "NF-001823",
    pessoa: "Empresa XYZ",
    estoque: "EE 01",
    qtd: 30,
    valorUnit: 40.0,
    total: 1200.0,
  },
];

const mockProdutoEstoques = [
  {
    codigo: "EE 01",
    descricao: "Estoque Principal",
    precoCusto: 2.5,
    ativo: true,
    quantidade: 12,
  },
  {
    codigo: "EE 02",
    descricao: "Depósito Norte",
    precoCusto: 2.5,
    ativo: false,
    quantidade: 0,
  },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

export default function ProdutoFormPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    codigo: "PRD001",
    descricao: "Parafuso M8 Inox 50mm",
    unidadeMedida: "UN",
    marca: "Tramontina",
    categoria: "Ferragens",
    grupo: "",
    subgrupo: "",
    tipoProduto: "Produto",
    tipoControle: "Padrao",
    situacao: "Ativo",
  });

  const [embalagens] = useState<Embalagem[]>([
    {
      id: "1",
      codigo: "EMB-01",
      situacao: "Ativo",
      unidadeMedida: "CX",
      codigoBarras: "7891234567890",
      fator: 12,
      altura: 5,
      largura: 10,
      comprimento: 15,
      cubagem: 750,
      pesoBruto: 1.2,
      pesoLiquido: 1.0,
    },
  ]);

  const [novaEmb, setNovaEmb] = useState({
    codigo: "",
    codigoBarras: "",
    fator: 1,
    altura: 0,
    largura: 0,
    comprimento: 0,
  });

  const field = (name: keyof typeof form) => ({
    value: form[name] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [name]: e.target.value })),
    className:
      "bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 text-sm h-9",
  });

  const handleSave = () => {
    toast.success("Produto salvo com sucesso!");
  };

  const calcCubagem = () =>
    novaEmb.altura * novaEmb.largura * novaEmb.comprimento;

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
            <h1 className="text-xl font-bold text-white">Editar Produto</h1>
            <p className="text-slate-400 text-sm">Código: {form.codigo}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-sky-500 hover:bg-sky-400 text-white gap-2"
          id="save-produto-btn"
        >
          <Save className="w-4 h-4" /> Salvar
        </Button>
      </div>

      <Card className="bg-slate-800/40 border-slate-700/50">
        <Tabs defaultValue="cadastro">
          <div className="px-6 pt-5 overflow-x-auto">
            <TabsList className="bg-slate-900/50 border border-slate-700/50 min-w-max">
              <TabsTrigger
                value="cadastro"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400 text-xs"
                id="tab-prod-cadastro"
              >
                Cadastro
              </TabsTrigger>
              <TabsTrigger
                value="embalagens"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400 text-xs"
                id="tab-prod-emb"
              >
                Embalagens
              </TabsTrigger>
              <TabsTrigger
                value="estoques"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400 text-xs"
                id="tab-prod-est"
              >
                Estoques
              </TabsTrigger>
              <TabsTrigger
                value="posicoes"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400 text-xs"
                id="tab-prod-pos"
              >
                Posições
              </TabsTrigger>
              <TabsTrigger
                value="movimentos"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400 text-xs"
                id="tab-prod-mov"
              >
                Movimentos
              </TabsTrigger>
              <TabsTrigger
                value="marketplace"
                className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400 text-xs"
                id="tab-prod-mkt"
              >
                Marketplace
              </TabsTrigger>
            </TabsList>
          </div>
          <CardContent className="pt-5">
            {/* Aba 1: Cadastro */}
            <TabsContent value="cadastro" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Código</Label>
                  <Input {...field("codigo")} id="prod-codigo" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-slate-300 text-xs">Descrição</Label>
                  <Input {...field("descricao")} id="prod-desc" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Unidade de Medida
                  </Label>
                  <Input
                    {...field("unidadeMedida")}
                    placeholder="UN, KG, LT..."
                    id="prod-unidade"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Marca</Label>
                  <Input {...field("marca")} id="prod-marca" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Categoria</Label>
                  <Input {...field("categoria")} id="prod-categoria" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Grupo</Label>
                  <Input {...field("grupo")} id="prod-grupo" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Subgrupo</Label>
                  <Input {...field("subgrupo")} id="prod-subgrupo" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Tipo de Produto
                  </Label>
                  <Select
                    value={form.tipoProduto}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, tipoProduto: v }))
                    }
                  >
                    <SelectTrigger
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                      id="prod-tipo"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="Produto">Produto</SelectItem>
                      <SelectItem value="Servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">
                    Tipo de Controle
                  </Label>
                  <Select
                    value={form.tipoControle}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, tipoControle: v }))
                    }
                  >
                    <SelectTrigger
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                      id="prod-controle"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="Padrao">Padrão</SelectItem>
                      <SelectItem value="Lote">Lote</SelectItem>
                      <SelectItem value="Validade">Validade</SelectItem>
                      <SelectItem value="Grade">Grade</SelectItem>
                      <SelectItem value="NumeroSerie">
                        Número de Série
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm"
                      id="prod-situacao"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Image Upload */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Imagem de Capa</Label>
                <div
                  className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-sky-500/50 transition-colors cursor-pointer"
                  id="prod-imagem-upload"
                >
                  <p className="text-slate-400 text-sm">
                    Clique para selecionar ou arraste uma imagem
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    PNG, JPG, WEBP — máximo 10MB
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Aba 2: Embalagens */}
            <TabsContent value="embalagens" className="mt-0 space-y-4">
              <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30 space-y-3">
                <h3 className="text-slate-300 text-sm font-semibold">
                  Nova Embalagem
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Código</Label>
                    <Input
                      value={novaEmb.codigo}
                      onChange={(e) =>
                        setNovaEmb((p) => ({ ...p, codigo: e.target.value }))
                      }
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="emb-cod-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">
                      Cód. Barras
                    </Label>
                    <Input
                      value={novaEmb.codigoBarras}
                      onChange={(e) =>
                        setNovaEmb((p) => ({
                          ...p,
                          codigoBarras: e.target.value,
                        }))
                      }
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="emb-barras-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">Fator</Label>
                    <Input
                      type="number"
                      value={novaEmb.fator}
                      onChange={(e) =>
                        setNovaEmb((p) => ({ ...p, fator: +e.target.value }))
                      }
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="emb-fator-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">
                      Altura (cm)
                    </Label>
                    <Input
                      type="number"
                      value={novaEmb.altura}
                      onChange={(e) =>
                        setNovaEmb((p) => ({ ...p, altura: +e.target.value }))
                      }
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="emb-altura-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">
                      Largura (cm)
                    </Label>
                    <Input
                      type="number"
                      value={novaEmb.largura}
                      onChange={(e) =>
                        setNovaEmb((p) => ({ ...p, largura: +e.target.value }))
                      }
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="emb-largura-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-300 text-xs">
                      Comprimento (cm)
                    </Label>
                    <Input
                      type="number"
                      value={novaEmb.comprimento}
                      onChange={(e) =>
                        setNovaEmb((p) => ({
                          ...p,
                          comprimento: +e.target.value,
                        }))
                      }
                      className="bg-slate-900/50 border-slate-700 text-slate-200 h-8 text-sm"
                      id="emb-comp-input"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-slate-400 text-xs">
                    Cubagem calculada:{" "}
                    <span className="text-sky-400 font-semibold">
                      {calcCubagem().toFixed(2)} cm³
                    </span>
                  </p>
                  <Button
                    size="sm"
                    className="bg-sky-500 hover:bg-sky-400 text-white gap-1"
                    id="add-emb-btn"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-700/50 overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-slate-800/40">
                    <tr>
                      {[
                        "Código",
                        "Situação",
                        "Unid.",
                        "Cód. Barras",
                        "Fator",
                        "Alt",
                        "Larg",
                        "Comp",
                        "Cubagem",
                        "Peso Br.",
                        "Peso Lq.",
                        "Ações",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2 text-slate-400 text-xs font-semibold uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {embalagens.map((e) => (
                      <tr
                        key={e.id}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="px-3 py-2 text-slate-300 font-mono text-xs">
                          {e.codigo}
                        </td>
                        <td className="px-3 py-2">
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
                        <td className="px-3 py-2 text-slate-300">
                          {e.unidadeMedida}
                        </td>
                        <td className="px-3 py-2 text-slate-400 font-mono text-xs">
                          {e.codigoBarras}
                        </td>
                        <td className="px-3 py-2 text-slate-300">{e.fator}</td>
                        <td className="px-3 py-2 text-slate-400">{e.altura}</td>
                        <td className="px-3 py-2 text-slate-400">
                          {e.largura}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {e.comprimento}
                        </td>
                        <td className="px-3 py-2 text-sky-400 font-semibold">
                          {e.cubagem.toFixed(0)}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {e.pesoBruto}
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {e.pesoLiquido}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-400"
                            id={`del-emb-${e.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Aba 3: Estoques do Produto */}
            <TabsContent value="estoques" className="mt-0">
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/40">
                    <tr>
                      {[
                        "Cód. Estoque",
                        "Desc. Estoque",
                        "Preço de Custo",
                        "Ativo",
                        "Qtd. Estoque",
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
                    {mockProdutoEstoques.map((e, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-3 text-slate-300 font-mono">
                          {e.codigo}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {e.descricao}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {formatCurrency(e.precoCusto)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              e.ativo
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                                : "bg-slate-700/50 text-slate-500 text-xs"
                            }
                          >
                            {e.ativo ? "Sim" : "Não"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sky-400 font-bold">
                          {e.quantidade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Aba 4: Posições */}
            <TabsContent value="posicoes" className="mt-0">
              <p className="text-slate-500 text-sm text-center py-8">
                Nenhuma posição vinculada a este produto.
              </p>
            </TabsContent>

            {/* Aba 5: Movimentos */}
            <TabsContent value="movimentos" className="mt-0">
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/40">
                    <tr>
                      {[
                        "Data",
                        "Tipo",
                        "Documento",
                        "Pessoa",
                        "Estoque",
                        "Qtd",
                        "Valor Unit.",
                        "Total",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-3 py-2.5 text-slate-400 text-xs font-semibold uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockMovimentos.map((m, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="px-3 py-2.5 text-slate-400">{m.data}</td>
                        <td className="px-3 py-2.5">
                          <Badge
                            className={
                              m.tipo === "Entrada"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                                : "bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
                            }
                          >
                            {m.tipo}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">
                          {m.documento}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300">
                          {m.pessoa}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300">
                          {m.estoque}
                        </td>
                        <td className="px-3 py-2.5 text-sky-400 font-semibold">
                          {m.qtd}
                        </td>
                        <td className="px-3 py-2.5 text-slate-300">
                          {formatCurrency(m.valorUnit)}
                        </td>
                        <td className="px-3 py-2.5 text-emerald-400 font-semibold">
                          {formatCurrency(m.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Aba 6: Marketplace */}
            <TabsContent value="marketplace" className="mt-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs">Estoque</Label>
                <Select>
                  <SelectTrigger
                    className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm max-w-xs"
                    id="mkt-estoque-select"
                  >
                    <SelectValue placeholder="Selecione o estoque" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="ee01">
                      EE 01 — Estoque Principal
                    </SelectItem>
                    <SelectItem value="ee02">EE 02 — Depósito Norte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div
                className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-sky-500/50 transition-colors cursor-pointer"
                id="mkt-images-upload"
              >
                <p className="text-slate-400 text-sm">
                  Clique para adicionar imagens do produto
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Aceita múltiplas imagens (image/*)
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border border-slate-700/50 bg-slate-900/50 flex items-center justify-center text-slate-600"
                  >
                    <span className="text-xs">IMG {i}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
