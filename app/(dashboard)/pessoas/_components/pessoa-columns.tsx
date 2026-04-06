"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/DataTable";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface Pessoa {
  id: string;
  publicCode: string;
  personType: string;
  legalName: string;
  tradeName: string | null;
  taxId: string;
  city: string | null;
  state: string | null;
  isClient: boolean;
  isSupplier: boolean;
  isEmployee: boolean;
  isTenant: boolean;
  isVehicle: boolean;
}

function getCategorias(p: Pessoa): string[] {
  const cats: string[] = [];
  if (p.isClient) cats.push("Cliente");
  if (p.isSupplier) cats.push("Fornecedor");
  if (p.isEmployee) cats.push("Funcionário");
  if (p.isTenant) cats.push("Locatário");
  if (p.isVehicle) cats.push("Veículo");
  return cats;
}

function DeletePessoaButton({
  publicCode,
  name,
  onDeleted,
}: {
  publicCode: string;
  name: string;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/pessoas/${publicCode}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pessoa excluída com sucesso!");
        onDeleted();
      } else {
        toast.error("Erro ao excluir pessoa.");
      }
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={() => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Excluir Pessoa</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Tem certeza que deseja excluir <strong className="text-slate-200">{name}</strong>? Esta ação não pode ser desfeita.
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
  );
}

function ActionButtons({ row, onDeleted }: { row: Pessoa; onDeleted: () => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/pessoas/${row.publicCode}`);
        }}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <DeletePessoaButton
        publicCode={row.publicCode}
        name={row.legalName}
        onDeleted={onDeleted}
      />
    </div>
  );
}

export function getPessoaColumns(onRefresh: () => void): Column<Pessoa>[] {
  return [
    { key: "id", label: "Código", className: "font-mono text-xs" },
    {
      key: "personType",
      label: "Tipo",
      render: (v) => (
        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
          {v === "Juridica" ? "Jurídica" : "Física"}
        </Badge>
      ),
    },
    { key: "legalName", label: "Razão social", sortable: true },
    { key: "tradeName", label: "Nome fantasia", render: (v) => <span className="text-slate-400">{String(v || "—")}</span> },
    { key: "taxId", label: "CNPJ/CPF", className: "font-mono text-xs" },
    {
      key: "city",
      label: "Cidade/UF",
      render: (_, row) => (
        <span className="text-slate-400 text-sm">
          {row.city && row.state ? `${row.city}/${row.state}` : "—"}
        </span>
      ),
    },
    {
      key: "isClient",
      label: "Categorias",
      render: (_, row) => {
        const cats = getCategorias(row);
        return (
          <div className="flex flex-wrap gap-1">
            {cats.length === 0 ? (
              <span className="text-slate-600 text-xs italic">Nenhuma</span>
            ) : (
              cats.map((c) => (
                <Badge key={c} className="bg-sky-500/20 text-sky-400 border-sky-500/30 text-[10px]">
                  {c}
                </Badge>
              ))
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Ações",
      render: (_, row) => <ActionButtons row={row} onDeleted={onRefresh} />,
    },
  ];
}
