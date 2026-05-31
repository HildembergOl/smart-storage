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

export interface SaidaRow {
  id: string;
  publicCode: string;
  stockId: string;
  personId: string;
  number: string;
  type: string;
  nfeKey: string | null;
  totalProduct: number;
  totalNfe: number;
  notes: string | null;
  createdAt: string;
  stock: {
    id: string;
    publicCode: string;
    description: string;
  };
  person: {
    id: string;
    publicCode: string;
    legalName: string;
    tradeName: string | null;
  };
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function DeleteSaidaButton({
  publicCode,
  number,
  onDeleted,
}: {
  publicCode: string;
  number: string;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/saidas/${publicCode}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Saída excluída com sucesso!");
        onDeleted();
      } else {
        toast.error("Erro ao excluir saída.");
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
            id={`delete-btn-${publicCode}`}
          />
        }
      >
        <Trash2 className="w-3.5 h-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Excluir Saída
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Tem certeza que deseja excluir a saída número{" "}
            <strong className="text-slate-200">{number}</strong>? Esta ação não
            pode ser desfeita e removerá seus itens associados.
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
  row: SaidaRow;
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
          router.push(`/saidas/${row.publicCode}`);
        }}
        id={`edit-btn-${row.publicCode}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <DeleteSaidaButton
        publicCode={row.publicCode}
        number={row.number}
        onDeleted={onDeleted}
      />
    </div>
  );
}

export function getSaidaColumns(onRefresh: () => void): Column<SaidaRow>[] {
  return [
    {
      key: "id",
      label: "Código",
      sortable: true,
      className: "font-mono text-xs text-slate-300",
    },
    {
      key: "stock",
      label: "Estoque",
      render: (v: unknown, row: SaidaRow) => (
        <span className="text-slate-400">{row.stock?.description || "—"}</span>
      ),
    },
    {
      key: "person",
      label: "Pessoa",
      sortable: true,
      render: (v: unknown, row: SaidaRow) => (
        <span className="text-slate-300">
          {row.person?.tradeName || row.person?.legalName || "—"}
        </span>
      ),
    },
    {
      key: "number",
      label: "Número",
      className: "font-mono text-xs text-slate-300",
    },
    {
      key: "type",
      label: "Tipo",
      render: (v: unknown) => (
        <Badge
          variant="outline"
          className="border-slate-600 text-slate-400 text-xs"
        >
          {String(v)}
        </Badge>
      ),
    },
    {
      key: "totalProduct",
      label: "Total Produto",
      render: (v: unknown) => (
        <span className="text-slate-300">{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: "totalNfe",
      label: "Total NF-e",
      render: (v: unknown) => (
        <span className="font-semibold text-orange-400">
          {formatCurrency(v as number)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data",
      sortable: true,
      render: (v: unknown) => {
        if (!v) return "—";
        return new Date(v as string).toLocaleDateString("pt-BR");
      },
    },
    {
      key: "actions",
      label: "Ações",
      render: (_: unknown, row: SaidaRow) => (
        <ActionButtons row={row} onDeleted={onRefresh} />
      ),
    },
  ];
}
