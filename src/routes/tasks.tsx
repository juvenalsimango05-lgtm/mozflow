import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Play, Check } from "lucide-react";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

interface Task { id: string; title: string; description: string | null; video_url: string; watch_seconds: number; reward: number; }

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    if (u.pathname.startsWith("/embed/")) return url;
    return null;
  } catch { return null; }
}

function TasksPage() {
  const { profile, refresh } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [claimedToday, setClaimedToday] = useState(0);
  const [active, setActive] = useState<Task | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const DAILY_LIMIT = 3;

  const load = async () => {
    if (!profile) return;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("tasks").select("*").eq("is_active", true).order("created_at"),
      supabase.from("task_claims").select("task_id, created_at").eq("user_id", profile.id),
    ]);
    setTasks((t as Task[]) ?? []);
    const all = (c ?? []) as { task_id: string; created_at: string }[];
    setClaimed(new Set(all.map((x) => x.task_id)));
    setClaimedToday(all.filter((x) => new Date(x.created_at) >= startOfDay).length);
  };
  useEffect(() => { load(); }, [profile]);

  useEffect(() => {
    if (!active) return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  const claim = async () => {
    if (!active || !profile) return;
    if (seconds < active.watch_seconds) return toast.error("Continue a assistir");
    if (claimedToday >= DAILY_LIMIT) {
      toast.error("Já assististe 3 vídeos hoje. Volta amanhã!");
      setActive(null);
      return;
    }
    setClaiming(true);
    const { error } = await supabase.from("task_claims").insert({ user_id: profile.id, task_id: active.id, reward: active.reward });
    if (error) { toast.error(error.message); setClaiming(false); return; }
    await supabase.from("profiles").update({
      balance: Number(profile.balance) + Number(active.reward),
      total_earnings: Number(profile.total_earnings) + Number(active.reward),
    }).eq("id", profile.id);
    toast.success(`+${active.reward} MZN!`);
    setActive(null); setClaiming(false);
    await refresh(); load();
  };

  const embed = active ? youtubeEmbed(active.video_url) : null;
  const limitReached = claimedToday >= DAILY_LIMIT;

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-4">
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <p className="text-sm text-muted-foreground">Assista vídeos e ganhe recompensas. Máximo 3 por dia.</p>
        <div className={`rounded-xl p-3 text-sm font-bold text-center ${limitReached ? "bg-destructive/10 text-destructive" : "bg-card"}`}>
          Hoje: {claimedToday} / {DAILY_LIMIT} vídeos
          {limitReached && <div className="text-xs font-normal mt-1">Volta amanhã para mais recompensas</div>}
        </div>
        {tasks.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Sem tarefas disponíveis no momento.</div>}
        {tasks.map((t) => {
          const done = claimed.has(t.id);
          const disabled = done || limitReached;
          return (
            <div key={t.id} className="rounded-2xl p-4 bg-card flex items-center gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                {done ? <Check className="size-6 text-success" /> : <Play className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{t.title}</div>
                <div className="text-xs text-success">+{t.reward} MZN · {t.watch_seconds}s</div>
              </div>
              <Button size="sm" disabled={disabled} onClick={() => setActive(t)}>
                {done ? "Feito" : limitReached ? "Limite" : "Assistir"}
              </Button>
            </div>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold">{active.title}</div>
            <button onClick={() => setActive(null)} className="text-muted-foreground">Fechar</button>
          </div>
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            {embed ? (
              <iframe src={`${embed}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
            ) : (
              <video src={active.video_url} className="w-full h-full" controls autoPlay />
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold">{Math.min(seconds, active.watch_seconds)} / {active.watch_seconds}s</div>
            <div className="text-sm text-muted-foreground mt-1">Recompensa: {active.reward} MZN</div>
            <Button onClick={claim} disabled={claiming || seconds < active.watch_seconds} className="mt-4 w-full rounded-full" style={{ background: "var(--gradient-primary)" }}>
              {seconds < active.watch_seconds ? `Aguarde ${active.watch_seconds - seconds}s` : "Reivindicar recompensa"}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
