import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, BarChart3, ArrowDownUp, Receipt, Share2, LogOut, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { profile, signOut } = useAuth();
  const masked = profile ? `+258 ${profile.phone.slice(0, 5)}***${profile.phone.slice(-2)}` : "";

  const copyRef = () => {
    if (!profile) return;
    navigator.clipboard.writeText(profile.referral_code);
    toast.success("Código copiado");
  };

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-4">
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

        <div className="rounded-2xl bg-card divide-y divide-border/50">
          {[
            { i: BarChart3, l: "Depósito Transações", to: "/transactions" as const },
            { i: ArrowDownUp, l: "Retiradas Transações", to: "/transactions" as const },
            { i: Receipt, l: "Histórico de Investimentos", to: "/transactions" as const },
            { i: Share2, l: "Convidar com Código", to: "/referral" as const },
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
      </div>
    </AppShell>
  );
}
