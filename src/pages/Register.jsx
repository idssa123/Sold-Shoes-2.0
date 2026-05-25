import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", terms: false });
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const set = k => e => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.terms) { setError("Debes aceptar los términos."); return; }
    if (f.password !== f.confirm) { setError("Las contraseñas no coinciden."); return; }
    if (f.password.length < 6) { setError("Mínimo 6 caracteres."); return; }
    setError(""); setLoading(true);
    try {
      await register({ email: f.email, password: f.password, profile: { name: f.name } });
      setSuccess("✅ Cuenta creada. Revisa tu email para verificarla.");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Este email ya está registrado.");
      else setError("No se pudo crear la cuenta.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(""); setGLoading(true);
    try { await loginWithGoogle(); navigate("/"); }
    catch (err) { if (err.code !== "auth/popup-closed-by-user") setError("Error con Google."); }
    finally { setGLoading(false); }
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 56px)" }} className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded overflow-hidden" style={{ border: "1px solid var(--bdr2)", background: "var(--bg2)" }}>

          <div className="px-6 py-4 text-center" style={{ background: "#000" }}>
            <h1 className="display text-2xl" style={{ color: "var(--tx)" }}>CREAR CUENTA</h1>
          </div>

          <div className="p-6 space-y-4">
            {error && <div className="px-3 py-2 rounded text-xs" style={{ background: "rgba(229,0,43,.15)", color: "var(--red)", border: "1px solid var(--bdr-r)" }}>{error}</div>}
            {success && <div className="px-3 py-2 rounded text-xs" style={{ background: "rgba(34,197,94,.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,.3)" }}>{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="px-3 py-1.5 rounded-t text-xs" style={{ background: "var(--bg4)", border: "1px solid var(--bdr2)", borderBottom: "none", color: "var(--tx2)" }}>Nombre completo:</div>
                <input className="inp" style={{ borderRadius: "0 0 4px 4px", borderTop: "none" }} value={f.name} onChange={set("name")} required />
              </div>


              <div>
                <div className="px-3 py-1.5 rounded-t text-xs" style={{ background: "var(--bg4)", border: "1px solid var(--bdr2)", borderBottom: "none", color: "var(--tx2)" }}>Correo electrónico:</div>
                <input type="email" className="inp" style={{ borderRadius: "0 0 4px 4px", borderTop: "none" }} value={f.email} onChange={set("email")} required autoComplete="email" />
              </div>


              <div>
                <div className="px-3 py-1.5 rounded-t text-xs" style={{ background: "var(--bg4)", border: "1px solid var(--bdr2)", borderBottom: "none", color: "var(--tx2)" }}>Contraseña:</div>
                <input type="password" className="inp" style={{ borderRadius: "0 0 4px 4px", borderTop: "none" }} value={f.password} onChange={set("password")} required autoComplete="new-password" />
              </div>


              <div>
                <div className="px-3 py-1.5 rounded-t text-xs" style={{ background: "var(--bg4)", border: "1px solid var(--bdr2)", borderBottom: "none", color: "var(--tx2)" }}>Confirmar contraseña:</div>
                <input type="password" className="inp" style={{ borderRadius: "0 0 4px 4px", borderTop: "none" }} value={f.confirm} onChange={set("confirm")} required autoComplete="new-password" />
              </div>


              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={f.terms} onChange={set("terms")} style={{ width: 14, height: 14, accentColor: "var(--red)" }} />
                <span className="text-xs" style={{ color: "var(--tx2)" }}>Acepto los </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ border: "1px solid var(--bdr2)", color: "var(--tx)", background: "var(--bg4)" }}>términos y condiciones</span>
              </label>


              <button type="submit" disabled={loading}
                className="btn w-full py-3 display text-base"
                style={{ background: "#000", color: "#fff", border: "1px solid var(--bdr2)", borderRadius: 4, letterSpacing: "0.05em" }}>
                {loading ? "..." : "CREAR CUENTA"}
              </button>
            </form>



            <div className="relative">
              <hr className="dvd" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: "var(--bg2)", border: "1px solid var(--bdr2)", color: "var(--tx3)" }}>o</div>
            </div>


            <button type="button" className="btn w-full py-2.5 text-sm"
              style={{ background: "var(--bg3)", color: "var(--tx)", border: "1px solid var(--bdr2)", borderRadius: 4 }}>
              <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "#1877f2" }}>f</div>
              Registrarse con Facebook
            </button>


            <button type="button" onClick={handleGoogle} disabled={gLoading}
              className="btn w-full py-2.5 text-sm"
              style={{ background: "var(--bg3)", color: "var(--tx)", border: "1px solid var(--bdr2)", borderRadius: 4, opacity: gLoading ? 0.6 : 1 }}>
              {gLoading ? <span className="text-xs">Conectando...</span> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Registrarse con Google
                </>
              )}
            </button>


            <div className="flex items-center justify-between pt-1">
              <span className="text-xs px-2 py-1 rounded" style={{ border: "1px solid var(--bdr)", color: "var(--tx2)" }}>¿Ya tienes cuenta?</span>
              <Link to="/login" className="text-xs px-3 py-1.5 rounded font-bold"
                style={{ border: "1px solid var(--bdr2)", background: "var(--bg4)", color: "var(--tx)" }}>
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
