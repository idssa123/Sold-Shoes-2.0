import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Cart() {
    const { user } = useAuth();
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();

    const formattedTotal = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(total);

    const handleRemove = (id) => {
        if (window.confirm("Eliminar este producto del carrito?")) {
            removeItem(id);
        }
    };

    if (!user) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-8">
                <div className="rounded-lg border border-red-600 bg-black p-8 text-center">
                    <p className="text-white">Debes iniciar sesion para ver el carrito.</p>
                    <Link to="/login" className="mt-4 inline-block button-primary">
                        Iniciar sesion
                    </Link>
                </div>
            </div>
        );
    }
    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-8">
                <p className="text-white">Tu carrito está vacío.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Carrito</h1>
                <button
                    type="button"
                    className="text-sm text-red-400 hover:underline"
                    onClick={clearCart}
                >
                    Vaciar carrito
                </button>
            </div>

            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border border-red-600 bg-black p-4"
                    >
                        <div className="relative" style={{ width: '80px', height: '80px' }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full rounded object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-white">{item.name}</h2>
                            <p className="text-sm text-gray-300">{item.price} EUR</p>
                        </div>
                        <input
                            className="w-16 rounded border border-red-600 bg-black px-2 py-1 text-center text-white"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                                updateQuantity(item.id, Number(event.target.value))
                            }
                        />
                        <button
                            type="button"
                            className="text-sm text-red-400 hover:underline"
                            onClick={() => handleRemove(item.id)}
                        >
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-red-600 bg-black p-4">
                <span className="text-white">Total</span>
                <span className="text-xl font-bold text-red-500">{formattedTotal}</span>
            </div>
        </div>
    );
}
