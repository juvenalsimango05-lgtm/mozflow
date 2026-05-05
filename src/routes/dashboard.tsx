import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, MessageCircle, Users, PlaySquare, Sparkles, Gift, X, Star } from "lucide-react";
import promo247 from "@/assets/promo-247.png";
import promoSecurity from "@/assets/promo-security.png";
import carTesla from "@/assets/car-tesla.jpg";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

interface Plan {
  id: string; code: string; name: string; price: number;
  daily_return: number; duration_days: number; net_profit: number;
}

const SLIDES = [promo247, promoSecurity];

interface SlideRow { image_url: string; link_url: string; }

function Dashboard() {
  const { profile, refresh } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [investing, setInvesting] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [communityUrl, setCommunityUrl] = useState<string>("");
  const [slides, setSlides] = useState<SlideRow[]>([]);
  const [showPromo, setShowPromo] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const key = `promo_dismissed_${profile.id}`;
    if (localStorage.getItem(key)) return;
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", profile.id)
      .then(({ count }) => {
        setReferralCount(count ?? 0);
        setShowPromo(true);
      });
  }, [profile]);

  const dismissPromo = () => {
    if (profile) localStorage.setItem(`promo_dismissed_${profile.id}`, "1");
    setShowPromo(false);
  };

  useEffect(() => {
    supabase.from("plans").select("*").eq("is_active", true).order("sort_order").then(({ data }) => {
      setPlans((data as Plan[]) ?? []);
    });
    supabase.from("app_settings").select("key,value").in("key", ["whatsapp_url", "community_url"]).then(({ data }) => {
      const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
      setWhatsappUrl(map.whatsapp_url ?? "");
      setCommunityUrl(map.community_url ?? "");
    });
    supabase.from("home_slides").select("image_url,link_url,is_active,slot").eq("is_active", true).order("slot").then(({ data }) => {
      const rows = (data ?? []).filter((r: any) => r.image_url) as SlideRow[];
      setSlides(rows);
    });
  }, []);

  // Auto-settle hourly payouts every 5 minutes while the dashboard is open
  useEffect(() => {
    const id = setInterval(() => { void refresh(); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

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
        {(() => {
        const display = slides.length > 0
          ? slides
          : SLIDES.map((src) => ({ image_url: src, link_url: "" }));
        return (
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
          className="rounded-2xl overflow-hidden"
        >
          <CarouselContent>
            {display.map((s, i) => {
              const inner = (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
                  <img src={s.image_url} alt={`Promo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              );
              return (
                <CarouselItem key={i}>
                  {s.link_url ? (
                    <a href={s.link_url} target="_blank" rel="noopener noreferrer">{inner}</a>
                  ) : inner}
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
        );
        })()}

        <div className="grid grid-cols-3 gap-2">
          <Link to="/tasks" className="rounded-2xl p-3 bg-card flex flex-col items-center text-center gap-1" style={{ boxShadow: "var(--shadow-card)" }}>
            <PlaySquare className="size-6 text-primary" />
            <div className="text-xs font-bold">Tarefas</div>
          </Link>
          <Link to="/roulette" className="rounded-2xl p-3 bg-card flex flex-col items-center text-center gap-1" style={{ boxShadow: "var(--shadow-card)" }}>
            <Sparkles className="size-6 text-primary" />
            <div className="text-xs font-bold">Roleta</div>
          </Link>
          <Link to="/checkin" className="rounded-2xl p-3 bg-card flex flex-col items-center text-center gap-1" style={{ boxShadow: "var(--shadow-card)" }}>
            <Gift className="size-6 text-primary" />
            <div className="text-xs font-bold">Pesquisa</div>
          </Link>
        </div>

        <div>

          <div className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="rounded-2xl p-4 flex gap-4" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-card)" }}>
                <div className="size-24 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <img src={carTesla} alt="Tesla" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">{p.code}</div>
                  <div className="text-sm space-y-0.5 mt-1">
                    <div><span className="text-muted-foreground">PREÇO:</span> <span className="font-semibold">{Number(p.price)} MZN</span></div>
                    <div><span className="text-muted-foreground">DURAÇÃO:</span> <span className="font-semibold">{p.duration_days} DIAS</span></div>
                    <div><span className="text-muted-foreground">LUCRO:</span> <span className="font-semibold text-success">{Number(p.net_profit)} MZN</span></div>
                  </div>
                  <Button size="sm" className="mt-2 rounded-full w-full" disabled={investing === p.id} onClick={() => invest(p)} style={{ background: "var(--gradient-primary)" }}>
                    <Plus className="size-4 mr-1" /> {investing === p.id ? "..." : "Comprar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Botões flutuantes */}

      {/* Promo modal */}
      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 mb-6 rounded-3xl bg-card p-6 text-center relative animate-in slide-in-from-bottom duration-300">
            <button onClick={dismissPromo} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
            <div className="mx-auto mb-4 size-20 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)", boxShadow: "0 0 30px oklch(0.7 0.2 25 / 0.4)" }}>
              <Star className="size-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold uppercase">CORRIDA MOZFLOW +3000MT</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Todos que CONVIDAREM 60 Amigos Ganham 3000 MZN.<br />
              Não perca a festa MozFlow — copia agora o link no teu perfil e começa a convidar!
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Progresso: <span className="font-bold text-foreground">{referralCount}/60</span> convidados
            </p>
            <Button onClick={dismissPromo} className="w-full mt-5 rounded-full h-12 text-base font-semibold" variant="outline">
              Entendi
            </Button>
          </div>
        </div>
      )}

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
