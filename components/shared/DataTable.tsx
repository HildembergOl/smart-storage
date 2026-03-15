"use client";

import { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  keyField?: keyof T;
}

export function DataTable<T extends object>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Buscar...",
  pageSize = 10,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado.",
  keyField = "id" as keyof T,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] ?? "";
      const bv = (b as Record<string, unknown>)[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), "pt-BR", {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey)
      return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-slate-500" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1 text-sky-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 ml-1 text-sky-400" />
    );
  };

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-slate-800/60 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500"
          />
        </div>
      )}

      <div className="rounded-lg border border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/40">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    "text-slate-400 font-semibold text-xs uppercase tracking-wider",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-slate-200 transition-colors",
                    col.className,
                  )}
                  onClick={
                    col.sortable ? () => handleSort(String(col.key)) : undefined
                  }
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon colKey={String(col.key)} />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-700/30">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-4 bg-slate-700/50 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                  ) : (
                    <p className="text-slate-500 text-sm">{emptyMessage}</p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, i) => (
                <TableRow
                  key={
                    String(
                      (row as Record<string, unknown>)[keyField as string],
                    ) || i
                  }
                  className={cn(
                    "border-slate-700/30 transition-colors",
                    onRowClick
                      ? "cursor-pointer hover:bg-slate-700/30"
                      : "hover:bg-slate-800/30",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={cn(
                        "text-slate-300 text-sm py-3",
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(
                            (row as Record<string, unknown>)[col.key as string],
                            row,
                          )
                        : String(
                            (row as Record<string, unknown>)[
                              col.key as string
                            ] ?? "-",
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {Math.min((page - 1) * pageSize + 1, sorted.length)}–
            {Math.min(page * pageSize, sorted.length)} de {sorted.length}{" "}
            registros
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-sm",
                    p === page
                      ? "bg-sky-500 text-white hover:bg-sky-400"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
                  )}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
