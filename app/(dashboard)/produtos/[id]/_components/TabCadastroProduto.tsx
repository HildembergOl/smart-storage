"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AttributeSearchSelect } from "@/components/shared/AttributeSearchSelect";

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

interface TabCadastroProdutoProps {
  form: ProductForm;
  onChange: (field: keyof ProductForm, value: string) => void;
}

export function TabCadastroProduto({ form, onChange }: TabCadastroProdutoProps) {
  const input = (field: keyof ProductForm, placeholder?: string) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value),
    placeholder,
    className: "bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 h-9 text-sm",
  });

  return (
    <div className="space-y-5">
      {/* Descrição */}
      <div className="space-y-2">
        <Label>Descrição</Label>
        <Input {...input("description", "Nome/descrição do produto")} required />
      </div>

      {/* Tipo + Controle + Unidade + Situação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select value={form.productType} onValueChange={(v) => onChange("productType", v)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="Produto">Produto</SelectItem>
              <SelectItem value="Servico">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tipo de controle</Label>
          <Select value={form.controlType} onValueChange={(v) => onChange("controlType", v)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="Padrao">Padrão</SelectItem>
              <SelectItem value="Lote">Lote</SelectItem>
              <SelectItem value="Validade">Validade</SelectItem>
              <SelectItem value="Grade">Grade</SelectItem>
              <SelectItem value="NumeroSerie">Nº Série</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unidade de medida</Label>
          <AttributeSearchSelect
            type="unidade_medida"
            label="Unidade"
            value={form.unitOfMeasureId}
            displayText={form.unitOfMeasureName}
            onValueChange={(id, name) => {
              onChange("unitOfMeasureId", id);
              if (name) onChange("unitOfMeasureName", name);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Situação</Label>
          <Select value={form.status} onValueChange={(v) => onChange("status", v)}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Marca + Categoria + Grupo + Subgrupo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Marca</Label>
          <AttributeSearchSelect
            type="marca"
            label="Marca"
            value={form.brandId}
            displayText={form.brandName}
            onValueChange={(id, name) => {
              onChange("brandId", id);
              if (name) onChange("brandName", name);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <AttributeSearchSelect
            type="categoria"
            label="Categoria"
            value={form.categoryId}
            displayText={form.categoryName}
            onValueChange={(id, name) => {
              onChange("categoryId", id);
              if (name) onChange("categoryName", name);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Grupo</Label>
          <AttributeSearchSelect
            type="grupo"
            label="Grupo"
            value={form.groupId}
            displayText={form.groupName}
            onValueChange={(id, name) => {
              onChange("groupId", id);
              if (name) onChange("groupName", name);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Subgrupo</Label>
          <AttributeSearchSelect
            type="subgrupo"
            label="Subgrupo"
            value={form.subgroupId}
            displayText={form.subgroupName}
            onValueChange={(id, name) => {
              onChange("subgroupId", id);
              if (name) onChange("subgroupName", name);
            }}
          />
        </div>
      </div>
    </div>
  );
}
