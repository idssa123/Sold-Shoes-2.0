import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";

const BRANDS  = ["Nike","Adidas","Puma","Reebok","Vans","Converse","Zara","H&M","Mango","Bershka"];
const SIZES   = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42"];
const PRICE_RANGES = [
  { label: "€0 - €50",   min: 0,   max: 50  },
  { label: "€50 - €100", min: 50,  max: 100 },
  { label: "€100 - €150",min: 100, max: 150 },
  { label: "€150+",      min: 150, max: 9999},
];
const CATS = ["Chaquetas","Sudaderas","Pantalones","Camisetas","Camisas","Vestidos","Calzado","Accesorios","Abrigos"];
const SORTS = [{v:"newest",l:"Más recientes"},{v:"price-asc",l:"Precio ↑"},{v:"price-desc",l:"Precio ↓"},{v:"name",l:"Nombre A-Z"}];
const PAGE_SIZE = 9;

export default function Products() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [sort,     setSort]     = useState("newest");

  
  const [selBrands,    setSelBrands]    = useState([]);
  const [selSizes,     setSelSizes]     = useState([]);
  const [selPriceIdxs, setSelPriceIdxs]= useState([]);
  const [selCats,      setSelCats]      = useState([]);
  const [search,       setSearch]       = useState(sp.get("q") || "");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => { setSearch(sp.get("q") || ""); setPage(1); }, [sp]);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  const filtered = useMemo(() => {
    let r = [...products];
    if (search)             r = r.filter(p => `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(search.toLowerCase()));
    if (selBrands.length)   r = r.filter(p => selBrands.includes(p.brand));
    if (selSizes.length)    r = r.filter(p => selSizes.includes(p.size));
    if (selCats.length)     r = r.filter(p => selCats.includes(p.category));
    if (selPriceIdxs.length){
      r = r.filter(p => selPriceIdxs.some(i => p.price >= PRICE_RANGES[i].min && p.price <= PRICE_RANGES[i].max));
    }
    switch (sort) {
      case "price-asc":  r.sort((a,b) => a.price - b.price); break;
      case "price-desc": r.sort((a,b) => b.price - a.price); break;
      case "name":       r.sort((a,b) => a.name.localeCompare(b.name)); break;
    }
    return r;
  }, [products, search, selBrands, selSizes, selCats, selPriceIdxs, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const hasFilters = search || selBrands.length || selSizes.length || selCats.length || selPriceIdxs.length;

  const clearAll = () => {
    setSearch(""); setSelBrands([]); setSelSizes([]);
    setSelCats([]); setSelPriceIdxs([]); setSort("newest");
    setPage(1); setSp({});
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs">
        <Link to="/" className="px-3 py-1 rounded" style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)" }}>Inicio</Link>
        <span style={{ color: "var(--tx3)" }}>/</span>
        <span className="px-3 py-1 rounded font-bold" style={{ border: "1px solid var(--bdr2)", background: "var(--bg4)", color: "var(--tx)" }}>Productos</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-10 flex gap-5">

        {}
        <aside className="hidden lg:block flex-shrink-0" style={{ width: 200 }}>
          <div className="sticky top-20">

            {}
            <div className="px-3 py-2.5 rounded-t mb-3" style={{ background: "#000", border: "1px solid var(--bdr2)" }}>
              <span className="display text-base" style={{ color: "var(--tx)" }}>FILTROS</span>
            </div>

            {}
            <div className="mb-3">
              <input className="inp text-xs" placeholder="Buscar producto..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            {}
            <div className="mb-4">
              <span className="filter-hdr">MARCA</span>
              {BRANDS.map(b => (
                <label key={b} className="chk-row">
                  <input type="checkbox" checked={selBrands.includes(b)}
                    onChange={() => { toggle(selBrands, setSelBrands, b); setPage(1); }} />
                  <span>{b}</span>
                </label>
              ))}
            </div>

            {}
            <div className="mb-4">
              <span className="filter-hdr">TALLA</span>
              {SIZES.map(s => (
                <label key={s} className="chk-row">
                  <input type="checkbox" checked={selSizes.includes(s)}
                    onChange={() => { toggle(selSizes, setSelSizes, s); setPage(1); }} />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            {}
            <div className="mb-4">
              <span className="filter-hdr">PRECIO</span>
              {PRICE_RANGES.map((pr, i) => (
                <label key={pr.label} className="chk-row">
                  <input type="checkbox" checked={selPriceIdxs.includes(i)}
                    onChange={() => { toggle(selPriceIdxs, setSelPriceIdxs, i); setPage(1); }} />
                  <span>{pr.label}</span>
                </label>
              ))}
            </div>

            {}
            <div className="mb-4">
              <span className="filter-hdr">CATEGORÍA</span>
              {CATS.map(c => (
                <label key={c} className="chk-row">
                  <input type="checkbox" checked={selCats.includes(c)}
                    onChange={() => { toggle(selCats, setSelCats, c); setPage(1); }} />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            {}
            <button
              onClick={() => setPage(1)}
              className="btn w-full py-2.5 display text-sm"
              style={{ background: "#000", color: "#fff", border: "1px solid var(--bdr2)", borderRadius: 4 }}>
              APLICAR FILTROS
            </button>

            {hasFilters && (
              <button onClick={clearAll} className="btn btn-g w-full text-xs mt-2 py-1.5">
                Limpiar todo
              </button>
            )}
          </div>
        </aside>

        {}
        <div className="flex-1 min-w-0">

          {}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded text-xs" style={{ border: "1px solid var(--bdr)", color: "var(--tx2)", background: "var(--bg2)" }}>
              {loading ? "Cargando..." : `Mostrando ${Math.min((page-1)*PAGE_SIZE+1, filtered.length)}-${Math.min(page*PAGE_SIZE, filtered.length)} de ${filtered.length} productos`}
            </div>
            <div className="flex items-center gap-2">
              <select className="inp text-xs" style={{ width: "auto", height: 32 }}
                value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                {SORTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              {}
              <div className="h-8 w-8 rounded flex items-center justify-center"
                style={{ border: "1px solid var(--bdr2)", color: "var(--tx2)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </div>
            </div>
          </div>

          {}
          <div className="flex gap-2 mb-3 lg:hidden overflow-x-auto pb-1">
            <select className="inp text-xs flex-shrink-0" style={{ width: "auto" }}
              onChange={e => { toggle(selCats, setSelCats, e.target.value); setPage(1); }}>
              <option value="">Categoría</option>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="inp text-xs flex-shrink-0" style={{ width: "auto" }}
              onChange={e => { toggle(selBrands, setSelBrands, e.target.value); setPage(1); }}>
              <option value="">Marca</option>
              {BRANDS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          {}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_,i) => (
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

          {}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="px-3 py-1.5 rounded text-xs disabled:opacity-30"
                style={{ border:"1px solid var(--bdr2)", color:"var(--tx2)", background:"transparent" }}>‹</button>
              {[...Array(totalPages)].map((_,i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                  style={{
                    background: page===i+1 ? "var(--tx)" : "transparent",
                    color:      page===i+1 ? "#000"      : "var(--tx2)",
                    border:     `1px solid ${page===i+1 ? "var(--tx)" : "var(--bdr2)"}`,
                  }}>
                  {i+1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="px-3 py-1.5 rounded text-xs disabled:opacity-30"
                style={{ border:"1px solid var(--bdr2)", color:"var(--tx2)", background:"transparent" }}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
