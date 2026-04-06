import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BreadcrumbProvider } from "@/lib/contexts/BreadcrumbContext";
import { AppProvider } from "@/lib/contexts/AppContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <BreadcrumbProvider>
        <div className="flex h-screen bg-[#f0f4f8] dark:bg-[#0F172A] overflow-hidden transition-colors duration-200">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="dashboard-main flex-1 overflow-y-auto p-4 md:p-6 bg-[#f0f4f8] dark:bg-[#0F172A] transition-colors duration-200">
              {children}
            </main>
          </div>
        </div>
      </BreadcrumbProvider>
    </AppProvider>
  );
}

