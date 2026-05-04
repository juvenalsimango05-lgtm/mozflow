import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MozFlowLogo } from "@/components/MozFlowLogo";
import { useAuth } from "@/lib/auth-context";
import { Infinity as InfIcon, Clock, CalendarDays, ShieldCheck, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <MozFlowLogo className="text-2xl" />
        <div className="flex gap-2">
          <Link to="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link to="/register" search={{ ref: "" }}><Button size="sm">Registar</Button></Link>
        </div>
      </header>

      <section className="px-5 pt-10 pb-12 max-w-2xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          Depósitos e<br />
          levantamentos<br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-brand)" }}>24/24. Sem limites.</span>
        </h1>
        <p className="mt-5 text-muted-foreground">
          Invista o valor que quiser e receba retornos automáticos. Disponível todos os dias, a qualquer hora.
        </p>
        <div className="mt-7 flex gap-3 justify-center">
          <Link to="/register" search={{ ref: "" }}><Button size="lg" className="rounded-full px-8">Começar agora</Button></Link>
          <Link to="/login"><Button size="lg" variant="outline" className="rounded-full px-8">Já tenho conta</Button></Link>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Wallet, t: "Invista o valor", s: "Escolha o plano e invista" },
            { icon: TrendingUp, t: "Receba retornos", s: "Cai automático na conta" },
            { icon: ShieldCheck, t: "Seguro", s: "Pagamento verificado" },
          ].map(({ icon: I, t, s }) => (
            <div key={t} className="rounded-2xl p-5 border border-border/50 text-left" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
              <div className="size-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--gradient-primary)" }}>
                <I className="size-5 text-primary-foreground" />
              </div>
              <div className="font-semibold">{t}</div>
              <div className="text-sm text-muted-foreground mt-1">{s}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-muted-foreground py-6 border-t border-border/50">
        © {new Date().getFullYear()} MozFlow. Todos os direitos reservados.
      </footer>
    </div>
  );
}
