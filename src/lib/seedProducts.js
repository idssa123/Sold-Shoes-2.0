import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { products } from "../data/products";

export async function seedProducts() {
  const writes = products.map((product) =>
    setDoc(doc(db, "products", product.id), {
      ...product,
      createdAt: serverTimestamp(),
    })
  );

  await Promise.all(writes);
}
