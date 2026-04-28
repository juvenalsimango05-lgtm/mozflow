import { type ReactNode, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { MozFlowLogo } from "@/components/MozFlowLogo";
import { Home, Wallet, ArrowDownToLine, Users, Shield, User } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">A carregar...</div>;
  }

  const items = [
    { to: "/dashboard", icon: Home, label: "Início" },
    { to: "/deposit", icon: Wallet, label: "Depósito" },
    { to: "/withdraw", icon: ArrowDownToLine, label: "Levantar" },
    { to: "/referral", icon: Users, label: "Convite" },
    { to: "/account", icon: User, label: "Conta" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur z-20">
        <Link to="/dashboard"><MozFlowLogo className="text-xl" /></Link>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-xs text-warning font-semibold">
              <Shield className="size-4" /> Admin
            </Link>
          )}
          <Link to="/account" aria-label="Conta" className="size-9 rounded-full bg-card flex items-center justify-center border border-border/50">
            <User className="size-5" />
          </Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card/95 backdrop-blur z-30">
        <div className="max-w-xl mx-auto grid grid-cols-5">
          {items.map(({ to, icon: I, label }) => {
            const active = path === to;
            return (
              <Link key={to} to={to} className={`flex flex-col items-center gap-1 py-3 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                <I className="size-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}