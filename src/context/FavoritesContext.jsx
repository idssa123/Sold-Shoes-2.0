import { createContext, useContext, useEffect, useState } from "react";
import {
  collection, doc, setDoc, deleteDoc,
  getDocs, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";


const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([]);  
  const [wishlist,  setWishlist]  = useState([]);  
  const [loading,   setLoading]   = useState(false);

  
  const favCol  = () => collection(db, "users", user.uid, "favorites");
  const wishCol = () => collection(db, "users", user.uid, "wishlist");
  const favDoc  = (id) => doc(db, "users", user.uid, "favorites", id);
  const wishDoc = (id) => doc(db, "users", user.uid, "wishlist",  id);

  
  useEffect(() => {
    if (!user) { setFavorites([]); setWishlist([]); return; }

    const load = async () => {
      setLoading(true);
      try {
        const [favSnap, wishSnap] = await Promise.all([
          getDocs(favCol()),
          getDocs(wishCol()),
        ]);
        setFavorites(favSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setWishlist(wishSnap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    if (!user) return;
    if (isFavorite(product.id)) {
      
      await deleteDoc(favDoc(product.id));
      setFavorites(prev => prev.filter(f => f.id !== product.id));
    } else {
      
      const data = {
        name:      product.name,
        price:     product.price,
        image:     product.image,
        brand:     product.brand      || "",
        size:      product.size       || "",
        category:  product.category   || "",
        condition: product.condition  || "",
        stock:     product.stock      ?? 0,
        addedAt:   serverTimestamp(),
      };
      await setDoc(favDoc(product.id), data);
      setFavorites(prev => [...prev, { id: product.id, ...data }]);
    }
  };

  

  const isInWishlist = (productId) => wishlist.some(w => w.id === productId);

  const toggleWishlist = async (product) => {
    if (!user) return;
    if (isInWishlist(product.id)) {
      await deleteDoc(wishDoc(product.id));
      setWishlist(prev => prev.filter(w => w.id !== product.id));
    } else {
      const data = {
        name:      product.name,
        price:     product.price,
        image:     product.image,
        brand:     product.brand     || "",
        size:      product.size      || "",
        category:  product.category  || "",
        condition: product.condition || "",
        stock:     product.stock     ?? 0,
        addedAt:   serverTimestamp(),
      };
      await setDoc(wishDoc(product.id), data);
      setWishlist(prev => [...prev, { id: product.id, ...data }]);
    }
  };

  const value = {
    favorites, wishlist, loading,
    isFavorite, toggleFavorite,
    isInWishlist, toggleWishlist,
    favCount:  favorites.length,
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
