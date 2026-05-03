import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [minAmt, setMinAmt] = useState(50);
  const [maxAmt, setMaxAmt] = useState(100000);
  const [investCount, setInvestCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("app_settings").select("key,value").in("key", ["withdraw_min", "withdraw_max"]).then(({ data }) => {
      const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
      if (m.withdraw_min) setMinAmt(Number(m.withdraw_min) || 50);
      if (m.withdraw_max) setMaxAmt(Number(m.withdraw_max) || 100000);
    });
    if (user) {
      supabase.from("investments").select("id", { count: "exact", head: true }).eq("user_id", user.id).then(({ count }) => {
        setInvestCount(count ?? 0);
      });
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    const amt = Number(amount);
    if (!amt || amt < minAmt) { toast.error(`Mínimo: ${minAmt} MZN`); return; }
    if (amt > maxAmt) { toast.error(`Máximo: ${maxAmt} MZN`); return; }
    if (amt > Number(profile.balance)) { toast.error("Saldo insuficiente"); return; }
    if (!phone.trim()) { toast.error("Indique o número de destino"); return; }
    if ((investCount ?? 0) < 2) { toast.error("Precisa aderir a pelo menos 2 planos antes de levantar."); return; }
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
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" inputMode="numeric" placeholder={String(minAmt)} className="h-14 rounded-xl bg-card border-0 text-lg" />
          <p className="text-xs text-muted-foreground">Min: {minAmt} MZN • Max: {maxAmt} MZN</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-14 rounded-full text-base font-semibold" style={{ background: "var(--gradient-primary)" }}>
          {loading ? "A enviar..." : "Confirmar"}
        </Button>
      </form>
    </AppShell>
  );
}