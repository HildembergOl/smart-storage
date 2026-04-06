"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/shared/DataTable";
import { Enterprise } from "@prisma/client";
import { DeleteEnterpriseDialog } from "./DeleteEnterpriseDialog";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const getCompanyColumns = (
  fetchCompanies: () => void,
  router: AppRouterInstance,
): Column<Enterprise>[] => [
  {
    key: "id",
    label: "Código",
    sortable: true,
  },
  {
    key: "publicCode",
    label: "Cód. Público",
    sortable: true,
  },
  { key: "legalName", label: "Razão Social", sortable: true },
  { key: "tradeName", label: "Nome Fantasia" },
  { key: "taxId", label: "CNPJ/CPF", className: "font-mono text-xs" },
  {
    key: "city",
    label: "Cidade/UF",
    render: (_, row: Enterprise) => `${row.city || "-"}/${row.state || "-"}`,
  },
  {
    key: "status",
    label: "Situação",
    render: (v) => (
      <Badge
        className={
          v === "Ativo"
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            : "bg-red-500/20 text-red-400 border-red-500/30"
        }
      >
        {String(v)}
      </Badge>
    ),
  },
  {
    key: "actions",
    label: "Ações",
    render: (_, row: Enterprise) => (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"
          onClick={() => {
            router.push(`/empresas/${row.publicCode}`);
          }}
          id={`edit-company-${row.publicCode}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <DeleteEnterpriseDialog
          id={row.publicCode}
          onSuccess={fetchCompanies}
        />
      </div>
    ),
  },
];
