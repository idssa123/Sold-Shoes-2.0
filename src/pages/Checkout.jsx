import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { decrementStock } from "../lib/productsApi";

const fmt = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const METHODS = [
  { id: "card",   label: "Tarjeta bancaria", icon: "💳" },
  { id: "paypal", label: "PayPal",           icon: "🅿️" },
  { id: "bizum",  label: "Bizum",            icon: "📱" },
];
const STEPS = ["Dirección", "Pago", "Confirmación"];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step,      setStep]      = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [payResult, setPayResult] = useState(null);
  const [orderId,   setOrderId]   = useState(null);

  const [addr, setAddr] = useState({
    name:"", surname:"", street:"", city:"", zip:"", phone:"",
  });
  const [method, setMethod] = useState("card");
  const [card,   setCard]   = useState({ number:"", name:"", expiry:"", cvv:"" });

  if (!user) return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="card p-8">
        <p className="font-semibold mb-4" style={{ color:"var(--text)" }}>Inicia sesión para continuar</p>
        <Link to="/login" className="btn-primary">Iniciar sesión</Link>
      </div>
    </div>
  );

  if (items.length === 0 && step !== 3) return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="card p-8">
        <p className="font-semibold mb-4" style={{ color:"var(--text)" }}>El carrito está vacío</p>
        <Link to="/products" className="btn-primary">Ver productos</Link>
      </div>
    </div>
  );

  const shipping   = total > 50 ? 0 : 3.99;
  const grandTotal = total + shipping;

  const step1 = () => {
    if (!addr.name || !addr.surname || !addr.street || !addr.city || !addr.zip) {
      setError("Completa todos los campos obligatorios."); return;
    }
    setError(""); setStep(2); window.scrollTo(0, 0);
  };

  const pay = async () => {
    if (method === "card" && (!card.number || !card.name || !card.expiry || !card.cvv)) {
      setError("Completa los datos de la tarjeta."); return;
    }
    setError(""); setLoading(true);

    try {
      
      const last   = card.number.replace(/\s/g, "").slice(-1);
      const result = (method === "card" && last === "0") ? "rechazado" : "aceptado";

      
      const orderRef = await addDoc(collection(db, "orders"), {
        userId:        user.uid,
        userEmail:     user.email,
        items:         items.map((i) => ({
          id:       i.id,
          name:     i.name,
          price:    i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
        })),
        total:         grandTotal,
        address:       addr,
        paymentMethod: method,
        paymentStatus: result,
        status:        result === "aceptado" ? "pendiente" : "cancelado",
        createdAt:     serverTimestamp(),
      });

      setOrderId(orderRef.id);
      setPayResult(result);

      if (result === "aceptado") {
        
        await decrementStock(items.map((i) => ({ id: i.id, quantity: i.quantity })));
        clearCart();
      }

      setStep(3);
      window.scrollTo(0, 0);
    } catch (e) {
      setError("Error al procesar. Inténtalo de nuevo.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4" style={{ color:"var(--text)" }}>FINALIZAR COMPRA</h1>
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: step > i+1 ? "#16a34a" : step === i+1 ? "var(--red)" : "var(--bg4)",
                    color:      step >= i+1 ? "#fff" : "var(--text-muted)",
                  }}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span className="text-xs font-medium"
                  style={{ color: step === i+1 ? "var(--text)" : "var(--text-muted)" }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px mx-2"
                  style={{ background: step > i+1 ? "#16a34a" : "var(--border)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background:"rgba(229,0,43,.15)", color:"var(--red)", border:"1px solid rgba(229,0,43,.3)" }}>
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">

          {}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-bold mb-4" style={{ color:"var(--text)" }}>Dirección de envío</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="lbl">Nombre *</label>
                  <input className="inp" value={addr.name}
                    onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">Apellidos *</label>
                  <input className="inp" value={addr.surname}
                    onChange={(e) => setAddr({ ...addr, surname: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="lbl">Dirección *</label>
                  <input className="inp" placeholder="Calle, número..."
                    value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">Ciudad *</label>
                  <input className="inp" value={addr.city}
                    onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">Código postal *</label>
                  <input className="inp" maxLength={5} value={addr.zip}
                    onChange={(e) => setAddr({ ...addr, zip: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="lbl">Teléfono</label>
                  <input type="tel" className="inp" value={addr.phone}
                    onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
                </div>
              </div>
              <button type="button" className="btn-primary mt-5 w-full py-2.5" onClick={step1}>
                Continuar al pago →
              </button>
            </div>
          )}

          {}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-bold mb-4" style={{ color:"var(--text)" }}>Método de pago</h2>
              <div className="grid gap-2 mb-4">
                {METHODS.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-all"
                    style={{
                      border:     method === m.id ? "1px solid var(--red)" : "1px solid var(--border)",
                      background: method === m.id ? "rgba(229,0,43,.08)" : "var(--bg3)",
                    }}>
                    <input type="radio" name="pay" value={m.id} checked={method === m.id}
                      onChange={() => setMethod(m.id)} className="hidden" />
                    <span>{m.icon}</span>
                    <span className="text-sm font-medium" style={{ color:"var(--text)" }}>{m.label}</span>
                    {method === m.id && (
                      <span className="ml-auto text-xs font-bold" style={{ color:"var(--red)" }}>✓</span>
                    )}
                  </label>
                ))}
              </div>

              {method === "card" && (
                <div className="space-y-3 mb-4 p-4 rounded-lg"
                  style={{ background:"var(--bg3)", border:"1px solid var(--border)" }}>
                  <div>
                    <label className="lbl">Número de tarjeta</label>
                    <input className="inp" placeholder="1234 5678 9012 3456" maxLength={19}
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim() })} />
                    <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>
                      Simulación: si termina en 0 el pago es rechazado
                    </p>
                  </div>
                  <div>
                    <label className="lbl">Nombre titular</label>
                    <input className="inp" placeholder="NOMBRE APELLIDO" value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="lbl">Caducidad</label>
                      <input className="inp" placeholder="MM/AA" maxLength={5} value={card.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g,"");
                          if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2,4);
                          setCard({ ...card, expiry: v });
                        }} />
                    </div>
                    <div>
                      <label className="lbl">CVV</label>
                      <input className="inp" placeholder="123" maxLength={3} value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g,"") })} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" className="btn-outline flex-1"
                  onClick={() => { setStep(1); setError(""); }}>← Volver</button>
                <button type="button" className="btn-primary flex-1 py-2.5" onClick={pay} disabled={loading}>
                  {loading ? "Procesando…" : `Pagar ${fmt(grandTotal)}`}
                </button>
              </div>
            </div>
          )}

          {}
          {step === 3 && (
            <div className="card p-8 text-center">
              {payResult === "aceptado" ? (
                <>
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color:"var(--text)" }}>
                    ¡PEDIDO CONFIRMADO!
                  </h2>
                  <p className="text-sm mb-2" style={{ color:"var(--text-muted)" }}>
                    Tu pago fue aceptado. Confirmación enviada a <strong>{user.email}</strong>.
                  </p>
                  {orderId && (
                    <p className="text-xs mb-6 font-mono" style={{ color:"var(--text-muted)" }}>
                      Nº pedido: #{orderId.slice(-8).toUpperCase()}
                    </p>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Link to="/orders" className="btn-primary">Ver mis pedidos</Link>
                    <Link to="/products" className="btn-outline">Seguir comprando</Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color:"var(--text)" }}>
                    PAGO RECHAZADO
                  </h2>
                  <p className="text-sm mb-6" style={{ color:"var(--text-muted)" }}>
                    No pudimos procesar el pago. Revisa los datos de tu tarjeta.
                  </p>
                  <button type="button" className="btn-primary"
                    onClick={() => { setStep(2); setPayResult(null); setError(""); }}>
                    Intentar de nuevo
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {}
        {step < 3 && (
          <div className="card p-4 h-fit sticky top-20">
            <h3 className="font-bold text-xs mb-3" style={{ color:"var(--text)" }}>TU PEDIDO</h3>
            <div className="space-y-2 mb-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <img src={item.image} alt={item.name}
                    className="h-10 w-10 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color:"var(--text)" }}>{item.name}</p>
                    <p className="text-xs" style={{ color:"var(--text-muted)" }}>×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color:"var(--text)" }}>
                    {fmt(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <hr style={{ borderColor:"var(--border)", marginBottom:12 }} />
            <div className="space-y-1 text-xs mb-3">
              <div className="flex justify-between">
                <span style={{ color:"var(--text-muted)" }}>Subtotal</span>
                <span style={{ color:"var(--text)" }}>{fmt(total)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color:"var(--text-muted)" }}>Envío</span>
                <span style={{ color: shipping === 0 ? "#4ade80" : "var(--text)" }}>
                  {shipping === 0 ? "Gratis" : fmt(shipping)}
                </span>
              </div>
            </div>
            <hr style={{ borderColor:"var(--border)", marginBottom:12 }} />
            <div className="flex justify-between font-bold text-sm">
              <span style={{ color:"var(--text)" }}>Total</span>
              <span style={{ color:"var(--red)" }}>{fmt(grandTotal)}</span>
            </div>
            {step === 2 && addr.street && (
              <div className="mt-3 text-xs p-2 rounded" style={{ background:"var(--bg3)", color:"var(--text-muted)" }}>
                📦 {addr.street}, {addr.city}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
