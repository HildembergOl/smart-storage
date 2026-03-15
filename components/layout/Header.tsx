"use client";

import { Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";
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

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  notificationCount?: number;
}

export function Header({
  userName = "Usuário",
  userEmail = "usuario@empresa.com",
  notificationCount = 3,
}: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-slate-700/50 bg-[#0F172A]/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-slate-400 text-sm font-semibold">
            Smart Storage
          </span>
          <span className="text-slate-600">/</span>
        </div>
        <Breadcrumb />
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
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
                className="flex items-center gap-2 px-3 py-2 h-auto rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 transition-all cursor-pointer outline-none"
                id="user-menu-btn"
              />
            }
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-sky-500 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-slate-200 text-xs font-medium leading-none">
                {userName}
              </span>
              <span className="text-slate-500 text-[10px] leading-none mt-0.5 truncate max-w-[120px]">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-slate-800 border-slate-700 text-slate-200"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-slate-400 text-xs">
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer gap-2">
                <User className="w-4 h-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                className="hover:bg-red-500/20 text-red-400 cursor-pointer gap-2"
                id="logout-btn"
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
