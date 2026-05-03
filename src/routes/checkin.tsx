import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { db, doc, getDoc, addDoc, updateDoc, collection, queryDocs } from "@/lib/firestore-helpers";
import { where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gift } from "lucide-react";

export const Route = createFileRoute("/checkin")({ component: CheckinPage });

function CheckinPage() {
  const { profile, refresh } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const DEFAULT_REWARD = 10;
  const [reward, setReward] = useState(DEFAULT_REWARD);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    const [settSnap, checkins] = await Promise.all([
      getDoc(doc(db, "checkin_settings", today)),
      queryDocs("checkins", where("user_id", "==", profile.id), where("day", "==", today)),
    ]);
    setReward(settSnap.exists() ? Number(settSnap.data().reward) : DEFAULT_REWARD);
    setDone(checkins.length > 0);
    setLoading(false);
  };
  useEffect(() => { load(); }, [profile]);

  const claim = async () => {
    if (!profile) return;
    setClaiming(true);
    try {
      await addDoc(collection(db, "checkins"), { user_id: profile.id, day: today, reward, created_at: new Date().toISOString() });
      await updateDoc(doc(db, "profiles", profile.id), {
        balance: Number(profile.balance) + reward,
        total_earnings: Number(profile.total_earnings) + reward,
      });
      toast.success(`+${reward} MZN!`);
      await refresh(); load();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro");
    } finally {
      setClaiming(false);
    }
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
          ) : done ? (
            <div className="mt-4">
              <div className="text-lg font-bold text-success">Já reivindicado hoje ✓</div>
              <div className="text-sm text-muted-foreground">Volte amanhã para ganhar mais.</div>
            </div>
          ) : (
            <div className="mt-4">
              <div className="text-3xl font-bold text-success">+{reward} MZN</div>
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
