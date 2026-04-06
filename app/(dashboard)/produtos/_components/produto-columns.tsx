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
import { Product, ProductAttribute } from "@prisma/client";

export interface Produto extends Product {
  unitOfMeasure?: ProductAttribute | null;
  brand?: ProductAttribute | null;
  category?: ProductAttribute | null;
  group?: ProductAttribute | null;
  subgroup?: ProductAttribute | null;
}
const CONTROL_TYPE_LABELS: Record<string, string> = {
  Padrao: "Padrão",
  Lote: "Lote",
  Validade: "Validade",
  Grade: "Grade",
  NumeroSerie: "Nº Série",
};

function DeleteProdutoButton({
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
      const res = await fetch(`/api/produtos/${publicCode}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Produto excluído com sucesso!");
        onDeleted();
      } else {
        toast.error("Erro ao excluir produto.");
      }
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  return (
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
            Excluir Produto
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Tem certeza que deseja excluir{" "}
            <strong className="text-slate-200">{name}</strong>? Esta ação não
            pode ser desfeita.
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

function ActionButtons({
  row,
  onDeleted,
}: {
  row: Product;
  onDeleted: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/produtos/${row.publicCode}`);
        }}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <DeleteProdutoButton
        publicCode={row.publicCode}
        name={row.description}
        onDeleted={onDeleted}
      />
    </div>
  );
}

export function getProdutoColumns(onRefresh: () => void): Column<Product>[] {
  return [
    { key: "id", label: "Código", className: "font-mono text-xs" },
    { key: "description", label: "Descrição", sortable: true },
    { 
      key: "unitOfMeasure",
      label: "Unidade",
      render: (v: unknown, row: Produto) => (
        <span className="text-slate-400">{String(row.unitOfMeasure?.name || "—")}</span>
      ),
    },
    {
      key: "brand",
      label: "Marca",
      render: (v: unknown, row: Produto) => (
        <span className="text-slate-400">{String(row.brand?.name || "—")}</span>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      render: (v: unknown, row: Produto) => (
        <span className="text-slate-400">{String(row.category?.name || "—")}</span>
      ),
    },
    {
      key: "controlType",
      label: "Tipo controle",
      render: (v: unknown) => (
        <Badge
          variant="outline"
          className="border-slate-600 text-slate-400 text-xs"
        >
          {CONTROL_TYPE_LABELS[String(v)] || String(v)}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Situação",
      render: (v: unknown) => (
        <Badge
          className={
            v === "Ativo"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
              : "bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"
          }
        >
          {String(v)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      render: (_: unknown, row: Produto) => <ActionButtons row={row} onDeleted={onRefresh} />,
    },
  ];
}
