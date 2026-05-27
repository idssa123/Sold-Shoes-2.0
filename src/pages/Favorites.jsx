import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

const fmt = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);


function ProductMiniCard({ product, actionLabel, actionColor, onAction, secondLabel, onSecond }) {
  return (
    <div className="card card-h overflow-hidden flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        {}
        <div className="relative overflow-hidden" style={{ paddingBottom: "75%", background: "var(--bg3)" }}>
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <span className="text-white text-xs font-semibold">Agotado</span>
            </div>
          )}
        </div>

        {}
        <div className="p-3">
          <p className="text-xs font-medium mb-0.5" style={{ color: "var(--red)" }}>{product.brand}</p>
          <p className="text-sm font-semibold leading-snug line-clamp-2 mb-1" style={{ color: "var(--tx)" }}>
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold" style={{ color: "var(--tx)" }}>{fmt(product.price)}</span>
            <span className="text-xs" style={{ color: "var(--tx2)" }}>Talla {product.size}</span>
          </div>
        </div>
      </Link>

      {}
      <div className="px-3 pb-3 flex flex-col gap-2 mt-auto">
        <button
          type="button"
          onClick={onAction}
          className="btn w-full text-xs py-2"
          style={{ background: actionColor || "var(--red)", color: "#fff" }}
        >
          {actionLabel}
        </button>
        {secondLabel && (
          <button
            type="button"
            onClick={onSecond}
            className="btn w-full text-xs py-1.5"
            style={{ background: "transparent", color: "var(--tx2)", border: "1px solid var(--bdr)" }}
          >
            {secondLabel}
          </button>
        )}
      </div>
    </div>
  );
}


export default function Favorites() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const {
    favorites, wishlist, loading,
    toggleFavorite, toggleWishlist,
  } = useFavorites();

  const [tab, setTab] = useState("favorites");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="card p-10">
          <div className="text-5xl mb-4">🔐</div>
          <p className="font-semibold mb-4" style={{ color: "var(--tx)" }}>
            Inicia sesión para ver tus favoritos
          </p>
          <Link to="/login" className="btn btn-p">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  const list = tab === "favorites" ? favorites : wishlist;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {}
      <div className="mb-6">
        <h1 className="display text-3xl mb-1" style={{ color: "var(--tx)" }}>
          {tab === "favorites" ? "MIS FAVORITOS" : "LISTA DE DESEOS"}
        </h1>
        <p className="text-sm" style={{ color: "var(--tx2)" }}>
          {tab === "favorites"
            ? "Productos que has marcado como favoritos"
            : "Productos agotados que quieres cuando vuelvan a estar disponibles"}
        </p>
      </div>

      {}
      <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid var(--bdr)" }}>
        {[
          { key: "favorites", label: "Favoritos", count: favorites.length },
          { key: "wishlist",  label: "Lista de deseos", count: wishlist.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor: tab === key ? "var(--red)" : "transparent",
              color: tab === key ? "var(--red)" : "var(--tx2)",
              background: "transparent",
            }}
          >
            {label}
            <span
              className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{
                background: tab === key ? "var(--red-g)" : "var(--bg4)",
                color: tab === key ? "var(--red)" : "var(--tx3)",
              }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card overflow-hidden sk">
              <div style={{ paddingBottom: "75%", background: "var(--bg3)" }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded" style={{ background: "var(--bg4)", width: "50%" }} />
                <div className="h-4 rounded" style={{ background: "var(--bg4)", width: "80%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">{tab === "favorites" ? "❤️" : "⭐"}</div>
          <p className="font-semibold mb-2" style={{ color: "var(--tx)" }}>
            {tab === "favorites" ? "Aún no tienes favoritos" : "Tu lista de deseos está vacía"}
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--tx2)" }}>
            {tab === "favorites"
              ? "Marca productos con ❤️ desde el catálogo para guardarlos aquí"
              : "Cuando un producto esté agotado podrás añadirlo aquí para recordarlo"}
          </p>
          <Link to="/products" className="btn btn-p">Explorar catálogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((product) =>
            tab === "favorites" ? (
              <ProductMiniCard
                key={product.id}
                product={product}
                actionLabel={product.stock > 0 ? "Añadir al carrito" : "Agotado"}
                actionColor={product.stock > 0 ? "var(--red)" : "var(--bg4)"}
                onAction={() => product.stock > 0 && addItem(product)}
                secondLabel="Quitar de favoritos ❤️"
                onSecond={() => toggleFavorite(product)}
              />
            ) : (
              <ProductMiniCard
                key={product.id}
                product={product}
                actionLabel={product.stock > 0 ? "Ahora disponible → Comprar" : "Aún agotado"}
                actionColor={product.stock > 0 ? "#16a34a" : "var(--bg4)"}
                onAction={() => product.stock > 0 && addItem(product)}
                secondLabel="Quitar de la lista ⭐"
                onSecond={() => toggleWishlist(product)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}


import { useState } from "react";
