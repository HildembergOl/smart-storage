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

export interface InventoryRow {
  id: string;
  publicCode: string;
  description: string;
  status: string;
  stockId: string;
  enterpriseId: string;
  createdAt: string;
  finishedAt: string | null;
  stock: {
    id: string;
    publicCode: string;
    description: string;
  };
}

function DeleteInventoryButton({
  publicCode,
  description,
  onDeleted,
}: {
  publicCode: string;
  description: string;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/inventario/${publicCode}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Inventário excluído com sucesso!");
        onDeleted();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Erro ao excluir inventário.");
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
            Excluir Inventário
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Tem certeza que deseja excluir o inventário{" "}
            <strong className="text-slate-200">{description}</strong>? Esta ação não
            pode ser desfeita e removerá todos os itens contados.
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
  row: InventoryRow;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const isFinished = row.status === "Finalizado";

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/inventario/${row.publicCode}`);
        }}
        id={`edit-btn-${row.publicCode}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      {!isFinished && (
        <DeleteInventoryButton
          publicCode={row.publicCode}
          description={row.description}
          onDeleted={onDeleted}
        />
      )}
    </div>
  );
}

export function getInventoryColumns(onRefresh: () => void): Column<InventoryRow>[] {
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
      render: (v: unknown, row: InventoryRow) => (
        <span className="text-slate-400">{row.stock?.description || "—"}</span>
      ),
    },
    {
      key: "description",
      label: "Descrição",
      className: "text-slate-200 font-medium",
    },
    {
      key: "status",
      label: "Status",
      render: (v: unknown) => {
        const val = String(v);
        const isFinished = val === "Finalizado";
        return (
          <Badge
            variant="outline"
            className={
              isFinished
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs"
            }
          >
            {val}
          </Badge>
        );
      },
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
      key: "finishedAt",
      label: "Finalização",
      sortable: true,
      render: (v: unknown) => {
        if (!v) return "—";
        return new Date(v as string).toLocaleDateString("pt-BR");
      },
    },
    {
      key: "actions",
      label: "Ações",
      render: (_: unknown, row: InventoryRow) => (
        <ActionButtons row={row} onDeleted={onRefresh} />
      ),
    },
  ];
}
