import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Slide { id: string; slot: number; image_url: string; link_url: string; is_active: boolean; }

export function AdminSlides() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase.from("home_slides").select("*").order("slot").then(({ data }) => {
      setSlides((data as Slide[]) ?? []);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const update = (slot: number, patch: Partial<Slide>) => {
    setSlides(s => s.map(x => x.slot === slot ? { ...x, ...patch } : x));
  };

  const save = async (s: Slide) => {
    const { error } = await supabase.from("home_slides").update({
      image_url: s.image_url.trim(),
      link_url: s.link_url.trim(),
      is_active: s.is_active,
      updated_at: new Date().toISOString(),
    }).eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success(`Slide ${s.slot} guardado`);
  };

  if (loading) return <div className="text-sm text-muted-foreground">A carregar...</div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Defina até 8 slides para a página inicial. Active apenas os que tiverem imagem.</p>
      {slides.map((s) => (
        <div key={s.id} className="rounded-xl p-4 bg-card space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm">Slide {s.slot}</div>
            <Switch checked={s.is_active} onCheckedChange={(v) => update(s.slot, { is_active: v })} />
          </div>
          {s.image_url && (
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-muted">
              <img src={s.image_url} alt={`Slide ${s.slot}`} className="w-full h-full object-cover" />
            </div>
          )}
          <Input value={s.image_url} onChange={(e) => update(s.slot, { image_url: e.target.value })} placeholder="URL da imagem (https://...)" className="bg-muted border-0" />
          <Input value={s.link_url} onChange={(e) => update(s.slot, { link_url: e.target.value })} placeholder="Link de destino (opcional)" className="bg-muted border-0" />
          <Button size="sm" onClick={() => save(s)} className="w-full">Guardar</Button>
        </div>
      ))}
    </div>
  );
}
