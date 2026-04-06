import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Smart Storage | Gestão de Armazenagem",
  description:
    "Sistema moderno de controle de armazenagem de produtos. Gerencie estoques, entradas, saídas e finanças com eficiência.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
