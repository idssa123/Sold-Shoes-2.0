import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(email, password); navigate("/"); }
    catch (err) { setError(err?.message || "Email o contraseña incorrectos."); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(""); setGLoading(true);
    try { await loginWithGoogle(); navigate("/"); }
    catch (err) { if (err?.code !== "auth/popup-closed-by-user") setError(err?.message || "Error con Google. Inténtalo de nuevo."); }
    finally { setGLoading(false); }
  };

  return (
    <div style={{ background:"var(--bg)", minHeight:"calc(100vh - 56px)" }} className="flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded overflow-hidden" style={{ border:"1px solid var(--bdr2)", background:"var(--bg2)" }}>

          {}
          <div className="px-6 py-4 text-center" style={{ background:"#000" }}>
            <h1 className="display text-2xl" style={{ color:"var(--tx)" }}>INICIAR SESIÓN</h1>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="px-3 py-2 rounded text-xs" style={{ background:"rgba(229,0,43,.15)", color:"var(--red)", border:"1px solid var(--bdr-r)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {}
              <div>
                <div className="px-3 py-1.5 rounded-t text-xs" style={{ background:"var(--bg4)", border:"1px solid var(--bdr2)", borderBottom:"none", color:"var(--tx2)" }}>
                  Correo electrónico:
                </div>
                <input type="email" className="inp" style={{ borderRadius:"0 0 4px 4px", borderTop:"none" }}
                  placeholder="" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
              </div>

              {}
              <div>
                <div className="px-3 py-1.5 rounded-t text-xs" style={{ background:"var(--bg4)", border:"1px solid var(--bdr2)", borderBottom:"none", color:"var(--tx2)" }}>
                  Contraseña:
                </div>
                <input type="password" className="inp" style={{ borderRadius:"0 0 4px 4px", borderTop:"none" }}
                  placeholder="" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
              </div>

              {}
              <div className="text-right">
                <button type="button" className="text-xs px-2 py-1 rounded"
                  style={{ border:"1px solid var(--bdr)", color:"var(--tx2)", background:"transparent" }}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {}
              <button type="submit" disabled={loading}
                className="btn w-full py-3 display text-base"
                style={{ background:"#000", color:"#fff", border:"1px solid var(--bdr2)", borderRadius:4, letterSpacing:"0.05em" }}>
                {loading ? "..." : "INICIAR SESIÓN"}
              </button>
            </form>

            {}
            <div className="relative">
              <hr className="dvd" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center text-xs"
                style={{ background:"var(--bg2)", border:"1px solid var(--bdr2)", color:"var(--tx3)" }}>o</div>
            </div>

            {}
            <button type="button" className="btn w-full py-2.5 text-sm font-semibold"
              style={{ background:"var(--bg3)", color:"var(--tx)", border:"1px solid var(--bdr2)", borderRadius:4 }}>
              <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background:"#1877f2" }}>f</div>
              Continuar con Facebook
            </button>

            {}
            <button type="button" onClick={handleGoogle} disabled={gLoading}
              className="btn w-full py-2.5 text-sm font-semibold"
              style={{ background:"var(--bg3)", color:"var(--tx)", border:"1px solid var(--bdr2)", borderRadius:4, opacity: gLoading ? 0.6 : 1 }}>
              {gLoading ? (
                <span className="text-xs">Conectando...</span>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink:0 }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continuar con Google
                </>
              )}
            </button>

            {}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs px-2 py-1 rounded" style={{ border:"1px solid var(--bdr)", color:"var(--tx2)" }}>¿No tienes cuenta?</span>
              <Link to="/register" className="text-xs px-3 py-1.5 rounded font-bold"
                style={{ border:"1px solid var(--bdr2)", background:"var(--bg4)", color:"var(--tx)" }}>
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
