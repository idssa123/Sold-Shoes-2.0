import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const fmt = n => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n);

const STATUS = {
  pendiente:  { label:"Pendiente",  cls:"badge-yellow" },
  enviado:    { label:"Enviado",    cls:"badge-blue"   },
  entregado:  { label:"Entregado", cls:"badge-green"  },
  cancelado:  { label:"Cancelado", cls:"badge-red"    },
};
const PAYMENT = {
  aceptado:   { label:"Pagado",    cls:"badge-green" },
  rechazado:  { label:"Rechazado", cls:"badge-red"   },
  pendiente:  { label:"Pendiente", cls:"badge-yellow" },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const q = query(collection(db,"orders"), where("userId","==",user.uid), orderBy("createdAt","desc"));
        const snap = await getDocs(q);
        setOrders(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      } catch {  }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="card p-10">
        <p className="font-semibold mb-4" style={{ color:"var(--text)" }}>Inicia sesión para ver tus pedidos</p>
        <Link to="/login" className="btn-primary">Iniciar sesión</Link>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color:"var(--text)" }}>Mis pedidos</h1>
        <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>Historial de compras</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_,i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium mb-1" style={{ color:"var(--text)" }}>Aún no tienes pedidos</p>
          <p className="text-sm mb-5" style={{ color:"var(--text-muted)" }}>¡Empieza a explorar el catálogo!</p>
          <Link to="/products" className="btn-primary">Ver productos</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const date = order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleDateString("es-ES",{day:"2-digit",month:"long",year:"numeric"})
              : "—";
            const isOpen = expanded === order.id;
            const st = STATUS[order.status]   || STATUS.pendiente;
            const py = PAYMENT[order.paymentStatus] || PAYMENT.pendiente;

            return (
              <div key={order.id} className="card overflow-hidden">
                <button type="button" onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full text-left p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono" style={{ color:"var(--text-muted)" }}>#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                      <span className={`badge ${py.cls}`}>{py.label}</span>
                    </div>
                    <p className="text-xs" style={{ color:"var(--text-light)" }}>{date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color:"var(--red)" }}>{fmt(order.total)}</p>
                    <p className="text-xs" style={{ color:"var(--text-muted)" }}>{order.items?.length} art.</p>
                  </div>
                  <span className="text-sm ml-1 transition-transform inline-block" style={{ color:"var(--text-muted)", transform: isOpen?"rotate(180deg)":"none" }}>▾</span>
                </button>

                {isOpen && (
                  <div style={{ borderTop:"1px solid var(--border)" }} className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color:"var(--text)" }}>Artículos</p>
                        <div className="space-y-1.5">
                          {order.items?.map((item,i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span style={{ color:"var(--text-muted)" }}>{item.name} ×{item.quantity}</span>
                              <span style={{ color:"var(--text)" }}>{fmt(item.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color:"var(--text)" }}>Envío a</p>
                        {order.address ? (
                          <div className="text-xs space-y-0.5" style={{ color:"var(--text-muted)" }}>
                            <p>{order.address.name} {order.address.surname}</p>
                            <p>{order.address.street}</p>
                            <p>{order.address.zip} {order.address.city}</p>
                          </div>
                        ) : <p className="text-xs" style={{ color:"var(--text-muted)" }}>Sin datos</p>}
                      </div>
                    </div>
                    <hr className="divider my-3" />
                    <div className="flex justify-between text-xs">
                      <span style={{ color:"var(--text-muted)" }}>Método: {order.paymentMethod==="card"?"Tarjeta":order.paymentMethod==="paypal"?"PayPal":"Bizum"}</span>
                      <span className="font-bold" style={{ color:"var(--text)" }}>Total: {fmt(order.total)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
