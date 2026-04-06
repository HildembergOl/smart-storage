"use client";

import { useState, SubmitEvent } from "react";
import { PackageOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("senha") as string;

    if (!email || !password) {
      return setLoading(false);
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(
        "Verifique suas credenciais, e-mail e senha",
      );
      return setLoading(false);
    }
    // Ensure User record exists in our DB (idempotent)
    await fetch("/api/me", { method: "POST" });
    router.push("/");
  };

  const handleRegister = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("senha") as string;

    if (!email || !password) {
      return setLoading(false);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(
        "Verifique suas credenciais, código de empresa, e-mail e senha",
      );
      return setLoading(false);
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-sm blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-sm blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-500/25">
            <PackageOpen className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Smart Storage
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestão de armazenagem inteligente
          </p>
        </div>

        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-0 pt-6 px-6">
              <TabsList className="w-full bg-slate-900/50 border border-slate-700/50">
                <TabsTrigger
                  value="login"
                  className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                  id="tab-login"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="cadastro"
                  className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-400"
                  id="tab-cadastro"
                >
                  Cadastro
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6 px-6 pb-8">
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-codigo"
                      className="text-slate-300 text-sm"
                    >
                      Código de Empresa
                    </Label>
                    <Input
                      id="login-codigo"
                      name="codigo"
                      placeholder="Ex: EMP001"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:ring-sky-500/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-slate-300 text-sm"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      name="email"
                      placeholder="seu@email.com"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="login-senha"
                        className="text-slate-300 text-sm"
                      >
                        Senha
                      </Label>
                      <button
                        type="button"
                        className="text-sky-400 text-xs hover:text-sky-300 transition-colors"
                        id="forgot-password-link"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-senha"
                        type={showPassword ? "text" : "password"}
                        name="senha"
                        placeholder="••••••••"
                        className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        id="toggle-password-btn"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold h-11 transition-all"
                    disabled={loading}
                    id="login-submit-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Entrar no sistema
                  </Button>
                </form>
              </TabsContent>

              {/* Cadastro Tab */}
              <TabsContent value="cadastro" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-codigo"
                      className="text-slate-300 text-sm"
                    >
                      Código da Empresa
                    </Label>
                    <Input
                      id="reg-codigo"
                      placeholder="Ex: EMP001"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-email"
                      className="text-slate-300 text-sm"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-senha"
                      className="text-slate-300 text-sm"
                    >
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold h-11 transition-all"
                    disabled={loading}
                    id="register-submit-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Criar conta
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-8">
          © {new Date().getFullYear()} Smart Storage. Todos os direitos
          reservados.
        </p>
      </div>
    </div>
  );
}
