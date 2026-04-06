"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

function Command({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command"
      className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-slate-800 text-slate-200", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CommandInput({
  className,
  onValueChange,
  ...props
}: React.ComponentProps<"input"> & { onValueChange?: (val: string) => void }) {
  return (
    <div className="flex items-center border-b border-slate-700 px-3" data-slot="command-input-wrapper">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      />
    </div>
  )
}

function CommandList({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-list"
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CommandGroup({ children, className, heading, ...props }: React.ComponentProps<"div"> & { heading?: string }) {
  return (
    <div
      data-slot="command-group"
      className={cn("overflow-hidden p-1 text-slate-200", className)}
      {...props}
    >
      {heading && <div className="px-2 py-1.5 text-xs font-medium text-slate-500">{heading}</div>}
      {children}
    </div>
  )
}

function CommandItem({
  children,
  className,
  onSelect,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }) {
  return (
    <div
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-700/50 hover:text-white data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      onClick={() => onSelect?.()}
      {...props}
    >
      {children}
    </div>
  )
}

export { Command, CommandInput, CommandList, CommandGroup, CommandItem }
