import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { favCount } = useFavorites();
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const act = (p) => p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  return (
    <header style={{ background: "var(--bg2)", borderBottom: "1px solid var(--bdr)" }} className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-14 items-center gap-4">

        { }
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 px-3 flex items-center justify-center text-white font-bold rounded"
            style={{ background: "var(--bg3)", border: "1px solid var(--bdr2)", fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: "0.05em" }}>
            SOLD SHOES
          </div>
        </Link>

        { }
        <nav className="hidden md:flex items-center gap-2 ml-4">
          {[
            { to: "/", label: "Inicio" },
            { to: "/products", label: "Productos" },
            { to: "/contact", label: "Contacto" },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-4 py-1.5 text-xs font-medium rounded transition-all"
              style={{
                border: "1px solid var(--bdr2)",
                color: act(to) ? "#fff" : "var(--tx2)",
                background: act(to) ? "var(--bg4)" : "transparent",
              }}>
              {label}
            </Link>
          ))}

          { }
          {isAdmin && (
            <Link to="/admin"
              className="px-4 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5"
              style={{
                border: act("/admin") ? "1px solid var(--red)" : "1px solid var(--bdr-r)",
                color: act("/admin") ? "#fff" : "var(--red)",
                background: act("/admin") ? "var(--red)" : "var(--red-g)",
                letterSpacing: "0.04em",
              }}>
              ⚙️ Admin
            </Link>
          )}
        </nav>

        { }
        <form onSubmit={e => { e.preventDefault(); if (q.trim()) { navigate(`/products?q=${encodeURIComponent(q.trim())}`); setQ(""); } }}
          className="flex-1 max-w-sm mx-2 hidden sm:block" role="search" aria-label="Buscar productos">
          <label htmlFor="navSearch" className="sr-only">Buscar productos</label>
          <input id="navSearch" aria-label="Buscar productos" name="q" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar productos..."
            className="inp text-xs" style={{ height: 33 }} />
          <button type="submit" className="sr-only">Buscar</button>
        </form>

        { }
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

          {user ? (
            <div className="flex items-center gap-2">
              { }
              {favCount > 0 && (
                <Link to="/favorites" aria-label="Favoritos" className="relative h-9 w-9 rounded-full flex items-center justify-center transition-all"
                  style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-white flex items-center justify-center font-bold"
                    style={{ background: "var(--red)", fontSize: 9 }}>{favCount}</span>
                </Link>
              )}

              { }
              <div className="h-9 w-9 rounded-full flex items-center justify-center"
                style={{ border: `1px solid ${isAdmin ? "var(--red)" : "var(--bdr2)"}`, color: isAdmin ? "var(--red)" : "var(--tx2)" }}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <button onClick={logout} className="text-xs px-3 py-1.5 rounded"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)", background: "transparent" }}>
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full flex items-center justify-center"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)" }}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <Link to="/login" className="text-xs px-3 py-1.5 rounded"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)", background: "transparent" }}>
                Iniciar Sesión
              </Link>
              <Link to="/register" className="text-xs px-3 py-1.5 rounded"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)", background: "transparent" }}>
                Crear Cuenta
              </Link>
            </div>
          )}

          { }
          <Link to="/cart" aria-label="Carrito" className="relative h-9 w-9 rounded-full flex items-center justify-center transition-all"
            style={{ border: `1px solid ${count > 0 ? "var(--red)" : "var(--bdr2)"}`, color: count > 0 ? "var(--red)" : "var(--tx2)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ background: "var(--red)", fontSize: 9 }}>{count}</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
