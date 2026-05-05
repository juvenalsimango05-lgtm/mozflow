import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useCallback, useRef } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  name: string;
  phone: string;
  referral_code: string;
  balance: number;
  total_deposit: number;
  total_earnings: number;
  referral_earnings: number;
  last_plan: string | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const settleRef = useRef(false); // only settle once per mount

  const loadProfile = async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(p as Profile | null);
    setIsAdmin(!!r?.some((x: { role: string }) => x.role === "admin"));

    // Settle payouts in the background (non-blocking, once per mount)
    if (!settleRef.current) {
      settleRef.current = true;
      supabase.rpc("settle_hourly_payouts").then(() => {
        // Refresh balance silently after settle
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle().then(({ data }) => {
          if (data) setProfile(data as Profile);
        });
      }).catch(() => { /* ignore settle errors */ });
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Use queueMicrotask to avoid blocking render
        queueMicrotask(() => loadProfile(s.user.id));
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user]);
  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <Ctx.Provider value={{ user, session, profile, isAdmin, loading, refresh, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}