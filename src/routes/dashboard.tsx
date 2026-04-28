import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { toast } from "sonner";
import { Plus, MessageCircle, Users } from "lucide-react";
import promo247 from "@/assets/promo-247.png";
import promoSecurity from "@/assets/promo-security.png";
import promoInvite from "@/assets/promo-invite.jpg";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

interface Plan {
  id: string; code: string; name: string; price: number;
  daily_return: number; duration_days: number; net_profit: number;
}

const SLIDES = [promo247, promoInvite, promoSecurity];

function Dashboard() {
  const { profile, refresh } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investing, setInvesting] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [communityUrl, setCommunityUrl] = useState<string>("");

  useEffect(() => {
    supabase.from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      setPlans((data as Plan[]) ?? []);
    });
    supabase.from("app_settings").select("key,value").in("key", ["whatsapp_url", "community_url"]).then(({ data }) => {
      const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
      setWhatsappUrl(map.whatsapp_url ?? "");
      setCommunityUrl(map.community_url ?? "");
    });
  }, []);

  const invest = async (plan: Plan) => {
    if (!profile) return;
    if (Number(profile.balance) < Number(plan.price)) {
      toast.error("Saldo insuficiente. Faça um depósito primeiro.");
      return;
    }
    setInvesting(plan.id);
    const end = new Date(); end.setDate(end.getDate() + plan.duration_days);
    const { error } = await supabase.from("investments").insert({
      user_id: profile.id, plan_id: plan.id, plan_code: plan.code,
      amount: plan.price, daily_return: plan.daily_return,
      duration_days: plan.duration_days,
      total_return: Number(plan.daily_return) * plan.duration_days,
      end_date: end.toISOString(),
    });
    if (error) { toast.error(error.message); setInvesting(null); return; }
    await supabase.from("profiles").update({
      balance: Number(profile.balance) - Number(plan.price),
      last_plan: plan.code,
    }).eq("id", profile.id);
    await refresh();
    setInvesting(null);
    toast.success(`Investimento ${plan.code} ativado!`);
  };

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-5">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
          className="rounded-2xl overflow-hidden"
        >
          <CarouselContent>
            {SLIDES.map((src, i) => (
              <CarouselItem key={i}>
                <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
                  <img src={src} alt={`Promo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div>
          <h2 className="text-xl font-bold mb-3 px-1">Planos de Investimento</h2>
          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="rounded-2xl p-4 flex gap-4" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
                <div className="size-24 rounded-xl bg-white flex items-center justify-center text-3xl font-bold text-foreground">
                  🚗
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">{p.code}</div>
                  <div className="text-sm space-y-0.5 mt-1">
                    <div><span className="text-muted-foreground">PREÇO:</span> <span className="font-semibold">{Number(p.price)} MZN</span></div>
                    <div><span className="text-muted-foreground">DURAÇÃO:</span> <span className="font-semibold">{p.duration_days} DIAS</span></div>
                    <div><span className="text-muted-foreground">LUCRO:</span> <span className="font-semibold text-success">{Number(p.net_profit)} MZN</span></div>
                  </div>
                  <Button size="sm" className="mt-2 rounded-full w-full" disabled={investing === p.id} onClick={() => invest(p)} style={{ background: "var(--gradient-primary)" }}>
                    <Plus className="size-4 mr-1" /> {investing === p.id ? "..." : "Investir"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="size-12 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-lg"
          >
            <MessageCircle className="size-6 text-success" />
          </a>
        )}
        {communityUrl && (
          <a
            href={communityUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Comunidade"
            className="size-12 rounded-full bg-card border border-border/60 flex items-center justify-center shadow-lg"
          >
            <Users className="size-6 text-success" />
          </a>
        )}
      </div>
    </AppShell>
  );
}
