import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

export default function ProductCard({ product }) {
  const { user }                        = useAuth();
  const { addItem, items }              = useCart();
  const { isFavorite, toggleFavorite,
          isInWishlist, toggleWishlist } = useFavorites();
  const [added, setAdded]               = useState(false);

  const inCart     = items.some(i => i.id === product.id);
  const fav        = isFavorite(product.id);
  const inWish     = isInWishlist(product.id);
  const outOfStock = product.stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!user || outOfStock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return;
    toggleFavorite(product);
  };

  return (
    <article className="card card-h overflow-hidden flex flex-col"
      style={{ borderRadius: 4 }}>
      <Link to={`/products/${product.id}`} className="block">

        {}
        <div className="relative overflow-hidden" style={{ paddingBottom: "80%", background: "var(--bg3)" }}>
          <img src={product.image} alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" />

          {}
          {user && (
            <button type="button" onClick={handleFav}
              className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center transition-all"
              style={{ background: fav ? "var(--red)" : "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24"
                fill={fav ? "#fff" : "none"} stroke={fav ? "#fff" : "#ccc"} strokeWidth="2.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.65)" }}>
              <span className="text-white text-sm font-bold">AGOTADO</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 2 && (
            <div className="absolute top-2 left-2">
              <span className="badge b-red" style={{ fontSize: "0.6rem" }}>Últimas</span>
            </div>
          )}
        </div>

        {}
        <div className="p-3">
          {}
          <div className="mb-1.5 px-2 py-1.5 rounded"
            style={{ border: "1px solid var(--bdr2)", background: "var(--bg3)" }}>
            <p className="text-xs font-bold truncate" style={{ color: "var(--tx)" }}>{product.name}</p>
          </div>

          {}
          <div className="mb-2.5 px-2 py-1 rounded"
            style={{ border: "1px solid var(--bdr)", background: "transparent" }}>
            <p className="text-xs truncate" style={{ color: "var(--tx2)" }}>
              {product.brand} · Talla {product.size}
            </p>
          </div>

          {}
          <div className="flex items-center gap-2">
            <div className="flex-1 px-2 py-1.5 rounded"
              style={{ border: "1px solid var(--bdr2)", background: "var(--bg3)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--tx)" }}>{product.price}€</span>
            </div>

            {outOfStock ? (
              user ? (
                <button type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                  className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: inWish ? "var(--red-g)" : "var(--bg4)", border: `1px solid ${inWish ? "var(--bdr-r)" : "var(--bdr2)"}` }}
                  title={inWish ? "En lista de deseos" : "Añadir a lista de deseos"}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill={inWish ? "var(--red)" : "none"} stroke={inWish ? "var(--red)" : "var(--tx3)"} strokeWidth="2">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z"/>
                  </svg>
                </button>
              ) : null
            ) : (
              <button type="button" onClick={handleAdd}
                disabled={!user}
                className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0 font-bold text-lg transition-all"
                style={{
                  background: added ? "#16a34a" : "var(--red)",
                  color: "#fff",
                  opacity: !user ? 0.5 : 1,
                  cursor: !user ? "not-allowed" : "pointer",
                }}
                title={!user ? "Inicia sesión para comprar" : "Añadir al carrito"}>
                {added ? "✓" : "+"}
              </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
