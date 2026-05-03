import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { queryDocs, getSetting, addDoc, collection, db, doc, updateDoc } from "@/lib/firestore-helpers";
import { where, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/roulette")({ component: RoulettePage });

interface Prize { id: string; label: string; amount: number; probability: number; slot_index: number; }

const COLORS = ["#7c3aed", "#06b6d4", "#a855f7", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

function RoulettePage() {
  const { profile, refresh } = useAuth();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [maxFree, setMaxFree] = useState(1);
  const [used, setUsed] = useState(0);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [last, setLast] = useState<Prize | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!profile) return;
    const today = new Date().toISOString().slice(0, 10);
    const [p, sv, spins] = await Promise.all([
      queryDocs<Prize>("roulette_prizes", orderBy("slot_index")),
      getSetting("roulette_free_spins_per_day"),
      queryDocs("roulette_spins", where("user_id", "==", profile.id), where("spun_on", "==", today)),
    ]);
    setPrizes(p);
    setMaxFree(sv ? parseInt(sv) || 0 : 1);
    setUsed(spins.length);
  };
  useEffect(() => { load(); }, [profile]);

  const remaining = Math.max(0, maxFree - used);

  const spin = async () => {
    if (!profile || prizes.length === 0 || spinning) return;
    if (remaining <= 0) return toast.error("Sem voltas grátis hoje");
    setSpinning(true); setLast(null);
    const total = prizes.reduce((s, p) => s + Number(p.probability), 0);
    let r = Math.random() * total;
    let winner = prizes[0];
    for (const p of prizes) { r -= Number(p.probability); if (r <= 0) { winner = p; break; } }

    const slice = 360 / prizes.length;
    // Pointer is at top (12h = -90deg). conic-gradient starts at top by default in this layout,
    // so to bring slot center under the pointer we rotate by -(center) plus full spins.
    const center = winner.slot_index * slice + slice / 2;
    // keep monotonic increase across spins so animation always rotates forward
    const base = Math.ceil(angle / 360) * 360;
    const target = base + 360 * 6 + (360 - center);
    setAngle(target);

    setTimeout(async () => {
      await addDoc(collection(db, "roulette_spins"), { user_id: profile.id, prize_id: winner.id, amount: winner.amount, spun_on: new Date().toISOString().slice(0, 10), created_at: new Date().toISOString() });
      if (Number(winner.amount) > 0) {
        await updateDoc(doc(db, "profiles", profile.id), {
          balance: Number(profile.balance) + Number(winner.amount),
          total_earnings: Number(profile.total_earnings) + Number(winner.amount),
        });
      }
      setLast(winner); setSpinning(false);
      await refresh(); load();
    }, 4200);
  };

  const slice = prizes.length ? 360 / prizes.length : 45;

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-5">
        <h1 className="text-2xl font-bold text-center">Roleta</h1>
        <p className="text-center text-sm text-muted-foreground">Voltas grátis hoje: <span className="text-success font-bold">{remaining}</span> / {maxFree}</p>

        <div className="relative mx-auto" style={{ width: 300, height: 300 }}>
          {/* Pointer / indicator at top */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 size-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            style={{
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderTop: "28px solid hsl(var(--primary))",
            }}
          />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 size-3 rounded-full bg-primary border-2 border-background" />
          <div
            ref={wheelRef}
            className="size-full rounded-full overflow-hidden border-4 border-primary/60 shadow-[0_0_30px_rgba(124,58,237,0.4)]"
            style={{
              transition: spinning ? "transform 4s cubic-bezier(.17,.67,.21,.99)" : "none",
              transform: `rotate(${angle}deg)`,
              background: prizes.length
                ? `conic-gradient(from -${slice / 2}deg, ${prizes.map((_, i) => `${COLORS[i % 8]} ${i * slice}deg ${(i + 1) * slice}deg`).join(",")})`
                : "var(--gradient-card)",
            }}
          >
            {prizes.map((p, i) => (
              <div
                key={p.id}
                className="absolute top-1/2 left-1/2 origin-left text-white font-bold text-xs"
                style={{ transform: `rotate(${i * slice}deg) translateX(60px)` }}
              >
                {p.label}
              </div>
            ))}
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full bg-card flex items-center justify-center font-bold text-xs border-4 border-primary">SPIN</div>
        </div>

        <Button onClick={spin} disabled={spinning || remaining <= 0} className="w-full rounded-full" style={{ background: "var(--gradient-primary)" }}>
          {spinning ? "A girar..." : remaining > 0 ? "Girar" : "Sem voltas"}
        </Button>

        {last && (
          <div className="rounded-2xl p-5 bg-card text-center animate-scale-in border-2 border-primary/40">
            <div className="text-sm text-muted-foreground">A roleta parou em</div>
            <div className="text-3xl font-bold text-success mt-1">{last.label}</div>
            {Number(last.amount) > 0
              ? <div className="text-xs text-muted-foreground mt-1">Creditado no seu saldo</div>
              : <div className="text-xs text-muted-foreground mt-1">Boa sorte na próxima!</div>}
          </div>
        )}
      </div>
    </AppShell>
  );
}
