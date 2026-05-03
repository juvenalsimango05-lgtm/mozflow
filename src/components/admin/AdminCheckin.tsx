import { useEffect, useState } from "react";
import { db, doc, getDoc, setDoc, queryDocs } from "@/lib/firestore-helpers";
import { where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminCheckin() {
  const today = new Date().toISOString().slice(0, 10);
  const [day, setDay] = useState(today);
  const [reward, setReward] = useState("10");
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(0);

  const load = async (d: string) => {
    setLoading(true);
    const [sSnap, checkins] = await Promise.all([
      getDoc(doc(db, "checkin_settings", d)),
      queryDocs("checkins", where("day", "==", d)),
    ]);
    if (sSnap.exists()) { const s = sSnap.data(); setReward(String(s.reward)); setIsOpen(s.is_open); }
    else { setReward("10"); setIsOpen(true); }
    setClaimed(checkins.length);
    setLoading(false);
  };
  useEffect(() => { load(day); }, [day]);

  const save = async () => {
    const r = Math.max(0, Number(reward) || 0);
    await setDoc(doc(db, "checkin_settings", day), { day, reward: r, is_open: isOpen, updated_at: new Date().toISOString() });
    toast.success("Pesquisa do dia guardada");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 bg-card space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Dia</label>
          <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="bg-muted border-0" />
        </div>
        {loading ? <div className="text-sm text-muted-foreground">A carregar...</div> : (
          <>
            <div>
              <label className="text-xs text-muted-foreground">Recompensa (MZN)</label>
              <Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} className="bg-muted border-0" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
              Aceitar pesquisa hoje
            </label>
            <div className="text-xs text-muted-foreground">Reivindicações neste dia: <span className="font-bold text-foreground">{claimed}</span></div>
            <Button size="sm" onClick={save} className="w-full">Guardar</Button>
          </>
        )}
      </div>
    </div>
  );
}
