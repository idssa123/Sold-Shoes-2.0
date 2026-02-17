
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <nav className="border-b border-red-600 bg-black">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Sold Shoes" className="h-10 w-auto" />
          <span className="text-lg font-bold text-red-600">SOLD SHOES</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-white">
          <Link className="hover:text-red-500" to="/">
            Inicio
          </Link>
          <Link className="hover:text-red-500" to="/products">
            Productos
          </Link>
          <Link className="hover:text-red-500" to="/cart">
            Carrito {count > 0 && `(${count})`}
          </Link>
          {user ? (
            <button
              type="button"
              className="hover:text-red-500"
              onClick={logout}
            >
              Salir
            </button>
          ) : (
            <>
              <Link className="hover:text-red-500" to="/login">
                Login
              </Link>
              <Link
                className="button-primary"
                to="/register"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
