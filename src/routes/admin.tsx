import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { MozFlowLogo } from "@/components/MozFlowLogo";
import { toast } from "sonner";
import { Check, X, Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [deps, setDeps] = useState<any[]>([]);
  const [wits, setWits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [accs, setAccs] = useState<any[]>([]);

  const load = useCallback(async () => {
    const [d, w, u, a] = await Promise.all([
      supabase.from("deposits").select("*, profiles(name, phone)").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*, profiles(name, phone)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("payment_accounts").select("*").order("created_at"),
    ]);
    setDeps(d.data ?? []); setWits(w.data ?? []); setUsers(u.data ?? []); setAccs(a.data ?? []);
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/dashboard" });
    if (isAdmin) load();
  }, [user, isAdmin, loading, navigate, load]);

  const approveDeposit = async (d: any) => {
    const { error } = await supabase.from("deposits").update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString() }).eq("id", d.id).eq("status", "pending");
    if (error) return toast.error(error.message);
    const { data: prof } = await supabase.from("profiles").select("balance, total_deposit").eq("id", d.user_id).single();
    if (prof) {
      await supabase.from("profiles").update({
        balance: Number(prof.balance) + Number(d.amount),
        total_deposit: Number(prof.total_deposit) + Number(d.amount),
      }).eq("id", d.user_id);
    }
    toast.success("Depósito aprovado e saldo creditado");
    load();
  };
  const rejectDeposit = async (d: any) => {
    const { error } = await supabase.from("deposits").update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString() }).eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success("Depósito rejeitado"); load();
  };
  const approveWithdraw = async (w: any) => {
    const { error } = await supabase.from("withdrawals").update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString() }).eq("id", w.id).eq("status", "pending");
    if (error) return toast.error(error.message);
    toast.success("Levantamento aprovado"); load();
  };
  const rejectWithdraw = async (w: any) => {
    // refund balance
    const { data: prof } = await supabase.from("profiles").select("balance").eq("id", w.user_id).single();
    await supabase.from("withdrawals").update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString() }).eq("id", w.id);
    if (prof) await supabase.from("profiles").update({ balance: Number(prof.balance) + Number(w.amount) }).eq("id", w.user_id);
    toast.success("Rejeitado e saldo devolvido"); load();
  };

  const adjustBalance = async (uid: string, delta: number) => {
    const { data: p } = await supabase.from("profiles").select("balance").eq("id", uid).single();
    if (!p) return;
    await supabase.from("profiles").update({ balance: Number(p.balance) + delta }).eq("id", uid);
    toast.success("Saldo atualizado"); load();
  };

  const addAccount = async (method: string, num: string, name: string) => {
    if (!num.trim()) return;
    await supabase.from("payment_accounts").insert({ method, account_number: num.trim(), account_name: name.trim() || null });
    toast.success("Conta adicionada"); load();
  };
  const toggleAccount = async (id: string, active: boolean) => {
    await supabase.from("payment_accounts").update({ is_active: !active }).eq("id", id); load();
  };

  if (loading || !isAdmin) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">A verificar...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border/50 sticky top-0 bg-background/90 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="size-5" /></button>
          <MozFlowLogo className="text-xl" />
          <span className="text-warning text-xs font-bold flex items-center gap-1"><Shield className="size-3" /> ADMIN</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4">
        <Tabs defaultValue="dep">
          <TabsList className="w-full grid grid-cols-4 bg-card">
            <TabsTrigger value="dep">Depósitos {deps.filter(d => d.status === "pending").length > 0 && <span className="ml-1 text-warning">({deps.filter(d => d.status === "pending").length})</span>}</TabsTrigger>
            <TabsTrigger value="wit">Levantar {wits.filter(d => d.status === "pending").length > 0 && <span className="ml-1 text-warning">({wits.filter(d => d.status === "pending").length})</span>}</TabsTrigger>
            <TabsTrigger value="usr">Utilizadores</TabsTrigger>
            <TabsTrigger value="acc">Contas</TabsTrigger>
          </TabsList>

          <TabsContent value="dep" className="space-y-2 mt-3">
            {deps.map((d) => (
              <div key={d.id} className="rounded-xl p-4 bg-card space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{d.profiles?.name} • {d.profiles?.phone}</div>
                    <div className="text-sm text-muted-foreground">{d.method} • {Number(d.amount).toFixed(2)} MZN</div>
                    <div className="text-xs mt-1">De: <span className="font-mono">{d.sender_phone}</span></div>
                    <div className="text-xs">ID: <span className="font-mono">{d.transaction_id}</span></div>
                  </div>
                  <StatusBadge s={d.status} />
                </div>
                {d.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-success text-success-foreground" onClick={() => approveDeposit(d)}><Check className="size-4 mr-1" /> Aprovar</Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => rejectDeposit(d)}><X className="size-4 mr-1" /> Rejeitar</Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="wit" className="space-y-2 mt-3">
            {wits.map((w) => (
              <div key={w.id} className="rounded-xl p-4 bg-card space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{w.profiles?.name} • {w.profiles?.phone}</div>
                    <div className="text-sm text-muted-foreground">{w.method} • {Number(w.amount).toFixed(2)} MZN</div>
                    <div className="text-xs mt-1">Para: <span className="font-mono">{w.destination_phone}</span></div>
                  </div>
                  <StatusBadge s={w.status} />
                </div>
                {w.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-success text-success-foreground" onClick={() => approveWithdraw(w)}><Check className="size-4 mr-1" /> Aprovar (paguei)</Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => rejectWithdraw(w)}><X className="size-4 mr-1" /> Rejeitar</Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="usr" className="space-y-2 mt-3">
            {users.map((u) => <UserRow key={u.id} u={u} onAdjust={adjustBalance} />)}
          </TabsContent>

          <TabsContent value="acc" className="space-y-3 mt-3">
            <AddAccountForm onAdd={addAccount} />
            {accs.map((a) => (
              <div key={a.id} className="rounded-xl p-4 bg-card flex justify-between items-center">
                <div>
                  <div className="font-bold">{a.method}</div>
                  <div className="text-sm font-mono">{a.account_number}</div>
                  <div className="text-xs text-muted-foreground">{a.account_name}</div>
                </div>
                <Button size="sm" variant={a.is_active ? "outline" : "default"} onClick={() => toggleAccount(a.id, a.is_active)}>
                  {a.is_active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = { pending: "bg-warning/20 text-warning", approved: "bg-success/20 text-success", rejected: "bg-destructive/20 text-destructive" };
  const lbl: Record<string, string> = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado" };
  return <span className={`text-xs font-bold px-2 py-1 rounded-full ${map[s] ?? ""}`}>{lbl[s] ?? s}</span>;
}

function UserRow({ u, onAdjust }: { u: any; onAdjust: (id: string, d: number) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="rounded-xl p-4 bg-card space-y-2">
      <div className="flex justify-between">
        <div>
          <div className="font-bold">{u.name}</div>
          <div className="text-xs text-muted-foreground">{u.phone} • Ref: {u.referral_code}</div>
        </div>
        <div className="text-right text-xs">
          <div>Saldo: <span className="text-success font-bold">{Number(u.balance).toFixed(2)}</span></div>
          <div>Depósitos: {Number(u.total_deposit).toFixed(2)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Valor (+/-)" type="number" className="h-9 bg-muted border-0" />
        <Button size="sm" onClick={() => { const n = Number(val); if (n) { onAdjust(u.id, n); setVal(""); } }}>Ajustar</Button>
      </div>
    </div>
  );
}

function AddAccountForm({ onAdd }: { onAdd: (m: string, n: string, name: string) => void }) {
  const [method, setMethod] = useState("M-Pesa");
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  return (
    <div className="rounded-xl p-4 bg-card space-y-2">
      <div className="font-bold text-sm">Adicionar conta de recebimento</div>
      <div className="grid grid-cols-3 gap-2">
        {["M-Pesa", "E-Mola", "M-Kesh"].map((m) => (
          <button key={m} type="button" onClick={() => setMethod(m)} className={`h-9 rounded-md text-sm font-semibold ${method === m ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m}</button>
        ))}
      </div>
      <Input value={num} onChange={(e) => setNum(e.target.value)} placeholder="Número" className="bg-muted border-0" />
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (opcional)" className="bg-muted border-0" />
      <Button size="sm" onClick={() => { onAdd(method, num, name); setNum(""); setName(""); }} className="w-full">Adicionar</Button>
    </div>
  );
}