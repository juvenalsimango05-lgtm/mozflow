import { useEffect, useState } from "react";
import { getSettings, saveSetting } from "@/lib/firestore-helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AdminGeneral() {
  const [reward, setReward] = useState("");
  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMsg, setMaintMsg] = useState("");
  const [depMin, setDepMin] = useState("");
  const [witMin, setWitMin] = useState("");
  const [witMax, setWitMax] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings(["referral_reward", "maintenance_enabled", "maintenance_message", "deposit_min", "withdraw_min", "withdraw_max"]).then(m => {
      setReward(m.referral_reward ?? "0");
      setMaintEnabled(m.maintenance_enabled === "true");
      setMaintMsg(m.maintenance_message ?? "");
      setDepMin(m.deposit_min ?? "50");
      setWitMin(m.withdraw_min ?? "50");
      setWitMax(m.withdraw_max ?? "100000");
      setLoading(false);
    });
  }, []);

  const save = async (key: string, value: string) => {
    await saveSetting(key, value);
    toast.success("Guardado");
  };

  if (loading) return <div className="text-sm text-muted-foreground">A carregar...</div>;

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 bg-card space-y-2">
        <div className="font-bold text-sm">Recompensa por convite (MZN)</div>
        <p className="text-xs text-muted-foreground">Valor que o convidador recebe quando convida alguém.</p>
        <Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} className="bg-muted border-0" />
        <Button size="sm" onClick={() => save("referral_reward", String(Number(reward) || 0))} className="w-full">Guardar</Button>
      </div>

      <div className="rounded-xl p-4 bg-card space-y-2">
        <div className="font-bold text-sm">Limites de depósito e levantamento (MZN)</div>
        <div>
          <label className="text-xs text-muted-foreground">Depósito mínimo</label>
          <Input type="number" value={depMin} onChange={(e) => setDepMin(e.target.value)} className="bg-muted border-0" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Levantamento mínimo</label>
          <Input type="number" value={witMin} onChange={(e) => setWitMin(e.target.value)} className="bg-muted border-0" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Levantamento máximo</label>
          <Input type="number" value={witMax} onChange={(e) => setWitMax(e.target.value)} className="bg-muted border-0" />
        </div>
        <Button size="sm" className="w-full" onClick={async () => {
          await save("deposit_min", String(Math.max(0, Number(depMin) || 0)));
          await save("withdraw_min", String(Math.max(0, Number(witMin) || 0)));
          await save("withdraw_max", String(Math.max(0, Number(witMax) || 0)));
        }}>Guardar limites</Button>
      </div>

      <div className="rounded-xl p-4 bg-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-sm">Manutenção da app</div>
            <p className="text-xs text-muted-foreground">Quando ativo, utilizadores não-admin veem ecrã de manutenção.</p>
          </div>
          <Switch checked={maintEnabled} onCheckedChange={(v) => { setMaintEnabled(v); save("maintenance_enabled", v ? "true" : "false"); }} />
        </div>
        <Textarea value={maintMsg} onChange={(e) => setMaintMsg(e.target.value)} placeholder="Mensagem de manutenção" className="bg-muted border-0" />
        <Button size="sm" onClick={() => save("maintenance_message", maintMsg)} className="w-full">Guardar mensagem</Button>
      </div>
    </div>
  );
}
