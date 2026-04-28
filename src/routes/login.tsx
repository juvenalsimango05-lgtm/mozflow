import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MozFlowLogo } from "@/components/MozFlowLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanPhone = phone.replace(/\s+/g, "");
    const { error } = await supabase.auth.signInWithPassword({
      email: `${cleanPhone}@mozflow.app`,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error("Número ou senha incorretos");
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10">
      <MozFlowLogo className="text-2xl mx-auto mb-12" />
      <h1 className="text-3xl font-bold mb-8">Entrar</h1>
      <form onSubmit={submit} className="space-y-4">
        <Input placeholder="Número de telefone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="h-14 rounded-xl bg-card border-0" />
        <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-xl bg-card border-0" />
        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full text-base font-semibold mt-4" style={{ background: "var(--gradient-primary)" }}>
          {loading ? "A entrar..." : "ENTRAR"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-8">
        Ainda não tem conta? <Link to="/register" className="text-warning font-semibold">Registar</Link>
      </p>
    </div>
  );
}