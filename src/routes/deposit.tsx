import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/deposit")({ component: DepositPage });

interface PayAcc { id: string; method: string; account_number: string; account_name: string | null; }

const methodColor: Record<string, string> = {
  "M-Pesa": "oklch(0.6 0.2 25 / 30%)",
  "E-Mola": "oklch(0.65 0.16 50 / 30%)",
  "M-Kesh": "oklch(0.6 0.18 290 / 30%)",
};

function DepositPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accs, setAccs] = useState<PayAcc[]>([]);
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [selected, setSelected] = useState<PayAcc | null>(null);
  const [amount, setAmount] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("payment_accounts").select("*").eq("is_active", true).then(({ data }) => {
      setAccs((data as PayAcc[]) ?? []);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !user) return;
    const amt = Number(amount);
    if (!amt || amt < 50) { toast.error("Valor mínimo: 50 MZN"); return; }
    if (!senderPhone.trim() || !txnId.trim()) { toast.error("Preencha número e ID da transação"); return; }
    setLoading(true);
    const { error } = await supabase.from("deposits").insert({
      user_id: user.id, amount: amt, method: selected.method,
      sender_phone: senderPhone.replace(/\s+/g, ""),
      transaction_id: txnId.trim(),
      receiving_account: selected.account_number,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Depósito enviado! Aguarde aprovação.");
    navigate({ to: "/transactions" });
  };

  if (step === "choose") {
    return (
      <AppShell>
        <div className="px-4 pt-4 space-y-3">
          <h1 className="text-xl font-bold mb-2">Escolha o método</h1>
          {accs.map((a) => (
            <div key={a.id} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
              <div className="size-16 rounded-2xl flex items-center justify-center font-bold text-sm" style={{ background: methodColor[a.method] || "var(--accent)" }}>
                {a.method}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{a.method}</div>
                <div className="text-sm text-muted-foreground">{a.account_number}</div>
              </div>
              <Button size="sm" className="rounded-full" onClick={() => { navigator.clipboard.writeText(a.account_number); toast.success("Copiado"); }}>
                <Copy className="size-4 mr-1" /> Copiar
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setSelected(a); setStep("form"); }}>
                Usar
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm text-success justify-center pt-3">
            <ShieldCheck className="size-4" /> Pagamento manual verificado
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <form onSubmit={submit} className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl p-4 bg-card">
          <div className="text-xs text-muted-foreground">Envie o valor para</div>
          <div className="text-lg font-bold mt-1">{selected?.method} • {selected?.account_number}</div>
          <div className="text-xs text-muted-foreground mt-1">Nome: {selected?.account_name}</div>
        </div>

        <div className="space-y-2">
          <Label>Valor depositado (MZN)</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" inputMode="numeric" placeholder="100" className="h-14 rounded-xl bg-card border-0 text-lg" />
        </div>
        <div className="space-y-2">
          <Label>Número que fez a transferência</Label>
          <Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} inputMode="tel" placeholder="84xxxxxxx" className="h-14 rounded-xl bg-card border-0" />
        </div>
        <div className="space-y-2">
          <Label>ID da transação (SMS de confirmação)</Label>
          <Input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="Ex: CG93.XXXX.YY" className="h-14 rounded-xl bg-card border-0" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1 h-12 rounded-full" onClick={() => setStep("choose")}>Voltar</Button>
          <Button type="submit" disabled={loading} className="flex-1 h-12 rounded-full" style={{ background: "var(--gradient-primary)" }}>
            {loading ? "A enviar..." : "Confirmar"}
          </Button>
        </div>
      </form>
    </AppShell>
  );
}