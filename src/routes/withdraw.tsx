import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/withdraw")({ component: WithdrawPage });

const METHODS = ["M-Pesa", "E-Mola", "M-Kesh"];

function WithdrawPage() {
  const { user, profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState("M-Pesa");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    const amt = Number(amount);
    if (!amt || amt < 50) { toast.error("Mínimo: 50 MZN"); return; }
    if (amt > Number(profile.balance)) { toast.error("Saldo insuficiente"); return; }
    if (!phone.trim()) { toast.error("Indique o número de destino"); return; }
    setLoading(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id, amount: amt, method,
      destination_phone: phone.replace(/\s+/g, ""),
    });
    if (!error) {
      await supabase.from("profiles").update({ balance: Number(profile.balance) - amt }).eq("id", user.id);
      await refresh();
    }
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Pedido enviado! Aguarde aprovação.");
    navigate({ to: "/transactions" });
  };

  return (
    <AppShell>
      <form onSubmit={submit} className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl p-4 bg-card">
          <div className="text-xs text-muted-foreground">Saldo disponível</div>
          <div className="text-2xl font-bold text-success mt-1">{Number(profile?.balance ?? 0).toFixed(2)} MZN</div>
        </div>

        <div className="space-y-2">
          <Label>Método de levantamento</Label>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button type="button" key={m} onClick={() => setMethod(m)}
                className={`h-12 rounded-xl font-semibold text-sm ${method === m ? "ring-2 ring-primary" : ""}`}
                style={method === m ? { background: "var(--gradient-primary)" } : { background: "var(--card)" }}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Número de destino</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="84xxxxxxx" className="h-14 rounded-xl bg-card border-0" />
        </div>
        <div className="space-y-2">
          <Label>Valor a levantar (MZN)</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" inputMode="numeric" placeholder="600" className="h-14 rounded-xl bg-card border-0 text-lg" />
        </div>

        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full text-base font-semibold" style={{ background: "var(--gradient-primary)" }}>
          {loading ? "A enviar..." : "Confirmar"}
        </Button>
      </form>
    </AppShell>
  );
}