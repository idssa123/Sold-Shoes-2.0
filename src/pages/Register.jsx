import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialState = {
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthDate: "",
};

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState(initialState);
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
            await register({
                email: form.email,
                password: form.password,
                profile: {
                    username: form.username,
                    firstName: form.firstName,
                    lastName: form.lastName,
                    birthDate: form.birthDate,
                },
            });
            navigate("/");
        } catch (err) {
            setError("No se pudo registrar. Revisa los datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-6 py-8">
            <div className="rounded-lg border border-red-600 bg-black p-8">
                <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
                {error && (
                    <div className="mt-4 rounded border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}
                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm text-white">Usuario</label>
                        <input
                            className="input"
                            name="username"
                            required
                            value={form.username}
                            onChange={handleChange}
                        />
                    </div>
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
                        <label className="block text-sm text-white">Nombre</label>
                        <input
                            className="input"
                            name="firstName"
                            required
                            value={form.firstName}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white">Apellidos</label>
                        <input
                            className="input"
                            name="lastName"
                            required
                            value={form.lastName}
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
                            minLength={6}
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white">Fecha de nacimiento</label>
                        <input
                            className="input"
                            type="date"
                            name="birthDate"
                            required
                            value={form.birthDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="button-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Creando..." : "Crear cuenta"}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-sm text-white">
                    ¿Ya tienes cuenta?{" "}
                    <Link className="text-red-500 hover:underline" to="/login">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
