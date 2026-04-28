import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, BarChart3, ArrowDownUp, Receipt, Share2, LogOut, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

interface Plan {
  id: string; code: string; name: string; price: number;
  daily_return: number; duration_days: number; net_profit: number;
}

function Dashboard() {
  const { profile, signOut, refresh } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investing, setInvesting] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      setPlans((data as Plan[]) ?? []);
    });
  }, []);

  const masked = profile ? `+258 ${profile.phone.slice(0, 5)}***${profile.phone.slice(-2)}` : "";

  const invest = async (plan: Plan) => {
    if (!profile) return;
    if (Number(profile.balance) < Number(plan.price)) {
      toast.error("Saldo insuficiente. Faça um depósito primeiro.");
      return;
    }
    setInvesting(plan.id);
    const end = new Date(); end.setDate(end.getDate() + plan.duration_days);
    const { error } = await supabase.from("investments").insert({
      user_id: profile.id, plan_id: plan.id, plan_code: plan.code,
      amount: plan.price, daily_return: plan.daily_return,
      duration_days: plan.duration_days,
      total_return: Number(plan.daily_return) * plan.duration_days,
      end_date: end.toISOString(),
    });
    if (error) { toast.error(error.message); setInvesting(null); return; }
    await supabase.from("profiles").update({
      balance: Number(profile.balance) - Number(plan.price),
      last_plan: plan.code,
    }).eq("id", profile.id);
    await refresh();
    setInvesting(null);
    toast.success(`Investimento ${plan.code} ativado!`);
  };

  const copyRef = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referral_code);
    toast.success("Código copiado");
  };

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-4">
        {/* Profile card */}
        <div className="rounded-2xl p-5" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {profile?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 text-center">
              <div className="font-bold text-lg">{profile?.name}</div>
              <div className="text-sm text-muted-foreground">{masked}</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button onClick={copyRef} className="flex items-center gap-1 text-primary text-sm font-mono">
              {profile?.referral_code} <Copy className="size-3" />
            </button>
            <div className="flex gap-2">
              <Link to="/deposit"><Button size="sm" className="rounded-full px-5" style={{ background: "var(--gradient-primary)" }}>DEPÓSITO</Button></Link>
              <Link to="/withdraw"><Button size="sm" className="rounded-full px-5" style={{ background: "var(--gradient-primary)" }}>LEVANTAR</Button></Link>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "DEPÓSITO", v: profile?.total_deposit },
            { l: "SALDO", v: profile?.balance },
            { l: "GANHOS", v: profile?.total_earnings },
          ].map((s) => (
            <div key={s.l} className="rounded-xl p-3 bg-card text-center">
              <div className="text-[10px] text-muted-foreground">{s.l}</div>
              <div className="text-success font-bold mt-1 text-sm">{Number(s.v ?? 0).toFixed(2)} MZN</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl p-3 bg-card text-center">
            <div className="text-[10px] text-muted-foreground">ÚLTIMO PLANO</div>
            <div className="text-success font-bold mt-1 text-sm">{profile?.last_plan ?? "Nenhum"}</div>
          </div>
          <div className="rounded-xl p-3 bg-card text-center">
            <div className="text-[10px] text-muted-foreground">RECEITA TOTAL</div>
            <div className="text-success font-bold mt-1 text-sm">{Number(profile?.total_earnings ?? 0).toFixed(2)} MZN</div>
          </div>
          <div className="rounded-xl p-3 bg-card text-center">
            <div className="text-[10px] text-muted-foreground">CONVITE</div>
            <div className="text-success font-bold mt-1 text-sm">{Number(profile?.referral_earnings ?? 0).toFixed(2)} MZN</div>
          </div>
        </div>

        {/* Menu */}
        <div className="rounded-2xl bg-card divide-y divide-border/50">
          {[
            { i: BarChart3, l: "Depósito Transações", to: "/transactions" },
            { i: ArrowDownUp, l: "Retiradas Transações", to: "/transactions" },
            { i: Receipt, l: "Histórico de Investimentos", to: "/transactions" },
            { i: Share2, l: "Convidar com Código", to: "/referral" },
          ].map(({ i: I, l, to }) => (
            <Link key={l} to={to} className="flex items-center gap-3 px-4 py-4">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center"><I className="size-5" /></div>
              <div className="flex-1 font-semibold">{l}</div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          ))}
          <button onClick={signOut} className="flex items-center gap-3 px-4 py-4 w-full text-left">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center"><LogOut className="size-5" /></div>
            <div className="flex-1 font-semibold">Terminar sessão</div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
        </div>

        {/* Plans */}
        <div className="pt-2">
          <h2 className="text-xl font-bold mb-3 px-1">Planos de Investimento</h2>
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="rounded-2xl p-4 flex gap-4" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
                <div className="size-24 rounded-xl bg-white flex items-center justify-center text-3xl font-bold text-foreground">
                  🚗
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">{p.code}</div>
                  <div className="text-sm space-y-0.5 mt-1">
                    <div><span className="text-muted-foreground">PREÇO:</span> <span className="font-semibold">{Number(p.price)} MZN</span></div>
                    <div><span className="text-muted-foreground">DURAÇÃO:</span> <span className="font-semibold">{p.duration_days} DIAS</span></div>
                    <div><span className="text-muted-foreground">LUCRO:</span> <span className="font-semibold text-success">{Number(p.net_profit)} MZN</span></div>
                  </div>
                  <Button size="sm" className="mt-2 rounded-full w-full" disabled={investing === p.id} onClick={() => invest(p)} style={{ background: "var(--gradient-primary)" }}>
                    <Plus className="size-4 mr-1" /> {investing === p.id ? "..." : "Investir"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}