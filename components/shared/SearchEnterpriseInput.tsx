"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchResult {
  id: string | bigint;
  publicCode?: string;
  legalName?: string;
  tradeName?: string;
  taxId?: string;
}

interface SearchEnterpriseInputProps<T extends SearchResult> {
  placeholder?: string;
  endpoint: string;
  extraFilters?: Record<string, string | boolean | number>;
  onSelect: (item: T | null) => void;
  displayValue?: string;
  className?: string;
}

export function SearchEnterpriseInput<T extends SearchResult>({
  placeholder = "Pesquisar...",
  endpoint,
  extraFilters = {},
  onSelect,
  displayValue = "",
  className,
}: SearchEnterpriseInputProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(displayValue);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // If the query is already the same as the selected item, don't search
    if (
      !open ||
      query.length < 2 ||
      (results.length > 0 &&
        query === results.find((r) => r.legalName === query)?.legalName)
    ) {
      if (query.length < 2) setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: query,
          ...Object.fromEntries(
            Object.entries(extraFilters).map(([k, v]) => [k, String(v)]),
          ),
        });
        const res = await fetch(`${endpoint}?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, endpoint, JSON.stringify(extraFilters)]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          className="pr-8"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                onSelect(null);
              }}
              className="text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl max-h-60 overflow-auto">
          {loading && results.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-400">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((item) => (
                <li
                  key={item.id.toString()}
                  onClick={() => {
                    const name = item.legalName || "";
                    setQuery(name);
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="px-3 py-2 text-sm text-slate-200 hover:bg-sky-500/20 cursor-pointer flex flex-col gap-0.5"
                >
                  <span className="font-medium">
                    {item.tradeName || item.legalName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{`${item.id} - ${item.legalName}`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-xs text-slate-400">
              Nenhum resultado encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
