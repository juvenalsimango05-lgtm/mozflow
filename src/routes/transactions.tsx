import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/transactions")({ component: TxPage });

const statusColor: Record<string, string> = {
  pending: "text-warning", approved: "text-success", rejected: "text-destructive",
  active: "text-success", completed: "text-muted-foreground",
};
const statusLabel: Record<string, string> = {
  pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado",
  active: "Ativo", completed: "Concluído",
};

function TxPage() {
  const { user } = useAuth();
  const [deps, setDeps] = useState<any[]>([]);
  const [wits, setWits] = useState<any[]>([]);
  const [invs, setInvs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setDeps(data ?? []));
    supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setWits(data ?? []));
    supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setInvs(data ?? []));
  }, [user]);

  return (
    <AppShell>
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold mb-3">Histórico</h1>
        <Tabs defaultValue="dep">
          <TabsList className="w-full grid grid-cols-3 bg-card">
            <TabsTrigger value="dep">Depósitos</TabsTrigger>
            <TabsTrigger value="wit">Levantamentos</TabsTrigger>
            <TabsTrigger value="inv">Investimentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dep" className="space-y-2 mt-3">
            {deps.length === 0 && <Empty />}
            {deps.map((d) => (
              <Row key={d.id} title={`${d.method} • ${Number(d.amount).toFixed(2)} MZN`} sub={`ID: ${d.transaction_id} • ${d.sender_phone}`} status={d.status} when={d.created_at} />
            ))}
          </TabsContent>
          <TabsContent value="wit" className="space-y-2 mt-3">
            {wits.length === 0 && <Empty />}
            {wits.map((d) => (
              <Row key={d.id} title={`${d.method} • ${Number(d.amount).toFixed(2)} MZN`} sub={`Para: ${d.destination_phone}`} status={d.status} when={d.created_at} />
            ))}
          </TabsContent>
          <TabsContent value="inv" className="space-y-2 mt-3">
            {invs.length === 0 && <Empty />}
            {invs.map((d) => (
              <Row key={d.id} title={`${d.plan_code} • ${Number(d.amount).toFixed(2)} MZN`} sub={`Retorno: ${Number(d.daily_return)}/dia • ${d.duration_days} dias`} status={d.status} when={d.created_at} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Empty() {
  return <div className="text-center text-muted-foreground py-10 text-sm">Sem registos.</div>;
}

function Row({ title, sub, status, when }: { title: string; sub: string; status: string; when: string }) {
  return (
    <div className="rounded-xl p-4 bg-card flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{sub}</div>
        <div className="text-[10px] text-muted-foreground mt-1">{new Date(when).toLocaleString("pt-PT")}</div>
      </div>
      <div className={`text-xs font-bold ${statusColor[status] ?? ""}`}>{statusLabel[status] ?? status}</div>
    </div>
  );
}