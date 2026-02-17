import { Link } from "react-router-dom";

export default function ProductCard({ product, showLink = true }) {
    return (
        <article className="card">
            <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full rounded object-cover"
                />
                <span className="badge absolute left-2 top-2">
                    {product.condition}
                </span>
            </div>
            <div className="mt-3 space-y-2">
                <p className="text-xs text-red-400">
                    {product.brand}
                </p>
                <h3 className="text-base font-semibold text-white">{product.name}</h3>
                <p className="text-sm text-gray-300">
                    {product.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-red-500">
                        {product.price}€
                    </span>
                    {showLink && (
                        <Link to={`/products/${product.id}`} className="button-ghost">
                            Ver
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
