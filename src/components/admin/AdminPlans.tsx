import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Plan {
  id: string; code: string; name: string; price: number;
  daily_return: number; duration_days: number; total_return: number;
  net_profit: number; sort_order: number; is_active: boolean;
}

export function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const load = () => supabase.from("plans").select("*").order("sort_order").then(({ data }) => setPlans((data as Plan[]) ?? []));
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Plan>) => {
    const { error } = await supabase.from("plans").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Plano atualizado"); load();
  };
  const create = async () => {
    const code = `T${plans.length + 1}`;
    const { error } = await supabase.from("plans").insert({
      code, name: `Plano ${code}`, price: 100, daily_return: 50,
      duration_days: 5, total_return: 250, net_profit: 150,
      sort_order: plans.length + 1, is_active: true,
    });
    if (error) return toast.error(error.message);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Eliminar plano?")) return;
    await supabase.from("plans").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={create} className="w-full">+ Novo plano</Button>
      {plans.map((p) => <PlanRow key={p.id} plan={p} onSave={update} onDelete={remove} />)}
    </div>
  );
}

function PlanRow({ plan, onSave, onDelete }: { plan: Plan; onSave: (id: string, p: Partial<Plan>) => void; onDelete: (id: string) => void }) {
  const [f, setF] = useState(plan);
  useEffect(() => setF(plan), [plan]);
  const set = (k: keyof Plan, v: any) => setF({ ...f, [k]: v });

  return (
    <div className="rounded-xl p-4 bg-card space-y-2">
      <div className="flex items-center justify-between">
        <Input value={f.code} onChange={(e) => set("code", e.target.value)} className="bg-muted border-0 w-20 font-bold" />
        <button onClick={() => onDelete(plan.id)} className="text-destructive"><Trash2 className="size-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <label>Preço (MZN)<Input type="number" value={f.price} onChange={(e) => set("price", Number(e.target.value))} className="bg-muted border-0" /></label>
        <label>Retorno diário<Input type="number" value={f.daily_return} onChange={(e) => set("daily_return", Number(e.target.value))} className="bg-muted border-0" /></label>
        <label>Duração (dias)<Input type="number" value={f.duration_days} onChange={(e) => set("duration_days", Number(e.target.value))} className="bg-muted border-0" /></label>
        <label>Retorno total<Input type="number" value={f.total_return} onChange={(e) => set("total_return", Number(e.target.value))} className="bg-muted border-0" /></label>
        <label>Lucro líquido<Input type="number" value={f.net_profit} onChange={(e) => set("net_profit", Number(e.target.value))} className="bg-muted border-0" /></label>
        <label>Ordem<Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className="bg-muted border-0" /></label>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs flex items-center gap-2">
          <input type="checkbox" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Ativo
        </label>
        <Button size="sm" onClick={() => onSave(plan.id, {
          code: f.code, price: f.price, daily_return: f.daily_return,
          duration_days: f.duration_days, total_return: f.total_return,
          net_profit: f.net_profit, sort_order: f.sort_order, is_active: f.is_active,
        })}>Guardar</Button>
      </div>
    </div>
  );
}
