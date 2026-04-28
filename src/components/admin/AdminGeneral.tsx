import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AdminGeneral() {
  const [reward, setReward] = useState("");
  const [maintEnabled, setMaintEnabled] = useState(false);
  const [maintMsg, setMaintMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("app_settings").select("key,value")
      .in("key", ["referral_reward", "maintenance_enabled", "maintenance_message"])
      .then(({ data }) => {
        const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
        setReward(m.referral_reward ?? "0");
        setMaintEnabled(m.maintenance_enabled === "true");
        setMaintMsg(m.maintenance_message ?? "");
        setLoading(false);
      });
  }, []);

  const save = async (key: string, value: string) => {
    const { error } = await supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
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
