import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export async function fetchAllProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function fetchFeaturedProducts() {
  const featuredQuery = query(
    collection(db, "products"),
    where("featured", "==", true)
  );
  const snapshot = await getDocs(featuredQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function fetchProductById(productId) {
  const productRef = doc(db, "products", productId);
  const snapshot = await getDoc(productRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}
