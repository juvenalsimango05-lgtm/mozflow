import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ensureProfile } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MozFlowLogo } from "@/components/MozFlowLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({ ref: (s.ref as string) || "" }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { ref } = useSearch({ from: "/register" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState(ref);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (!name.trim() || password.length < 6) {
      toast.error("Preencha todos os campos. Senha mínima 6 caracteres.");
      return;
    }
    if (cleanPhone.length !== 9) {
      toast.error("O número de telefone deve ter exatamente 9 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, `${cleanPhone}@mozflow.app`, password);
      await ensureProfile(cred.user.uid, { name: name.trim(), phone: cleanPhone, referral_code_used: referral.trim() });
      toast.success("Conta criada com sucesso!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err?.code === "auth/email-already-in-use" ? "Número já registado" : (err?.message ?? "Erro"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-10">
      <MozFlowLogo className="text-2xl mx-auto mb-12" />
      <h1 className="text-3xl font-bold mb-8">Criar uma conta</h1>
      <form onSubmit={submit} className="space-y-4">
        <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className="h-14 rounded-xl bg-card border-0" />
        <Input placeholder="Número de telefone (9 dígitos)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} inputMode="numeric" maxLength={9} className="h-14 rounded-xl bg-card border-0" />
        <Input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 rounded-xl bg-card border-0" />
        <Input placeholder="Código de convite (opcional)" value={referral} onChange={(e) => setReferral(e.target.value)} className="h-14 rounded-xl bg-card border-0" />
        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full text-base font-semibold mt-4" style={{ background: "var(--gradient-primary)" }}>
          {loading ? "A registar..." : "REGISTAR"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-8">
        Já tem uma conta? <Link to="/login" className="text-warning font-semibold">Entrar</Link>
      </p>
    </div>
  );
}