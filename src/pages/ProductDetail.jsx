import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addItem } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError("");
            try {
                const snapshot = await getDoc(doc(db, "products", id));
                if (!snapshot.exists()) {
                    setError("Producto no encontrado.");
                    setProduct(null);
                    return;
                }
                setProduct({ id: snapshot.id, ...snapshot.data() });
            } catch (err) {
                setError("No se pudo cargar el producto.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl px-6 pb-16 pt-10">
                <p className="text-sm text-white">Cargando producto...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-6 pb-16 pt-10">
                <div className="rounded-2xl border border-ember/50 bg-ember/10 px-4 py-3 text-sm text-ember">
                    {error}
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full rounded-lg object-cover"
                    />
                </div>
                <div>
                    <p className="text-sm text-red-400">{product.brand}</p>
                    <h1 className="mt-2 text-2xl font-bold text-white">{product.name}</h1>
                    <p className="mt-2 text-xl text-red-500">{product.price} EUR</p>
                    <p className="mt-4 text-white">{product.description}</p>
                    <div className="mt-6 space-y-2 text-sm text-white">
                        <p><strong>Talla:</strong> {product.size}</p>
                        <p><strong>Color:</strong> {product.color}</p>
                        <p><strong>Estado:</strong> {product.condition}</p>
                        <p><strong>Stock:</strong> {product.stock}</p>
                    </div>
                    {user ? (
                        <button
                            type="button"
                            className="button-primary mt-6 w-full"
                            onClick={() => addItem(product)}
                        >
                            Añadir al carrito
                        </button>
                    ) : (
                        <Link
                            className="button-primary mt-6 block w-full text-center"
                            to="/login"
                        >
                            Inicia sesión para comprar
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
