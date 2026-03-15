"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PackageOpen,
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navGroups = [
  {
    label: "MENU PRINCIPAL",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/" }],
  },
  {
    label: "CADASTROS",
    items: [
      { label: "Empresas", icon: Building2, href: "/empresas" },
      { label: "Produtos", icon: Package, href: "/produtos" },
      { label: "Pessoas", icon: Users, href: "/pessoas" },
    ],
  },
  {
    label: "CONSULTAS",
    items: [{ label: "Estoques", icon: Warehouse, href: "/estoques" }],
  },
  {
    label: "MOVIMENTAÇÕES",
    items: [
      { label: "Entradas", icon: ArrowDownToLine, href: "/entradas" },
      { label: "Saídas", icon: ArrowUpFromLine, href: "/saidas" },
    ],
  },
  {
    label: "FINANCEIRO",
    items: [
      { label: "Contas a Pagar", icon: CreditCard, href: "/financeiro/pagar" },
      { label: "Contas a Receber", icon: Wallet, href: "/financeiro/receber" },
    ],
  },
  {
    label: "SISTEMA",
    items: [{ label: "Configurações", icon: Settings, href: "/configuracoes" }],
  },
];

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group cursor-pointer",
          isActive
            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50",
        )}
        title={collapsed ? label : undefined}
      >
        <Icon
          className={cn(
            "shrink-0 transition-colors",
            collapsed ? "w-5 h-5" : "w-4 h-4",
            isActive ? "text-sky-400" : "group-hover:text-slate-200",
          )}
        />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{label}</span>
        )}
      </div>
    </Link>
  );
}

interface SidebarNavProps {
  collapsed?: boolean;
  onItemClick?: () => void;
}

function SidebarNav({ collapsed = false, onItemClick }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
      {navGroups.map((group, idx) => (
        <div key={idx} className={cn(idx > 0 && "mt-4")}>
          {!collapsed && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              {group.label}
            </p>
          )}
          {collapsed && idx > 0 && (
            <Separator className="my-2 bg-slate-700/50" />
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                collapsed={collapsed}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-[#1E293B] border-r border-slate-700/50 transition-all duration-300 shrink-0 h-screen sticky top-0",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-5 border-b border-slate-700/50",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
              <PackageOpen className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-lg tracking-tight">
                SmartStorage
              </span>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-slate-200 h-7 w-7"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        <SidebarNav collapsed={collapsed} />

        {collapsed && (
          <div className="p-2 border-t border-slate-700/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="w-full text-slate-400 hover:text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar using Sheet */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-lg w-9 h-9 bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-slate-200"
            id="mobile-menu-trigger"
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-[#1E293B] border-r border-slate-700/50"
            showCloseButton={false}
          >
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <PackageOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">SmartStorage</span>
            </div>
            <SidebarNav onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
