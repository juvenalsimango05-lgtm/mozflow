import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 9) {
      toast.error("O número de telefone deve ter exatamente 9 dígitos.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, `${cleanPhone}@mozflow.app`, password);
      toast.success("Bem-vindo!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Número ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10">
      <MozFlowLogo className="text-2xl mx-auto mb-12" />
      <h1 className="text-3xl font-bold mb-8">Entrar</h1>
      <form onSubmit={submit} className="space-y-4">
        <Input placeholder="Número de telefone (9 dígitos)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" maxLength={9} className="h-14 rounded-xl bg-card border-0" />
        <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-xl bg-card border-0" />
        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full text-base font-semibold mt-4" style={{ background: "var(--gradient-primary)" }}>
          {loading ? "A entrar..." : "ENTRAR"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-8">
        Ainda não tem conta? <Link to="/register" search={{ ref: "" }} className="text-warning font-semibold">Registar</Link>
      </p>
    </div>
  );
}