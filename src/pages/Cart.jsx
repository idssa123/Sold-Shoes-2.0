import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const fmt = n => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n);

export default function Cart() {
  const { user }   = useAuth();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate   = useNavigate();
  const [coupon,   setCoupon]   = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg,setCouponMsg]= useState("");

  if (!user) return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="card p-10" style={{ borderRadius: 6 }}>
        <p className="font-semibold mb-4" style={{color:"var(--tx)"}}>Inicia sesión para ver tu carrito</p>
        <Link to="/login" className="btn btn-p">Iniciar sesión</Link>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="card p-10" style={{ borderRadius: 6 }}>
        <div className="text-5xl mb-4">🛒</div>
        <p className="font-semibold mb-2" style={{color:"var(--tx)"}}>Tu carrito está vacío</p>
        <Link to="/products" className="btn btn-p mt-4 block w-full">Ver productos</Link>
      </div>
    </div>
  );

  const applyCoupon = () => {
    const code = coupon.toUpperCase().trim();
    if (code === "SOLD2025") {
      setDiscount(total * 0.1);
      setCouponMsg("10% de descuento aplicado ✓");
    } else if (code === "BIENVENIDA") {
      setDiscount(total * 0.15);
      setCouponMsg("15% de descuento de bienvenida aplicado ✓");
    } else {
      setDiscount(0);
      setCouponMsg("Código no válido");
    }
  };

  const shipping   = (total - discount) > 50 ? 0 : 5.00;
  const iva        = (total - discount + shipping) * 0.21;
  const grandTotal = total - discount + shipping;

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">

        {/* Título — caja negra como wireframe */}
        <div className="inline-block mb-6 px-4 py-2 rounded" style={{ background:"var(--bg3)", border:"1px solid var(--bdr2)" }}>
          <h1 className="display text-2xl" style={{ color:"var(--tx)" }}>CARRITO DE COMPRAS</h1>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">

          {/* ── LISTA ARTÍCULOS ── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="rounded overflow-hidden" style={{ border:"1px solid var(--bdr2)", background:"var(--bg2)" }}>
                <div className="flex gap-3 p-3">
                  {/* IMG placeholder como wireframe */}
                  <div className="flex-shrink-0 rounded flex items-center justify-center text-xs font-bold"
                    style={{ width:100, height:90, background:"var(--bg3)", border:"1px solid var(--bdr)", color:"var(--tx3)" }}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Nombre + talla + color */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-1 text-xs font-bold rounded"
                        style={{ background:"var(--bg3)", border:"1px solid var(--bdr2)", color:"var(--tx)" }}>
                        {item.name}
                      </span>
                      <span className="px-2 py-1 text-xs rounded"
                        style={{ border:"1px solid var(--bdr)", color:"var(--tx2)" }}>
                        Talla: {item.size || "—"}
                      </span>
                      <span className="px-2 py-1 text-xs rounded"
                        style={{ border:"1px solid var(--bdr)", color:"var(--tx2)" }}>
                        Color: Negro
                      </span>
                    </div>

                    {/* Estado stock */}
                    <div className="mb-2">
                      <span className="px-2 py-0.5 text-xs rounded"
                        style={{ background:"rgba(34,197,94,.1)", color:"#4ade80", border:"1px solid rgba(34,197,94,.2)" }}>
                        Stock disponible
                      </span>
                    </div>

                    {/* Stepper + precio + eliminar */}
                    <div className="flex items-center gap-2">
                      {/* Stepper — igual al wireframe */}
                      <button type="button"
                        onClick={() => item.quantity>1 ? updateQuantity(item.id,item.quantity-1) : removeItem(item.id)}
                        className="h-7 w-7 flex items-center justify-center font-bold rounded text-sm"
                        style={{ border:"1px solid var(--bdr2)", background:"var(--bg3)", color:"var(--tx)" }}>−</button>
                      <div className="h-7 min-w-7 px-2 flex items-center justify-center text-sm font-bold rounded"
                        style={{ border:"1px solid var(--bdr2)", background:"var(--bg4)", color:"var(--tx)" }}>
                        {item.quantity}
                      </div>
                      <button type="button"
                        onClick={() => { const mx=item.stock??99; if(item.quantity<mx) updateQuantity(item.id,item.quantity+1); }}
                        className="h-7 w-7 flex items-center justify-center font-bold rounded text-sm"
                        style={{ border:"1px solid var(--bdr2)", background:"var(--bg3)", color:"var(--tx)" }}>+</button>

                      {/* Precio total item */}
                      <div className="px-3 py-1.5 rounded text-sm font-bold ml-1"
                        style={{ border:"1px solid var(--bdr2)", background:"var(--bg3)", color:"var(--tx)" }}>
                        {fmt(item.price * item.quantity)}
                      </div>

                      {/* Botón X eliminar */}
                      <button type="button" onClick={() => removeItem(item.id)}
                        className="h-7 w-7 flex items-center justify-center rounded font-bold text-sm"
                        style={{ border:"1px solid var(--bdr2)", background:"var(--bg3)", color:"var(--tx2)" }}>✕</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={() => navigate("/products")}
              className="btn btn-o text-xs px-4 py-2 mt-1">← Continuar comprando</button>
          </div>

          {/* ── RESUMEN DEL PEDIDO — exacto al wireframe ── */}
          <div className="lg:col-span-1">
            <div style={{ border:"1px solid var(--bdr2)", background:"var(--bg2)", borderRadius:6 }}>

              {/* Header negro */}
              <div className="px-4 py-3 rounded-t" style={{ background:"#000" }}>
                <h2 className="display text-base" style={{ color:"var(--tx)" }}>RESUMEN DEL PEDIDO</h2>
              </div>

              <div className="p-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-sm px-2 py-1 rounded" style={{ border:"1px solid var(--bdr)", color:"var(--tx2)" }}>Subtotal:</span>
                  <span className="text-sm font-bold px-3 py-1 rounded" style={{ border:"1px solid var(--bdr2)", color:"var(--tx)", background:"var(--bg3)" }}>{fmt(total)}</span>
                </div>

                {/* Envío */}
                <div className="flex justify-between items-center">
                  <span className="text-sm px-2 py-1 rounded" style={{ border:"1px solid var(--bdr)", color:"var(--tx2)" }}>Envío:</span>
                  <span className="text-sm font-bold px-3 py-1 rounded" style={{ border:"1px solid var(--bdr2)", color:"var(--tx)", background:"var(--bg3)" }}>
                    {shipping === 0 ? "Gratis" : fmt(shipping)}
                  </span>
                </div>

                {/* IVA */}
                <div className="flex justify-between items-center">
                  <span className="text-sm px-2 py-1 rounded" style={{ border:"1px solid var(--bdr)", color:"var(--tx2)" }}>IVA (21%):</span>
                  <span className="text-sm font-bold px-3 py-1 rounded" style={{ border:"1px solid var(--bdr2)", color:"var(--tx)", background:"var(--bg3)" }}>{fmt(iva)}</span>
                </div>

                <hr className="dvd" />

                {/* TOTAL */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm px-2 py-1 rounded" style={{ border:"1px solid var(--bdr2)", color:"var(--tx)", background:"var(--bg3)" }}>TOTAL:</span>
                  <span className="font-bold text-base px-3 py-1 rounded" style={{ background:"var(--red)", color:"#fff" }}>{fmt(grandTotal)}</span>
                </div>

                {/* Código descuento */}
                <div>
                  <p className="text-xs mb-1.5" style={{ color:"var(--tx2)" }}>Código de descuento:</p>
                  <div className="flex gap-2">
                    <input className="inp text-xs flex-1" placeholder="" value={coupon} onChange={e=>setCoupon(e.target.value)} />
                    <button type="button" onClick={applyCoupon}
                      className="btn text-xs px-3 py-1.5 font-bold flex-shrink-0"
                      style={{ background:"var(--red)", color:"#fff", borderRadius:4 }}>APLICAR</button>
                  </div>
                  {couponMsg && <p className="text-xs mt-1" style={{ color: couponMsg.includes("✓") ? "#4ade80" : "var(--red)" }}>{couponMsg}</p>}
                </div>

                {/* Botón proceder */}
                <button type="button" onClick={() => navigate("/checkout")}
                  className="btn w-full py-3 display text-base"
                  style={{ background:"#000", color:"#fff", border:"1px solid var(--bdr2)", borderRadius:4, letterSpacing:"0.05em" }}>
                  PROCEDER AL PAGO
                </button>
              </div>

              {/* Métodos de pago */}
              <div style={{ borderTop:"1px solid var(--bdr)", padding:"12px 16px" }}>
                <p className="text-xs mb-2" style={{ color:"var(--tx2)" }}>MÉTODOS DE PAGO:</p>
                <div className="flex gap-2 flex-wrap">
                  {["VISA","MAST","PAYL","APPL"].map(m => (
                    <div key={m} className="px-2 py-1 rounded text-xs font-bold"
                      style={{ border:"1px solid var(--bdr2)", color:"var(--tx2)", background:"var(--bg3)", fontSize:10 }}>{m}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
