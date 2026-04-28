import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Prize { id: string; label: string; amount: number; probability: number; slot_index: number; }

export function AdminRoulette() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [freeSpins, setFreeSpins] = useState("1");

  const load = async () => {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from("roulette_prizes").select("*").order("slot_index"),
      supabase.from("app_settings").select("value").eq("key", "roulette_free_spins_per_day").maybeSingle(),
    ]);
    setPrizes((p as Prize[]) ?? []);
    if (s) setFreeSpins(s.value);
  };
  useEffect(() => { load(); }, []);

  const update = async (p: Prize) => {
    const { error } = await supabase.from("roulette_prizes").update({ label: p.label, amount: p.amount, probability: p.probability }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Prémio guardado");
  };
  const saveSpins = async () => {
    const n = Math.max(0, parseInt(freeSpins) || 0);
    await supabase.from("app_settings").upsert({ key: "roulette_free_spins_per_day", value: String(n), updated_at: new Date().toISOString() });
    toast.success("Voltas grátis guardado");
  };
  const totalProb = prizes.reduce((s, p) => s + Number(p.probability), 0);

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 bg-card space-y-2">
        <div className="font-bold text-sm">Voltas grátis por dia</div>
        <div className="flex gap-2">
          <Input type="number" value={freeSpins} onChange={(e) => setFreeSpins(e.target.value)} className="bg-muted border-0" />
          <Button size="sm" onClick={saveSpins}>Guardar</Button>
        </div>
      </div>
      <div className={`text-xs px-2 ${Math.abs(totalProb - 100) > 0.01 ? "text-warning" : "text-success"}`}>
        Soma das probabilidades: {totalProb.toFixed(2)}% (deve ser 100%)
      </div>
      {prizes.map((p, i) => <PrizeRow key={p.id} prize={p} idx={i} onSave={(np) => { setPrizes(prev => prev.map(x => x.id === np.id ? np : x)); update(np); }} />)}
    </div>
  );
}

function PrizeRow({ prize, idx, onSave }: { prize: Prize; idx: number; onSave: (p: Prize) => void }) {
  const [f, setF] = useState(prize);
  useEffect(() => setF(prize), [prize]);
  return (
    <div className="rounded-xl p-3 bg-card space-y-2">
      <div className="text-xs font-bold text-muted-foreground">Slot {idx + 1}</div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <label>Label<Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} className="bg-muted border-0" maxLength={30} /></label>
        <label>Valor MZN<Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} className="bg-muted border-0" /></label>
        <label>Prob %<Input type="number" step="0.1" value={f.probability} onChange={(e) => setF({ ...f, probability: Number(e.target.value) })} className="bg-muted border-0" /></label>
      </div>
      <Button size="sm" onClick={() => onSave(f)} className="w-full">Guardar</Button>
    </div>
  );
}
