import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
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
                setError("No se pudieron cargar los productos.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filtered = () => {
        if (!search) return products;
        const queryText = search.toLowerCase();
        return products.filter((product) =>
            `${product.name} ${product.description}`
                .toLowerCase()
                .includes(queryText)
        );
    };

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Productos</h1>
                <p className="mt-2 text-gray-300">Explora todo nuestro catalogo</p>
            </div>

            <div className="mb-6">
                <input
                    className="input max-w-md"
                    placeholder="Buscar por nombre o descripcion..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-ember/50 bg-ember/10 p-4 text-sm text-ember">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-white">Cargando...</p>
            ) : filtered().length === 0 ? (
                <p className="text-white">No se encontraron productos.</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered().map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
