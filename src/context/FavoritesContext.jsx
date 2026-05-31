import { createContext, useContext, useEffect, useState } from "react";
import {
  collection, doc, setDoc, deleteDoc,
  getDocs, serverTimestamp
} from "firebase/firestore";
import { db, firebaseReady } from "../lib/firebase";
import { REMOVED_IDS, REMOVED_NAMES } from "../lib/removedProducts";
import { useAuth } from "./AuthContext";


const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);


  const favCol = () => collection(db, "users", user.uid, "favorites");
  const wishCol = () => collection(db, "users", user.uid, "wishlist");
  const favDoc = (id) => doc(db, "users", user.uid, "favorites", id);
  const wishDoc = (id) => doc(db, "users", user.uid, "wishlist", id);


  useEffect(() => {
    // If Firebase isn't configured, load from localStorage so favorites/wishlist still work locally.
    if (!firebaseReady) {
      try {
        const localFav = JSON.parse(localStorage.getItem("favorites_local") || "[]");
        const localWish = JSON.parse(localStorage.getItem("wishlist_local") || "[]");
        setFavorites(localFav.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
        setWishlist(localWish.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
      } catch (e) {
        console.error("Error leyendo favoritos locales:", e);
        setFavorites([]);
        setWishlist([]);
      }
      return;
    }

    if (!user) { setFavorites([]); setWishlist([]); return; }

    const load = async () => {
      setLoading(true);
      try {
        const [favSnap, wishSnap] = await Promise.all([
          getDocs(favCol()),
          getDocs(wishCol()),
        ]);
        setFavorites(favSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
        setWishlist(wishSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
      } catch (e) {
        console.error("Error cargando favoritos/wishlist:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);



  const isFavorite = (productId) => favorites.some(f => f.id === productId);

  const toggleFavorite = async (product) => {
    // Local fallback when Firebase isn't configured or user not logged in
    if (!firebaseReady || !user) {
      try {
        const cur = [...favorites];
        if (isFavorite(product.id)) {
          const updated = cur.filter(f => f.id !== product.id);
          setFavorites(updated);
          localStorage.setItem("favorites_local", JSON.stringify(updated));
        } else {
          const data = { id: product.id, name: product.name, price: product.price, image: product.image };
          const updated = [...cur, data];
          setFavorites(updated);
          localStorage.setItem("favorites_local", JSON.stringify(updated));
        }
      } catch (e) { console.error("Error toggling local favorite:", e); }
      return;
    }
    if (isFavorite(product.id)) {
      await deleteDoc(favDoc(product.id));
      setFavorites(prev => prev.filter(f => f.id !== product.id));
    } else {
      const data = {
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand || "",
        size: product.size || "",
        category: product.category || "",
        condition: product.condition || "",
        stock: product.stock ?? 0,
        addedAt: serverTimestamp(),
      };
      await setDoc(favDoc(product.id), data);
      setFavorites(prev => [...prev, { id: product.id, ...data }]);
    }
  };



  const isInWishlist = (productId) => wishlist.some(w => w.id === productId);

  const toggleWishlist = async (product) => {
    if (!firebaseReady || !user) {
      try {
        const cur = [...wishlist];
        if (isInWishlist(product.id)) {
          const updated = cur.filter(w => w.id !== product.id);
          setWishlist(updated);
          localStorage.setItem("wishlist_local", JSON.stringify(updated));
        } else {
          const data = { id: product.id, name: product.name, price: product.price, image: product.image };
          const updated = [...cur, data];
          setWishlist(updated);
          localStorage.setItem("wishlist_local", JSON.stringify(updated));
        }
      } catch (e) { console.error("Error toggling local wishlist:", e); }
      return;
    }

    if (isInWishlist(product.id)) {
      await deleteDoc(wishDoc(product.id));
      setWishlist(prev => prev.filter(w => w.id !== product.id));
    } else {
      const data = {
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand || "",
        size: product.size || "",
        category: product.category || "",
        condition: product.condition || "",
        stock: product.stock ?? 0,
        addedAt: serverTimestamp(),
      };
      await setDoc(wishDoc(product.id), data);
      setWishlist(prev => [...prev, { id: product.id, ...data }]);
    }
  };

  const value = {
    favorites, wishlist, loading,
    isFavorite, toggleFavorite,
    isInWishlist, toggleWishlist,
    favCount: favorites.length,
    wishCount: wishlist.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
