import {
  collection, doc,
  getDoc, getDocs,
  query, where, orderBy, limit, startAfter,
  writeBatch, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { REMOVED_IDS, REMOVED_NAMES } from "./removedProducts";
import { products as localProducts } from "../data/products";


export async function fetchAllProducts() {
  if (!db) {
    return localProducts.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
  }

  const snapshot = await getDocs(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
}


export async function fetchFeaturedProducts() {
  if (!db) {
    return localProducts.filter(p => p.featured && !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
  }

  const snapshot = await getDocs(
    query(collection(db, "products"), where("featured", "==", true))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
}


export async function fetchProductById(productId) {
  if (REMOVED_IDS.includes(productId)) return null;
  if (!db) {
    const found = localProducts.find(p => p.id === productId);
    if (!found) return null;
    if (REMOVED_NAMES.includes(found.name)) return null;
    return found;
  }

  const snapshot = await getDoc(doc(db, "products", productId));
  if (!snapshot.exists()) return null;
  const data = { id: snapshot.id, ...snapshot.data() };
  if (REMOVED_NAMES.includes(data.name)) return null;
  return data;
}



export async function decrementStock(items) {
  if (!db) {
    // Update in-memory localProducts for dev fallback (non-persistent)
    for (const item of items) {
      const p = localProducts.find(x => x.id === item.id);
      if (!p) continue;
      p.stock = Math.max(0, (p.stock ?? 0) - item.quantity);
    }
    return;
  }

  const batch = writeBatch(db);

  for (const item of items) {
    const ref  = doc(db, "products", item.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) continue;

    const currentStock = snap.data().stock ?? 0;
    const newStock     = Math.max(0, currentStock - item.quantity);
    batch.update(ref, { stock: newStock, updatedAt: serverTimestamp() });
  }

  await batch.commit();
}



export async function fetchProductsPaginated({ pageSize = 9, lastDoc = null, category = null } = {}) {
  if (!db) {
    let items = localProducts.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
    if (category) items = items.filter(p => p.category === category);
    const start = 0; // simple in-memory pagination
    const paged = items.slice(start, pageSize);
    const hasMore = items.length > pageSize;
    return { items: paged, lastDoc: null, hasMore };
  }

  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (category)  constraints.unshift(where("category", "==", category));
  if (lastDoc)   constraints.push(startAfter(lastDoc));

  const snapshot = await getDocs(query(collection(db, "products"), ...constraints));
  const items    = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
  const newLast  = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { items, lastDoc: newLast, hasMore: items.length === pageSize };
}
