import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate("/");
        } catch (err) {
            setError("No se pudo iniciar sesion. Revisa tus datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md px-6 py-8">
            <div className="rounded-lg border border-red-600 bg-black p-8">
                <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
                {error && (
                    <div className="mt-4 rounded border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-white">Email</label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white">Contraseña</label>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type="submit"
                        className="button-primary w-full"
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
                <p className="mt-4 text-sm text-white">
                    ¿No tienes cuenta?{" "}
                    <Link className="text-red-500 hover:underline" to="/register">
                        Regístrate
                    </Link>
                </p>
            </div>
        </div>
    );
}
