"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumb } from "@/lib/contexts/BreadcrumbContext";

const routeLabels: Record<string, string> = {
  empresas: "Empresas",
  produtos: "Produtos",
  pessoas: "Pessoas",
  estoques: "Estoques",
  entradas: "Entradas",
  saidas: "Saídas",
  financeiro: "Financeiro",
  pagar: "Contas a Pagar",
  receber: "Contas a Receber",
  configuracoes: "Configurações",
  perfil: "Perfil",
  novo: "Novo",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const { labels } = useBreadcrumb();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-400">
        <Home className="w-3.5 h-3.5" />
        <span className="text-slate-700 dark:text-slate-200">Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="/"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = labels[segment] || routeLabels[segment] || segment;

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            {isLast ? (
              <span className="text-slate-700 dark:text-slate-200 font-medium">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
