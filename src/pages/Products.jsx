import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { products as localProducts } from "../data/products";
import { REMOVED_IDS, REMOVED_NAMES } from "../lib/removedProducts";
import ProductCard from "../components/ProductCard";

// Filter helpers
const CATS = ["Chaquetas", "Sudaderas", "Pantalones", "Camisetas", "Camisas", "Vestidos", "Calzado", "Accesorios", "Abrigos"];
const SORTS = [{ v: "newest", l: "Más recientes" }, { v: "price-asc", l: "Precio ↑" }, { v: "price-desc", l: "Precio ↓" }, { v: "name", l: "Nombre A-Z" }];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Negro", "Blanco", "Azul", "Rojo", "Verde", "Gris"];
const PAGE_SIZE = 9;

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const [selBrands, setSelBrands] = useState([]);
  const [selSizes, setSelSizes] = useState([]);
  const [selPriceIdxs, setSelPriceIdxs] = useState([]);
  const [selCats, setSelCats] = useState([]);
  const [search, setSearch] = useState(sp.get("q") || "");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(200);
  const [selColor, setSelColor] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (!db) {
          setProducts(localProducts.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
        } else {
          const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
        }
      } catch (e) {
        console.error(e);
        setProducts(localProducts.filter(p => !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)));
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => { setSearch(sp.get("q") || ""); setPage(1); }, [sp]);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  const filtered = useMemo(() => {
    let r = [...products];
    if (search) r = r.filter(p => `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(search.toLowerCase()));
    if (selBrands.length) r = r.filter(p => selBrands.includes(p.brand));
    if (selSizes.length) r = r.filter(p => selSizes.includes(p.size));
    if (selCats.length) r = r.filter(p => selCats.includes(p.category));
    if (priceMin !== null && priceMax !== null) r = r.filter(p => p.price >= priceMin && p.price <= priceMax);
    if (selColor) r = r.filter(p => p.color && p.color.toLowerCase().includes(selColor.toLowerCase()));
    switch (sort) {
      case "price-asc": r.sort((a, b) => a.price - b.price); break;
      case "price-desc": r.sort((a, b) => b.price - a.price); break;
      case "name": r.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return r;
  }, [products, search, selBrands, selSizes, selCats, selPriceIdxs, priceMin, priceMax, selColor, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!(search || selBrands.length || selSizes.length || selCats.length || selPriceIdxs.length || selColor || priceMin > 0 || priceMax < 200);

  const clearAll = () => {
    setSearch(""); setSelBrands([]); setSelSizes([]);
    setSelCats([]); setSelPriceIdxs([]); setPriceMin(0); setPriceMax(200); setSelColor(""); setSort("newest");
    setPage(1); setSp({});
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs">
        <Link to="/" className="px-3 py-1 rounded" style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)" }}>Inicio</Link>
        <span style={{ color: "var(--tx3)" }}>/</span>
        <span className="px-3 py-1 rounded font-bold" style={{ border: "1px solid var(--bdr2)", background: "var(--bg4)", color: "var(--tx)" }}>Productos</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-10 flex gap-5">

        {/* Sidebar filtros */}
        <aside className="hidden lg:block flex-shrink-0" style={{ width: 240 }}>
          <div className="sticky top-20">

            <div className="px-3 py-2 rounded-t mb-3" style={{ background: "#000", border: "1px solid var(--bdr2)" }}>
              <span className="display text-sm" style={{ color: "var(--tx)" }}>FILTROS</span>
            </div>

            {/* Buscador */}
            <div className="mb-4">
              <label htmlFor="searchProducts" className="sr-only">Buscar productos</label>
              <input id="searchProducts" aria-label="Buscar productos" className="inp text-xs w-full" placeholder="Buscar en resultados..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            {/* Categoría */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="filter-hdr" style={{ fontSize: "0.8rem" }}>Categoría</span>
              </div>
              <div className="mt-2 space-y-2">
                {CATS.slice(0, 6).map(c => (
                  <label key={c} className="flex items-center gap-2 text-sm chk-row hit-area"
                    aria-checked={selCats.includes(c)} role="checkbox" tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { toggle(selCats, setSelCats, c); setPage(1); e.preventDefault(); } }}>
                    <input type="checkbox" aria-label={`Filtrar por ${c}`} checked={selCats.includes(c)}
                      onChange={() => { toggle(selCats, setSelCats, c); setPage(1); }} />
                    <span>{c}</span>
                  </label>
                ))}
                <details>
                  <summary className="text-xs text-gray-400 cursor-pointer">Ver más</summary>
                  <div className="mt-2 space-y-2">
                    {CATS.slice(6).map(c => (
                      <label key={c} className="flex items-center gap-2 text-sm chk-row hit-area"
                        aria-checked={selCats.includes(c)} role="checkbox" tabIndex={0}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { toggle(selCats, setSelCats, c); setPage(1); e.preventDefault(); } }}>
                        <input type="checkbox" aria-label={`Filtrar por ${c}`} checked={selCats.includes(c)}
                          onChange={() => { toggle(selCats, setSelCats, c); setPage(1); }} />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>
            </div>

            {/* Rango de precio */}
            <div className="mb-4">
              <span className="filter-hdr" style={{ fontSize: "0.8rem" }}>Rango de Precio</span>
              <div className="mt-3 px-1">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>0€</span>
                  <div className="flex-1">
                    <label htmlFor="priceMin" className="sr-only">Precio mínimo</label>
                    <input id="priceMin" type="range" min={0} max={200} value={priceMin}
                      aria-label="Precio mínimo" aria-valuemin={0} aria-valuemax={200} aria-valuenow={priceMin}
                      onChange={e => { const v = Number(e.target.value); setPriceMin(Math.min(v, priceMax)); setPage(1); }} />
                    <label htmlFor="priceMax" className="sr-only">Precio máximo</label>
                    <input id="priceMax" type="range" min={0} max={200} value={priceMax}
                      aria-label="Precio máximo" aria-valuemin={0} aria-valuemax={200} aria-valuenow={priceMax}
                      onChange={e => { const v = Number(e.target.value); setPriceMax(Math.max(v, priceMin)); setPage(1); }} />
                  </div>
                  <span>200€</span>
                </div>
                <div className="mt-2 text-xs" style={{ color: "var(--tx2)" }}>Seleccionado: {priceMin}€ - {priceMax}€</div>
              </div>
            </div>

            {/* Talla */}
            <div className="mb-4">
              <span className="filter-hdr" style={{ fontSize: "0.8rem" }}>Talla</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => { toggle(selSizes, setSelSizes, s); setPage(1); }}
                    aria-pressed={selSizes.includes(s)} aria-label={`Talla ${s}`}
                    className={`px-2 py-2 text-xs border rounded ${selSizes.includes(s) ? "bg-[var(--tx)] text-black" : "bg-transparent"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-4">
              <span className="filter-hdr" style={{ fontSize: "0.8rem" }}>Color</span>
              <div className="mt-2">
                <select className="inp text-xs w-full" value={selColor} onChange={e => { setSelColor(e.target.value); setPage(1); }}>
                  <option value="">Cualquiera</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={() => setPage(1)}
              className="w-full py-2 text-sm font-semibold"
              style={{ background: "#f25a66", color: "#fff", border: "1px solid #ef4b5a", borderRadius: 6 }}>
              Aplicar Filtros
            </button>

            {hasFilters && (
              <button onClick={clearAll} className="btn btn-g w-full text-xs mt-2 py-1.5">
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* Grid productos */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded text-xs" style={{ border: "1px solid var(--bdr)", color: "var(--tx2)", background: "var(--bg2)" }}>
              {loading ? "Cargando..." : `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} productos`}
            </div>
            <div className="flex items-center gap-2">
              <select className="inp text-xs" style={{ width: "auto", height: 32 }}
                value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                {SORTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              <div className="h-8 w-8 rounded flex items-center justify-center"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile filters */}
          <div className="flex gap-2 mb-3 lg:hidden overflow-x-auto pb-1">
            <select className="inp text-xs flex-shrink-0" style={{ width: "auto" }}
              onChange={e => { toggle(selCats, setSelCats, e.target.value); setPage(1); }}>
              <option value="">Categoría</option>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card sk" style={{ borderRadius: 4 }}>
                  <div style={{ paddingBottom: "80%", background: "var(--bg3)" }} />
                  <div className="p-3 space-y-2">
                    <div className="h-6 rounded" style={{ background: "var(--bg4)" }} />
                    <div className="h-5 rounded" style={{ background: "var(--bg3)" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="card p-10 text-center" style={{ borderRadius: 6 }}>
              <p className="mb-2" style={{ color: "var(--tx)" }}>Sin resultados</p>
              {hasFilters && <button onClick={clearAll} className="btn btn-o mt-3">Limpiar filtros</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 fu">
              {paginated.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded text-xs disabled:opacity-30"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)", background: "transparent" }}>‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  style={{
                    background: page === i + 1 ? "var(--tx)" : "transparent",
                    color: page === i + 1 ? "#000" : "var(--tx2)",
                    border: `1px solid ${page === i + 1 ? "var(--tx)" : "var(--bdr2)"}`,
                  }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded text-xs disabled:opacity-30"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)", background: "transparent" }}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
