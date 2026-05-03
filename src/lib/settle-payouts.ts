import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function settleHourlyPayouts(uid: string) {
  const q = query(collection(db, "investments"), where("user_id", "==", uid), where("status", "==", "active"));
  const snap = await getDocs(q);
  let totalCredited = 0;

  for (const d of snap.docs) {
    const inv = d.data();
    const hourly = Number(inv.daily_return) / 24;
    const lastPayout = inv.last_payout_at ? new Date(inv.last_payout_at) : new Date(inv.start_date);
    const hours = Math.floor((Date.now() - lastPayout.getTime()) / 3600000);
    if (hours <= 0) continue;

    const remaining = Number(inv.total_return) - Number(inv.earned);
    if (remaining <= 0) {
      await updateDoc(doc(db, "investments", d.id), { status: "completed" });
      continue;
    }

    const pay = Math.min(hourly * hours, remaining);
    const newEarned = Number(inv.earned) + pay;
    const newLastPayout = new Date(lastPayout.getTime() + hours * 3600000).toISOString();

    await updateDoc(doc(db, "investments", d.id), {
      earned: newEarned,
      last_payout_at: newLastPayout,
      status: newEarned >= Number(inv.total_return) ? "completed" : "active",
    });

    totalCredited += pay;
  }

  if (totalCredited > 0) {
    const profRef = doc(db, "profiles", uid);
    const profSnap = await getDoc(profRef);
    if (profSnap.exists()) {
      const p = profSnap.data();
      await updateDoc(profRef, {
        balance: Number(p.balance) + totalCredited,
        total_earnings: Number(p.total_earnings) + totalCredited,
      });
    }
  }

  return totalCredited;
}