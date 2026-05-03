import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { queryDocs } from "@/lib/firestore-helpers";
import { where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/referral")({ component: ReferralPage });

function ReferralPage() {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    queryDocs("profiles", where("referred_by", "==", profile.id)).then(docs => setCount(docs.length));
  }, [profile]);

  const link = typeof window !== "undefined" && profile ? `${window.location.origin}/register?ref=${profile.referral_code}` : "";
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "MozFlow", text: `Junta-te ao MozFlow com o meu código: ${profile?.referral_code}`, url: link });
    else { navigator.clipboard.writeText(link); toast.success("Link copiado"); }
  };

  return (
    <AppShell>
      <div className="px-4 pt-4 space-y-4">
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-glow)" }}>
          <Users className="size-10 mx-auto text-primary mb-2" />
          <div className="text-sm text-muted-foreground">O seu código de convite</div>
          <div className="text-4xl font-bold mt-2 font-mono">{profile?.referral_code}</div>
          <Button onClick={() => { navigator.clipboard.writeText(profile?.referral_code ?? ""); toast.success("Copiado"); }} variant="outline" size="sm" className="mt-3 rounded-full">
            <Copy className="size-4 mr-1" /> Copiar código
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 bg-card">
            <div className="text-xs text-muted-foreground">Convidados</div>
            <div className="text-2xl font-bold mt-1">{count}</div>
          </div>
          <div className="rounded-xl p-4 bg-card">
            <div className="text-xs text-muted-foreground">Ganhos por convite</div>
            <div className="text-2xl font-bold mt-1 text-success">{Number(profile?.referral_earnings ?? 0).toFixed(2)} MZN</div>
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-card">
          <div className="text-xs text-muted-foreground mb-2">Link de convite</div>
          <div className="text-xs break-all font-mono bg-muted rounded p-2">{link}</div>
          <Button onClick={share} className="w-full mt-3 rounded-full" style={{ background: "var(--gradient-primary)" }}>
            <Share2 className="size-4 mr-2" /> Partilhar
          </Button>
        </div>
      </div>
    </AppShell>
  );
}