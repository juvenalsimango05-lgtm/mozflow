import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Wrench } from "lucide-react";
import { MozFlowLogo } from "@/components/MozFlowLogo";

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("key,value")
      .in("key", ["maintenance_enabled", "maintenance_message"])
      .then(({ data }) => {
        const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
        setEnabled(m.maintenance_enabled === "true");
        setMsg(m.maintenance_message ?? "A app está em manutenção.");
        setReady(true);
      });
  }, []);

  if (!ready || loading) return <>{children}</>;
  if (!enabled || isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <MozFlowLogo className="text-3xl justify-center" />
        <div className="size-20 rounded-full bg-warning/15 mx-auto flex items-center justify-center">
          <Wrench className="size-10 text-warning" />
        </div>
        <h1 className="text-2xl font-bold">Em manutenção</h1>
        <p className="text-muted-foreground text-sm whitespace-pre-line">{msg}</p>
      </div>
    </div>
  );
}
