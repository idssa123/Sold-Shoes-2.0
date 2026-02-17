
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import { db } from "../lib/firebase";
import { seedProducts } from "../lib/seedProducts";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  const featuredProducts = products.filter((product) => product.featured).slice(0, 6);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const productsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(productsQuery);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (err) {
      setError("No se pudieron cargar los productos. Revisa Firebase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSeed = async () => {
    const confirmed = window.confirm(
      "Se cargaran productos de ejemplo en Firestore. Quieres continuar?"
    );
    if (!confirmed) return;
    setSeeding(true);
    setError("");
    try {
      await seedProducts();
      await fetchProducts();
    } catch (err) {
      setError("No se pudo crear el seed. Revisa permisos en Firestore.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="Sold Shoes" className="mx-auto mb-4 h-24 w-auto" />
        <h1 className="text-4xl font-bold text-red-600">
          Sold Shoes
        </h1>
        <p className="mt-3 text-lg text-white">
          Ropa de segunda mano · Calidad garantizada
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="button-primary"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? "Cargando..." : "Cargar productos de ejemplo"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-ember/50 bg-ember/10 p-4 text-sm text-ember">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-white">Cargando productos...</p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-red-600 bg-black p-8 text-center text-white">
          No hay productos. Usa el boton de arriba para crear el seed.
        </div>
      ) : (
        <>
          {featuredProducts.length > 0 ? (
            <>
              <section className="mb-8">
                <Carousel items={featuredProducts} />
              </section>

              <section className="text-center">
                <p className="mb-6 text-lg text-white">
                  Descubre toda nuestra colección de ropa de segunda mano
                </p>
                <Link to="/products" className="button-primary">
                  Ver todos los productos
                </Link>
              </section>
            </>
          ) : (
            <div className="text-center text-white">
              No hay productos destacados disponibles
            </div>
          )}
        </>
      )}
    </div>
  );
}
