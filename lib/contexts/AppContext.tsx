"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface EnterpriseOption {
  userEnterpriseId: string;
  enterpriseId: string;
  publicCode: string;
  legalName: string;
  tradeName: string | null;
  status: string;
}

export interface TenantOption {
  userTenantId: string;
  tenantId: string;
  publicCode: string | null;
  legalName: string;
  tradeName: string | null;
}

export interface AppContextValue {
  // User
  userId: string;
  email: string;
  name: string;
  phone: string;
  jobTitle: string;
  avatarUrl: string;
  // Enterprise (currently selected)
  enterprises: EnterpriseOption[];
  currentEnterprise: EnterpriseOption | null;
  selectEnterprise: (enterpriseId: string) => void;
  // Tenant (optional — for stock filtering)
  tenant: TenantOption | null;
  // Shorthand helpers
  enterpriseId: string;        // currentEnterprise.enterpriseId
  enterprisePublicCode: string; // currentEnterprise.publicCode
  enterpriseName: string;       // currentEnterprise.legalName
  tenantId: string | null;      // tenant?.tenantId — null = no filter
  // Loading state
  loading: boolean;
  ready: boolean;
  refreshMe: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [enterprises, setEnterprises] = useState<EnterpriseOption[]>([]);
  const [currentEnterprise, setCurrentEnterprise] = useState<EnterpriseOption | null>(null);
  const [tenant, setTenant] = useState<TenantOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) return;
      const data = await res.json();

      setUserId(data.userId || "");
      setEmail(data.email || "");
      setName(data.name || "");
      setPhone(data.phone || "");
      setJobTitle(data.jobTitle || "");
      setAvatarUrl(data.avatarUrl || "");
      
      setEnterprises(data.enterprises || []);
      setTenant(data.tenant || null);

      // Set first enterprise as default (or restore from sessionStorage)
      const saved = sessionStorage.getItem("currentEnterpriseId");
      const first = (data.enterprises as EnterpriseOption[]).find(
        (e) => e.enterpriseId === saved,
      ) || data.enterprises[0] || null;

      setCurrentEnterprise(first);
      if (first) sessionStorage.setItem("currentEnterpriseId", first.enterpriseId);
      setReady(true);
    } catch {
      // Auth errors are handled by middleware
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const selectEnterprise = useCallback((enterpriseId: string) => {
    const selected = enterprises.find((e) => e.enterpriseId === enterpriseId) || null;
    setCurrentEnterprise(selected);
    if (selected) sessionStorage.setItem("currentEnterpriseId", selected.enterpriseId);
  }, [enterprises]);

  const value: AppContextValue = {
    userId,
    email,
    name,
    phone,
    jobTitle,
    avatarUrl,
    enterprises,
    currentEnterprise,
    selectEnterprise,
    tenant,
    enterpriseId: currentEnterprise?.enterpriseId || "",
    enterprisePublicCode: currentEnterprise?.publicCode || "",
    enterpriseName: currentEnterprise?.legalName || "",
    tenantId: tenant?.tenantId || null,
    loading,
    ready,
    refreshMe: loadMe,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
