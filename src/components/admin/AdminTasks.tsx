import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Task { id: string; title: string; description: string | null; video_url: string; watch_seconds: number; reward: number; is_active: boolean; }

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState(""); const [url, setUrl] = useState("");
  const [secs, setSecs] = useState(30); const [reward, setReward] = useState(5);

  const load = () => supabase.from("tasks").select("*").order("created_at").then(({ data }) => setTasks((data as Task[]) ?? []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !url.trim()) return toast.error("Preencha título e link");
    const { error } = await supabase.from("tasks").insert({ title: title.trim(), video_url: url.trim(), watch_seconds: secs, reward });
    if (error) return toast.error(error.message);
    setTitle(""); setUrl(""); load();
  };
  const toggle = async (t: Task) => { await supabase.from("tasks").update({ is_active: !t.is_active }).eq("id", t.id); load(); };
  const remove = async (id: string) => { if (!confirm("Eliminar?")) return; await supabase.from("tasks").delete().eq("id", id); load(); };

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 bg-card space-y-2">
        <div className="font-bold text-sm">Nova tarefa</div>
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-muted border-0" maxLength={100} />
        <Input placeholder="Link do vídeo (YouTube)" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-muted border-0" maxLength={500} />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <label>Segundos<Input type="number" value={secs} onChange={(e) => setSecs(Number(e.target.value))} className="bg-muted border-0" /></label>
          <label>Recompensa MZN<Input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} className="bg-muted border-0" /></label>
        </div>
        <Button size="sm" onClick={add} className="w-full">Adicionar</Button>
      </div>
      {tasks.map((t) => (
        <div key={t.id} className="rounded-xl p-4 bg-card flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold truncate">{t.title}</div>
            <div className="text-xs text-muted-foreground truncate">{t.video_url}</div>
            <div className="text-xs">⏱ {t.watch_seconds}s · 💰 {t.reward} MZN</div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toggle(t)}>{t.is_active ? "Desativar" : "Ativar"}</Button>
            <button onClick={() => remove(t.id)} className="text-destructive"><Trash2 className="size-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
