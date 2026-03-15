import type { Metadata } from "next";
//import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/
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
    <html lang="pt-BR" className="dark">
      <body
        className={
          `antialiased bg-[#0F172A] text-slate-200`
          // ${geistSans.variable} ${geistMono.variable}
        }
      >
        {children}
      </body>
    </html>
  );
}
