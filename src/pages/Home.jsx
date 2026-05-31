import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { seedProducts } from "../lib/seedProducts";
import ProductCard from "../components/ProductCard";
import Carousel from "../components/Carousel";
import { products as localProducts } from "../data/products";
import { REMOVED_IDS, REMOVED_NAMES } from "../lib/removedProducts";

const PAGE = 4;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [dot, setDot] = useState(0);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSeed = async () => {
    if (!window.confirm("¿Cargar productos de ejemplo?")) return;
    setSeeding(true);
    try { await seedProducts(); await fetchProducts(); }
    catch { alert("Error. Revisa los permisos de Firestore."); }
    finally { setSeeding(false); }
  };

  const totalDots = Math.max(1, Math.ceil(products.length / PAGE));
  const visible = products.slice(dot * PAGE, dot * PAGE + PAGE);

  // Featured products come from the curated local list so removed items don't appear.
  const featuredList = localProducts.filter(p => p.featured && !REMOVED_IDS.includes(p.id) && !REMOVED_NAMES.includes(p.name)).slice(0, 8);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      <section style={{ background: "var(--bg2)", border: "1px solid var(--bdr)", margin: "16px", borderRadius: 6, overflow: "hidden", position: "relative", minHeight: 260 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(26,26,26,0.55) 0%, rgba(13,13,13,0.55) 100%), url('/img/sold shoes.PNG') center/cover no-repeat" }} />

        <div className="relative flex items-center h-full" style={{ padding: "48px 32px", minHeight: 260 }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-5 py-3 rounded" style={{ background: "#000", border: "1px solid var(--bdr2)" }}>
              <h1 className="display text-3xl sm:text-4xl" style={{ color: "var(--tx)", letterSpacing: "0.03em" }}>Vístete con Historia</h1>
              <p className="text-sm mt-1" style={{ color: "var(--tx2)", marginTop: 6 }}>Piezas únicas, estilo sostenible — encuentra tu próxima prenda con carácter.</p>
            </div>

            <div className="px-4 py-2 rounded" style={{ border: "1px solid var(--bdr2)", background: "transparent" }}>
              <span className="text-sm" style={{ color: "var(--tx2)" }}>Second Hand. First Style</span>
            </div>

            <Link to="/products"
              className="px-6 py-2.5 rounded font-bold text-sm display"
              style={{ background: "#000", color: "#fff", border: "1px solid var(--bdr2)", letterSpacing: "0.05em" }}>
              COMPRAR AHORA
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        <div className="flex items-center justify-between mb-4">
          <div className="px-4 py-2 rounded" style={{ background: "#000", border: "1px solid var(--bdr2)" }}>
            <h2 className="display text-lg" style={{ color: "var(--tx)" }}>PRODUCTOS DESTACADOS</h2>
          </div>
          <Link to="/products" className="btn btn-o text-xs px-4 py-2">Ver todos →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card sk" style={{ borderRadius: 4 }}>
                <div style={{ paddingBottom: "80%", background: "var(--bg3)" }} />
                <div className="p-3 space-y-2">
                  <div className="h-6 rounded" style={{ background: "var(--bg4)" }} />
                  <div className="h-5 rounded" style={{ background: "var(--bg3)" }} />
                  <div className="h-7 rounded" style={{ background: "var(--bg4)", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : featuredList.length === 0 ? (
          <div className="card p-12 text-center" style={{ borderRadius: 6 }}>
            <div className="text-5xl mb-4">👗</div>
            <p className="font-semibold mb-2" style={{ color: "var(--tx)" }}>No hay productos destacados</p>
            <p className="text-sm mb-5" style={{ color: "var(--tx2)" }}>Marca algunos productos como `featured` en `src/data/products.js`.</p>
          </div>
        ) : (
          <div>
            <Carousel items={featuredList} />
          </div>
        )}

        <footer className="mt-12 rounded-lg overflow-hidden" style={{ border: "1px solid var(--bdr2)", background: "var(--bg2)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              {
                title: "SOBRE NOSOTROS",
                links: ["Quiénes somos", "Nuestra historia", "Trabaja con nosotros"],
              },
              {
                title: "AYUDA",
                links: ["Envíos y devoluciones", "Preguntas frecuentes", "Contacto"],
              },
              {
                title: "REDES SOCIALES",
                links: ["Instagram", "Facebook", "Twitter"],
              },
            ].map((col, ci) => (
              <div key={col.title} style={{ borderRight: ci < 2 ? "1px solid var(--bdr)" : "none" }}>
                <div className="px-4 py-3" style={{ background: "#000" }}>
                  <h4 className="display text-sm" style={{ color: "var(--tx)" }}>{col.title}</h4>
                </div>
                <div className="p-3 space-y-2">
                  {col.links.map(link => (
                    <a key={link} href="#" aria-label={link} className="px-3 py-1.5 rounded inline-block"
                      style={{ border: "1px solid var(--bdr)", background: "transparent", cursor: "pointer", textDecoration: "none" }}>
                      <span className="text-xs" style={{ color: "var(--tx2)" }}>{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </footer>

        <p className="text-center text-xs mt-4 pb-4" style={{ color: "var(--tx3)" }}>
          © 2026 Sold Shoes 2.0
        </p>
      </div>
    </div>
  );
}
