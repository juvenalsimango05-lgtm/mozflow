import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, limit, type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

export { db, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc, collection, query, where, orderBy, limit };
export type { QueryConstraint };

// Helper to get a setting value
export async function getSetting(key: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "app_settings", key));
  return snap.exists() ? snap.data().value : null;
}

// Helper to get multiple settings
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  await Promise.all(keys.map(async (k) => {
    const v = await getSetting(k);
    if (v !== null) result[k] = v;
  }));
  return result;
}

// Helper to upsert a setting
export async function saveSetting(key: string, value: string) {
  await setDoc(doc(db, "app_settings", key), { key, value, updated_at: new Date().toISOString() });
}

// Helper to get all docs from a collection with optional constraints
export async function queryDocs<T = any>(col: string, ...constraints: QueryConstraint[]): Promise<(T & { id: string })[]> {
  const q = constraints.length > 0 ? query(collection(db, col), ...constraints) : query(collection(db, col));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T & { id: string }));
}