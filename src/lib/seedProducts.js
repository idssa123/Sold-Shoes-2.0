

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { products } from "../data/products";


export async function seedProducts() {
  console.log(`[seed] Escribiendo ${products.length} productos en Firestore…`);

  const writes = products.map((product) =>
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
