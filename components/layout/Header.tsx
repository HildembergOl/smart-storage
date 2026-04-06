"use client";

import {
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Building2,
  Check,
  Component,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/contexts/AppContext";
import { createClient } from "@/lib/supabase-client";

interface HeaderProps {
  notificationCount?: number;
}

export function Header({ notificationCount = 3 }: HeaderProps) {
  const router = useRouter();
  const {
    email,
    enterpriseName,
    enterprises,
    currentEnterprise,
    selectEnterprise,
  } = useApp();
  const supabase = createClient();

  const initials = (email || "U").toUpperCase().slice(0, 2);

  const handleClickLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="dashboard-header h-16 border-b border-slate-700/50 dark:border-slate-700/50 dark:bg-[#0F172A]/80 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 transition-colors duration-200">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-500" />
          <span className="text-slate-400 text-sm font-semibold truncate max-w-[150px]">
            {enterpriseName || "Smart Storage"}
          </span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
        </div>
        <Breadcrumb />
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
          id="notifications-btn"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-sky-500 text-white border-0 rounded-full">
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex items-center gap-2 px-3 py-2 h-auto rounded-md bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/50 transition-all cursor-pointer outline-none"
                id="user-menu-btn"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-sky-500 text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start min-w-0">
                  <span className="text-slate-700 dark:text-slate-200 text-xs font-medium leading-none truncate max-w-[120px]">
                    {email}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] leading-none mt-0.5 truncate max-w-[120px]">
                    {enterpriseName}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center justify-between gap-2 text-slate-400 text-xs">
                <Component className="w-3.5 h-3.5 text-slate-400" /> Empresas
                Disponíveis <Component className="w-3.5 h-3.5 text-slate-400" />
              </DropdownMenuLabel>
              {enterprises.map((ent) => (
                <DropdownMenuItem
                  key={ent.enterpriseId}
                  className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                  onClick={() => selectEnterprise(ent.enterpriseId)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span
                      className={
                        ent.enterpriseId === currentEnterprise?.enterpriseId
                          ? "text-sky-500 font-medium"
                          : ""
                      }
                    >
                      {ent.legalName}
                    </span>
                  </div>
                  {ent.enterpriseId === currentEnterprise?.enterpriseId && (
                    <Check className="w-3.5 h-3.5 text-sky-500" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuLabel className="text-slate-400 text-xs">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer gap-2"
                onClick={() => router.push("/perfil")}
              >
                <User className="w-4 h-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer gap-2"
                onClick={() => router.push("/configuracoes")}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                className="hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 cursor-pointer gap-2"
                onClick={handleClickLogout}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
