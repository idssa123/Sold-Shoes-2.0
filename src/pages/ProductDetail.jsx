import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { REMOVED_IDS } from "../lib/removedProducts";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const condMap = { "Como nueva":"b-green","Excelente":"b-blue","Muy bueno":"b-yellow","Bueno":"b-orange" };
const fmt = n => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n);

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem, items } = useCart();
  const { isFavorite, toggleFavorite, isInWishlist, toggleWishlist } = useFavorites();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [added,   setAdded]   = useState(false);

  const cartItem   = items.find(i => i.id === id);
  const fav        = product ? isFavorite(product.id) : false;
  const inWish     = product ? isInWishlist(product.id) : false;
  const outOfStock = product?.stock === 0;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (REMOVED_IDS.includes(id)) { setError("Producto no encontrado."); return; }
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) { setError("Producto no encontrado."); return; }
        setProduct({ id: snap.id, ...snap.data() });
      } catch { setError("No se pudo cargar el producto."); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="grid gap-8 md:grid-cols-2 animate-pulse">
        <div className="rounded-xl sk" style={{ paddingBottom:"100%", background:"var(--bg3)", position:"relative" }} />
        <div className="space-y-4 pt-4">
          {["30%","60%","40%","100%","70%"].map((w,i) => (
            <div key={i} className="h-4 rounded sk" style={{ background:"var(--bg3)", width:w }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="card p-6 text-sm" style={{ color:"var(--red)" }}>{error || "Producto no encontrado."}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {}
      <nav className="mb-6 text-xs flex items-center gap-1.5" style={{ color:"var(--tx2)" }}>
        <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
        <span style={{ color:"var(--tx3)" }}>›</span>
        <Link to="/products" className="hover:text-white transition-colors">Productos</Link>
        <span style={{ color:"var(--tx3)" }}>›</span>
        <span style={{ color:"var(--tx)" }}>{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">

        {}
        <div className="card overflow-hidden" style={{ padding:0 }}>
          <div className="relative" style={{ paddingBottom:"100%", background:"var(--bg3)" }}>
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {}
            <div className="absolute top-3 left-3">
              <span className={`badge ${condMap[product.condition] || "b-gray"}`}>
                {product.condition}
              </span>
            </div>

            {}
            {user && (
              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                title={fav ? "Quitar de favoritos" : "Añadir a favoritos"}
                className="absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: fav ? "var(--red)" : "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(6px)",
                  border: fav ? "none" : "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill={fav ? "#fff" : "none"} stroke={fav ? "#fff" : "#ccc"} strokeWidth="2.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            )}

            {}
            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background:"rgba(0,0,0,0.55)" }}>
                <span className="text-white font-semibold px-4 py-2 rounded-full" style={{ background:"rgba(0,0,0,0.7)" }}>Agotado</span>
              </div>
            )}
          </div>
        </div>

        {}
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color:"var(--red)" }}>{product.brand}</p>
          <h1 className="text-2xl font-bold mb-2" style={{ color:"var(--tx)" }}>{product.name}</h1>
          <p className="text-3xl font-bold mb-4" style={{ color:"var(--tx)" }}>{fmt(product.price)}</p>

          <p className="text-sm leading-relaxed mb-5" style={{ color:"var(--tx2)" }}>
            {product.description}
          </p>

          {}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              ["Talla",     product.size],
              ["Color",     product.color || "—"],
              ["Categoría", product.category],
              ["Stock",     product.stock > 0 ? `${product.stock} disponibles` : "Agotado"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg p-3" style={{ background:"var(--bg3)", border:"1px solid var(--bdr)" }}>
                <p className="text-xs mb-0.5" style={{ color:"var(--tx2)" }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color:"var(--tx)" }}>{value}</p>
              </div>
            ))}
          </div>

          {}
          {product.stock > 0 && product.stock <= 3 && (
            <p className="text-xs mb-3 font-medium" style={{ color:"#fbbf24" }}>
              ⚠️ Solo quedan {product.stock} unidades
            </p>
          )}

          {}
          <div className="flex flex-col gap-2">
            {outOfStock ? (
              <>
                <div className="rounded-lg p-3 text-center text-sm" style={{ background:"var(--bg3)", border:"1px solid var(--bdr)", color:"var(--tx2)" }}>
                  Este artículo está agotado
                </div>
                {user && (
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="btn w-full py-2.5"
                    style={{
                      background: inWish ? "var(--bg4)" : "var(--red-g)",
                      color:      inWish ? "var(--tx2)" : "var(--red)",
                      border:     `1px solid ${inWish ? "var(--bdr)" : "var(--bdr-r)"}`,
                    }}
                  >
                    {inWish
                      ? "⭐ Ya está en tu lista de deseos"
                      : "⭐ Añadir a lista de deseos"}
                  </button>
                )}
              </>
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="btn btn-p w-full py-3"
                  style={added ? { background:"#16a34a" } : {}}
                >
                  {added ? "✓ Añadido al carrito" : cartItem ? "Añadir otra unidad" : "Añadir al carrito"}
                </button>

                {cartItem && (
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="btn w-full py-2.5"
                    style={{ background:"var(--bg3)", color:"var(--tx)", border:"1px solid var(--bdr)" }}
                  >
                    Ver carrito ({cartItem.quantity} en carrito) →
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className="btn w-full py-2"
                  style={{
                    background: fav ? "var(--red-g)" : "transparent",
                    color:      fav ? "var(--red)"   : "var(--tx2)",
                    border:     `1px solid ${fav ? "var(--bdr-r)" : "var(--bdr)"}`,
                    fontSize: "0.75rem",
                  }}
                >
                  {fav ? "❤️ Guardado en favoritos" : "❤️ Añadir a favoritos"}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-p block w-full py-3 text-center">
                Inicia sesión para comprar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
