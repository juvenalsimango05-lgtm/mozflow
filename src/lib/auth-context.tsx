import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface Profile {
  id: string;
  name: string;
  phone: string;
  referral_code: string;
  balance: number;
  total_deposit: number;
  total_earnings: number;
  referral_earnings: number;
  last_plan: string | null;
  referred_by: string | null;
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

function genReferralCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let r = "";
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)];
  return r;
}

export async function ensureProfile(uid: string, extra?: { name?: string; phone?: string; referral_code_used?: string }) {
  const ref = doc(db, "profiles", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as Profile;

  let referredBy: string | null = null;
  if (extra?.referral_code_used) {
    // find referrer by code (simple linear scan – fine for small user base)
    const { getDocs, collection, query, where } = await import("firebase/firestore");
    const q = query(collection(db, "profiles"), where("referral_code", "==", extra.referral_code_used));
    const s = await getDocs(q);
    if (!s.empty) referredBy = s.docs[0].id;
  }

  const profile: Profile = {
    id: uid,
    name: extra?.name ?? "Utilizador",
    phone: extra?.phone ?? "",
    referral_code: genReferralCode(),
    balance: 0,
    total_deposit: 0,
    total_earnings: 0,
    referral_earnings: 0,
    last_plan: null,
    referred_by: referredBy,
  };
  await setDoc(ref, { ...profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  // default role
  await setDoc(doc(db, "user_roles", uid), { user_id: uid, role: "user", created_at: new Date().toISOString() });
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    // settle hourly payouts client-side
    const { settleHourlyPayouts } = await import("./settle-payouts");
    await settleHourlyPayouts(uid);

    const snap = await getDoc(doc(db, "profiles", uid));
    if (snap.exists()) setProfile(snap.data() as Profile);
    else setProfile(null);

    const roleSnap = await getDoc(doc(db, "user_roles", uid));
    setIsAdmin(roleSnap.exists() && roleSnap.data()?.role === "admin");
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        loadProfile(u.uid).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const refresh = async () => {
    if (user) await loadProfile(user.uid);
  };
  const doSignOut = async () => {
    await fbSignOut(auth);
    window.location.href = "/";
  };

  return (
    <Ctx.Provider value={{ user, profile, isAdmin, loading, refresh, signOut: doSignOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}