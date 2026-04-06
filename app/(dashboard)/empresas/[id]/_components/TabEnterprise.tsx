import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Enterprise } from "@prisma/client";

interface TabOverviewEnterpriseProps {
  formData: Partial<Enterprise>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  isNew: boolean;
}

export const TabOverviewEnterprise = (props: TabOverviewEnterpriseProps) => {
  const { formData, handleInputChange, handleSelectChange, isNew } = props;

  return (
    <TabsContent value="overview" className="mt-0 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Código</Label>
          <Input
            name="id"
            value={String(formData.id)}
            onChange={handleInputChange}
            placeholder="Gerado automaticamente"
            disabled={!isNew}
            readOnly={!isNew}
            className="bg-slate-900/50 border-slate-700 text-slate-400 font-mono disabled:opacity-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Situação</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => handleSelectChange("status", v)}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Tipo</Label>
          <Select
            value={formData.enterpriseType}
            onValueChange={(v) => handleSelectChange("enterpriseType", v)}
          >
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
              <SelectItem value="Juridica">Pessoa Jurídica</SelectItem>
              <SelectItem value="Fisica">Pessoa Física</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-slate-400 text-xs">
            Razão Social / Nome Completo *
          </Label>
          <Input
            name="legalName"
            required
            value={formData.legalName}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">
            Nome Fantasia / Apelido
          </Label>
          <Input
            name="tradeName"
            value={formData.tradeName || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">CNPJ / CPF *</Label>
          <Input
            name="taxId"
            required
            value={formData.taxId}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Insc. Estadual / RG</Label>
          <Input
            name="stateRegistration"
            value={formData.stateRegistration || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Email de Contato</Label>
          <Input
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
        <div className="md:col-span-3 space-y-1.5">
          <Label className="text-slate-400 text-xs">Endereço</Label>
          <Input
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Número</Label>
          <Input
            name="number"
            value={formData.number || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-slate-400 text-xs">Bairro</Label>
          <Input
            name="neighborhood"
            value={formData.neighborhood || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-slate-400 text-xs">Complemento</Label>
          <Input
            name="complement"
            value={formData.complement || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <Label className="text-slate-400 text-xs">Cidade</Label>
          <Input
            name="city"
            value={formData.city || ""}
            onChange={handleInputChange}
            className="bg-slate-900/50 border-slate-700 text-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">UF</Label>
          <Input
            name="state"
            value={formData.state || ""}
            onChange={handleInputChange}
            maxLength={2}
            className="bg-slate-900/50 border-slate-700 text-slate-200 uppercase"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-400 text-xs">Observações Internas</Label>
        <Textarea
          name="notes"
          value={formData.notes || ""}
          onChange={handleInputChange}
          className="bg-slate-900/50 border-slate-700 text-slate-200 min-h-[100px]"
        />
      </div>
    </TabsContent>
  );
};
