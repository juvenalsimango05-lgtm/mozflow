import { useEffect, useState } from "react";
import { db, doc, updateDoc, addDoc, deleteDoc, collection, queryDocs } from "@/lib/firestore-helpers";
import { orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Task { id: string; title: string; description: string | null; video_url: string; watch_seconds: number; reward: number; is_active: boolean; }

export function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState(""); const [url, setUrl] = useState("");
  const [secs, setSecs] = useState(30); const [reward, setReward] = useState(5);

  const load = () => queryDocs<Task>("tasks", orderBy("created_at")).then(setTasks);
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim() || !url.trim()) return toast.error("Preencha título e link");
    await addDoc(collection(db, "tasks"), { title: title.trim(), video_url: url.trim(), watch_seconds: secs, reward, is_active: true, sort_order: 0, created_at: new Date().toISOString() });
    setTitle(""); setUrl(""); load();
  };
  const toggle = async (t: Task) => { await updateDoc(doc(db, "tasks", t.id), { is_active: !t.is_active }); load(); };
  const remove = async (id: string) => { if (!confirm("Eliminar?")) return; await deleteDoc(doc(db, "tasks", id)); load(); };

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
