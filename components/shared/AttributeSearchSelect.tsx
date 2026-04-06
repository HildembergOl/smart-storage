"use client";
import { forwardRef, InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebouncePromise } from "@/hooks/use-debounce";
import { CheckIcon, Loader2, PlusIcon } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCallback } from "react";

interface AttributeSearchSelectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  type: "unidade_medida" | "marca" | "categoria" | "grupo" | "subgrupo";
  label: string;
  value?: string | number | null;
  onValueChange: (id: string, name: string) => void;
  displayText?: string;
}

export const AttributeSearchSelect = forwardRef<
  HTMLInputElement,
  AttributeSearchSelectProps
>(
  (
    {
      type,
      label,
      className,
      disabled,
      onValueChange,
      value,
      displayText,
      ...props
    },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [display, setDisplay] = useState(displayText || "");
    const [data, setData] = useState<Array<{ id: string; name: string }> | []>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    const fetchAttributes = useCallback(async (search: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/atributos?type=${type}&search=${search}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching attributes", err);
      } finally {
        setLoading(false);
      }
    }, [type]);

    const debounceFetch = useDebouncePromise<string>(fetchAttributes);

    useEffect(() => {
      if (open) fetchAttributes("");
    }, [open, fetchAttributes]);

    useEffect(() => {
      setDisplay(displayText || "");
    }, [displayText]);

    const handleCreate = async () => {
      if (!searchTerm) return;
      setCreating(true);
      try {
        const res = await fetch("/api/admin/atributos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: searchTerm, type }),
        });
        const json = await res.json();
        if (res.ok) {
          onValueChange(json.id.toString(), json.name);
          setDisplay(json.name);
          setOpen(false);
          toast.success(`${label} "${json.name}" cadastrado com sucesso.`);
        } else {
          toast.error(json.error || "Erro ao cadastrar");
        }
      } catch (err) {
        console.error("Error creating attribute", err);
        toast.error("Erro na comunicação com o servidor");
      } finally {
        setCreating(false);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <div className="relative w-full cursor-pointer">
              <Input
                {...props}
                className={cn("cursor-pointer read-only:bg-transparent", className)}
                value={display}
                placeholder={`Selecionar ${label}...`}
                readOnly
                ref={ref}
                disabled={disabled}
              />
            </div>
          }
          disabled={disabled}
        />
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Pesquisar ou incluir ${label}...`}
              onValueChange={(val: string) => {
                setSearchTerm(val);
                debounceFetch(val);
              }}
              value={searchTerm}
            />
            <CommandList>
              <div className="max-h-72 overflow-y-auto">
                <CommandGroup>
                  {searchTerm && !loading && !data.some(d => d.name.toLowerCase() === searchTerm.toLowerCase()) && (
                    <CommandItem 
                      onSelect={handleCreate}
                      className="flex items-center gap-2 text-primary font-medium"
                    >
                      {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
                      Cadastrar &quot;{searchTerm}&quot;
                    </CommandItem>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Espere...
                    </div>
                  )}

                  {!loading && data.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        onValueChange(item.id, item.name);
                        setDisplay(item.name);
                        setOpen(false);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      {value?.toString() === item.id && <CheckIcon className="h-4 w-4" />}
                    </CommandItem>
                  ))}

                  {!loading && data.length === 0 && !searchTerm && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Comece a digitar para pesquisar...
                    </div>
                  )}
                </CommandGroup>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

AttributeSearchSelect.displayName = "AttributeSearchSelect";
