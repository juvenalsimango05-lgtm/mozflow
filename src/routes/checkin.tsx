import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gift } from "lucide-react";

export const Route = createFileRoute("/checkin")({ component: CheckinPage });

function CheckinPage() {
  const { profile, refresh } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [setting, setSetting] = useState<{ reward: number; is_open: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from("checkin_settings").select("reward, is_open").eq("day", today).maybeSingle(),
      supabase.from("checkins").select("id").eq("user_id", profile.id).eq("day", today).maybeSingle(),
    ]);
    setSetting(s as any);
    setDone(!!c);
    setLoading(false);
  };
  useEffect(() => { load(); }, [profile]);

  const claim = async () => {
    if (!profile || !setting?.is_open) return;
    setClaiming(true);
    const { error } = await supabase.from("checkins").insert({ user_id: profile.id, day: today, reward: setting.reward });
    if (error) { toast.error(error.message); setClaiming(false); return; }
    await supabase.from("profiles").update({
      balance: Number(profile.balance) + Number(setting.reward),
      total_earnings: Number(profile.total_earnings) + Number(setting.reward),
    }).eq("id", profile.id);
    toast.success(`+${setting.reward} MZN!`);
    setClaiming(false); await refresh(); load();
  };

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">Pesquisa Diária</h1>
        <p className="text-sm text-muted-foreground">Faça check-in todos os dias para ganhar recompensas.</p>

        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
          <Gift className="size-16 mx-auto text-primary" />
          {loading ? (
            <div className="mt-4 text-muted-foreground">A carregar...</div>
          ) : !setting || !setting.is_open ? (
            <div className="mt-4">
              <div className="text-lg font-bold">Pesquisa fechada</div>
              <div className="text-sm text-muted-foreground">Volte amanhã.</div>
            </div>
          ) : done ? (
            <div className="mt-4">
              <div className="text-lg font-bold text-success">Já reivindicado hoje ✓</div>
              <div className="text-sm text-muted-foreground">Volte amanhã para ganhar mais.</div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="text-3xl font-bold text-success">+{setting.reward} MZN</div>
              <div className="text-sm text-muted-foreground mt-1">Recompensa de hoje</div>
              <Button onClick={claim} disabled={claiming} className="mt-4 w-full rounded-full" style={{ background: "var(--gradient-primary)" }}>
                {claiming ? "..." : "Receber"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
