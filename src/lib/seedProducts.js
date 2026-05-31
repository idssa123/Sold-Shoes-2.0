

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { products } from "../data/products";
import { REMOVED_IDS, REMOVED_NAMES } from "./removedProducts";


export async function seedProducts() {
  const toWrite = products.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name));
  console.log(`[seed] Escribiendo ${toWrite.length} productos en Firestore…`);

  const writes = toWrite.map((product) =>
    setDoc(doc(db, "products", product.id), {
      ...product,
      stock:     product.stock ?? 5,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );

  await Promise.all(writes);
  console.log("[seed] ✅ Productos cargados correctamente.");
}



export async function seedAdminUser(uid) {
  if (!uid) { console.error("[seed] Debes pasar el UID del usuario."); return; }

  await setDoc(
    doc(db, "users", uid),
    { role: "admin", updatedAt: serverTimestamp() },
    { merge: true }   
  );

  console.log(`[seed] ✅ Usuario ${uid} ahora es administrador.`);
}
