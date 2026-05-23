import {
  collection, doc,
  getDoc, getDocs,
  query, where, orderBy, limit, startAfter,
  writeBatch, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Obtener todos los productos ─────────────────────────────────────────────
export async function fetchAllProducts() {
  const snapshot = await getDocs(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Productos destacados ────────────────────────────────────────────────────
export async function fetchFeaturedProducts() {
  const snapshot = await getDocs(
    query(collection(db, "products"), where("featured", "==", true))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Producto por ID ─────────────────────────────────────────────────────────
export async function fetchProductById(productId) {
  const snapshot = await getDoc(doc(db, "products", productId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

// ─── Decrementar stock al confirmar pedido ────────────────────────────────────
// items: [{ id, quantity }]
export async function decrementStock(items) {
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

// ─── Paginación server-side (cursor-based) ────────────────────────────────────
// Devuelve { items, lastDoc } donde lastDoc se pasa como cursor en la siguiente llamada
export async function fetchProductsPaginated({ pageSize = 9, lastDoc = null, category = null } = {}) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (category)  constraints.unshift(where("category", "==", category));
  if (lastDoc)   constraints.push(startAfter(lastDoc));

  const snapshot = await getDocs(query(collection(db, "products"), ...constraints));
  const items    = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  const newLast  = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { items, lastDoc: newLast, hasMore: items.length === pageSize };
}
