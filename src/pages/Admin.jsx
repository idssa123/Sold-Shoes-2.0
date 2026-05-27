import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, orderBy, query, getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";


const fmt = (n) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const CATS = [
  "Chaquetas","Sudaderas","Pantalones","Camisetas",
  "Camisas","Vestidos","Calzado","Accesorios","Abrigos",
];
const CONDITIONS = ["Como nueva","Excelente","Muy bueno","Bueno","Aceptable"];
const SIZES      = ["XS","S","M","L","XL","XXL","36","37","38","39","40","41","42","43","44"];
const STATUS_MAP = {
  pendiente: { label:"Pendiente",  bg:"rgba(234,179,8,.15)",   color:"#ca8a04"  },
  enviado:   { label:"Enviado",    bg:"rgba(59,130,246,.15)",  color:"#3b82f6"  },
  entregado: { label:"Entregado", bg:"rgba(34,197,94,.15)",   color:"#4ade80"  },
  cancelado: { label:"Cancelado", bg:"rgba(229,0,43,.15)",    color:"var(--red)"},
};

const EMPTY_PRODUCT = {
  name:"", brand:"", price:"", stock:"", size:"",
  category:"", condition:"", color:"", description:"", image:"", featured:false,
};


function StatCard({ icon, label, value, sub }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs mb-0.5" style={{ color:"var(--text-muted)" }}>{label}</p>
        <p className="text-xl font-bold" style={{ color:"var(--text)" }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color:"var(--text-light)" }}>{sub}</p>}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pendiente;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}


function ProductForm({ initial, onSave, onCancel, saving }) {
  const [f, setF] = useState(initial || EMPTY_PRODUCT);
  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setF((prev) => ({ ...prev, [k]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!f.name || !f.price || !f.stock) return alert("Nombre, precio y stock son obligatorios.");
    onSave({ ...f, price: parseFloat(f.price), stock: parseInt(f.stock, 10) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="lbl">Nombre *</label>
          <input className="inp" value={f.name} onChange={set("name")} required />
        </div>
        <div>
          <label className="lbl">Marca</label>
          <input className="inp" value={f.brand} onChange={set("brand")} />
        </div>
        <div>
          <label className="lbl">Precio (€) *</label>
          <input className="inp" type="number" min="0" step="0.01" value={f.price} onChange={set("price")} required />
        </div>
        <div>
          <label className="lbl">Stock *</label>
          <input className="inp" type="number" min="0" step="1" value={f.stock} onChange={set("stock")} required />
        </div>
        <div>
          <label className="lbl">Talla</label>
          <select className="inp" value={f.size} onChange={set("size")}>
            <option value="">— Seleccionar —</option>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Categoría</label>
          <select className="inp" value={f.category} onChange={set("category")}>
            <option value="">— Seleccionar —</option>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Estado / Condición</label>
          <select className="inp" value={f.condition} onChange={set("condition")}>
            <option value="">— Seleccionar —</option>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">Color</label>
          <input className="inp" value={f.color} onChange={set("color")} />
        </div>
        <div className="sm:col-span-2">
          <label className="lbl">URL de imagen</label>
          <input className="inp" type="url" value={f.image} onChange={set("image")} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="lbl">Descripción</label>
          <textarea className="inp" rows={3} value={f.description} onChange={set("description")} style={{ resize:"vertical" }} />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="featured" checked={f.featured} onChange={set("featured")}
            className="w-4 h-4 accent-red-600" />
          <label htmlFor="featured" className="text-sm cursor-pointer" style={{ color:"var(--text)" }}>
            Producto destacado (aparece en portada)
          </label>
        </div>
      </div>

      {}
      {f.image && (
        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background:"var(--bg3)", border:"1px solid var(--border)" }}>
          <img src={f.image} alt="preview" className="h-16 w-16 object-cover rounded"
            onError={(e) => { e.target.style.display="none"; }} />
          <p className="text-xs" style={{ color:"var(--text-muted)" }}>Vista previa de imagen</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" className="btn-outline flex-1" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </form>
  );
}


export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  
  const [tab, setTab]       = useState("dashboard"); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [modal, setModal]   = useState(null);   
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  
  const [orders, setOrders]   = useState([]);
  const [ordLoading, setOrdLoading] = useState(false);

  
  const [users, setUsers]     = useState([]);
  const [usrLoading, setUsrLoading] = useState(false);

  
  const [prodSearch, setProdSearch] = useState("");

  
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/");
        }
      } catch {
        navigate("/");
      } finally {
        setCheckingRole(false);
      }
    })();
  }, [user, authLoading]);

  
  useEffect(() => {
    if (!isAdmin) return;
    if (tab === "products" || tab === "dashboard") loadProducts();
    if (tab === "orders"   || tab === "dashboard") loadOrders();
    if (tab === "users"    || tab === "dashboard") loadUsers();
  }, [isAdmin, tab]);

  const loadProducts = async () => {
    setProdLoading(true);
    try {
      const q    = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setProdLoading(false); }
  };

  const loadOrders = async () => {
    setOrdLoading(true);
    try {
      const q    = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setOrdLoading(false); }
  };

  const loadUsers = async () => {
    setUsrLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setUsrLoading(false); }
  };

  
  const handleSaveProduct = async (data) => {
    setSaving(true);
    try {
      if (modal === "create") {
        
        await addDoc(collection(db, "products"), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        
        await updateDoc(doc(db, "products", modal.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      }
      setModal(null);
      await loadProducts();
    } catch (e) { alert("Error al guardar: " + e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDelConfirm(null);
    } catch (e) { alert("Error al eliminar: " + e.message); }
  };

  
  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) { alert("Error: " + e.message); }
  };

  
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`¿Cambiar rol a "${newRole}"?`)) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (e) { alert("Error: " + e.message); }
  };

  
  if (authLoading || checkingRole) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight:"60vh" }}>
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p style={{ color:"var(--text-muted)" }}>Verificando acceso…</p>
        </div>
      </div>
    );
  }
  if (!isAdmin) return null;

  
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "aceptado")
    .reduce((s, o) => s + (o.total || 0), 0);
  const lowStock = products.filter((p) => (p.stock ?? 0) <= 2);
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0);

  
  const filteredProds = prodSearch
    ? products.filter((p) =>
        `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(prodSearch.toLowerCase())
      )
    : products;

  const TABS = [
    { id:"dashboard", label:"Dashboard",  icon:"📊" },
    { id:"products",  label:"Productos",  icon:"👟" },
    { id:"orders",    label:"Pedidos",    icon:"📦" },
    { id:"users",     label:"Usuarios",   icon:"👥" },
  ];

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color:"var(--text)" }}>Panel de Administración</h1>
            <p className="text-sm" style={{ color:"var(--text-muted)" }}>SoldShoes · {user?.email}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background:"rgba(229,0,43,.15)", color:"var(--red)", border:"1px solid var(--red)" }}>
            ADMIN
          </span>
        </div>

        {}
        <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ background:"var(--bg2)", border:"1px solid var(--border)" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-sm font-medium transition-all"
              style={{
                background: tab === t.id ? "var(--red)" : "transparent",
                color:      tab === t.id ? "#fff"       : "var(--text-muted)",
              }}>
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon="💰" label="Ingresos totales" value={fmt(totalRevenue)}
                sub={`${orders.filter(o=>o.paymentStatus==="aceptado").length} pedidos aceptados`} />
              <StatCard icon="👟" label="Productos" value={products.length}
                sub={`${outOfStock.length} sin stock`} />
              <StatCard icon="📦" label="Pedidos" value={orders.length}
                sub={`${orders.filter(o=>o.status==="pendiente").length} pendientes`} />
              <StatCard icon="👥" label="Usuarios" value={users.length}
                sub={`${users.filter(u=>u.role==="admin").length} administradores`} />
            </div>

            {}
            {lowStock.length > 0 && (
              <div className="p-4 rounded-lg" style={{ background:"rgba(234,179,8,.1)", border:"1px solid rgba(234,179,8,.4)" }}>
                <p className="text-sm font-semibold mb-2" style={{ color:"#ca8a04" }}>
                  ⚠️ Productos con stock bajo (≤ 2 unidades)
                </p>
                <div className="flex flex-wrap gap-2">
                  {lowStock.map((p) => (
                    <button key={p.id} onClick={() => { setModal(p); setTab("products"); }}
                      className="text-xs px-2 py-1 rounded" style={{ background:"rgba(234,179,8,.2)", color:"#ca8a04" }}>
                      {p.name} ({p.stock})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {}
            <div className="card p-4">
              <h2 className="font-bold mb-3 text-sm" style={{ color:"var(--text)" }}>Últimos 5 pedidos</h2>
              {ordLoading ? <p className="text-sm" style={{ color:"var(--text-muted)" }}>Cargando…</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom:"1px solid var(--border)" }}>
                        {["ID","Usuario","Total","Estado","Fecha"].map(h => (
                          <th key={h} className="text-left py-2 pr-4 font-semibold"
                            style={{ color:"var(--text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0,5).map((o) => {
                        const date = o.createdAt?.toDate
                          ? o.createdAt.toDate().toLocaleDateString("es-ES")
                          : "—";
                        return (
                          <tr key={o.id} style={{ borderBottom:"1px solid var(--border)" }}>
                            <td className="py-2 pr-4 font-mono" style={{ color:"var(--text-muted)" }}>
                              #{o.id.slice(-6).toUpperCase()}
                            </td>
                            <td className="py-2 pr-4 truncate max-w-[140px]" style={{ color:"var(--text)" }}>
                              {o.userEmail}
                            </td>
                            <td className="py-2 pr-4 font-semibold" style={{ color:"var(--red)" }}>
                              {fmt(o.total)}
                            </td>
                            <td className="py-2 pr-4"><Badge status={o.status} /></td>
                            <td className="py-2" style={{ color:"var(--text-muted)" }}>{date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {tab === "products" && (
          <div className="space-y-4">
            {}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <input className="inp" style={{ maxWidth:260 }} placeholder="Buscar por nombre, marca..."
                value={prodSearch} onChange={(e) => setProdSearch(e.target.value)} />
              <button className="btn-primary flex items-center gap-2" onClick={() => setModal("create")}>
                <span className="text-lg leading-none">+</span> Nuevo producto
              </button>
            </div>

            {}
            {prodLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_,i) => <div key={i} className="card h-14 animate-pulse" />)}
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead style={{ borderBottom:"1px solid var(--border)" }}>
                      <tr>
                        {["Imagen","Nombre","Marca","Cat.","Talla","Precio","Stock","Destac.","Acciones"]
                          .map(h => (
                            <th key={h} className="text-left py-3 px-3 font-semibold"
                              style={{ color:"var(--text-muted)" }}>{h}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProds.map((p) => (
                        <tr key={p.id} style={{ borderBottom:"1px solid var(--border)" }}
                          className="hover:bg-opacity-50 transition-colors">
                          <td className="py-2 px-3">
                            <img src={p.image} alt={p.name}
                              className="h-10 w-10 object-cover rounded"
                              onError={(e) => { e.target.src=""; e.target.alt="?"; }} />
                          </td>
                          <td className="py-2 px-3 font-medium max-w-[150px] truncate"
                            style={{ color:"var(--text)" }}>{p.name}</td>
                          <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>{p.brand}</td>
                          <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>{p.category}</td>
                          <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>{p.size}</td>
                          <td className="py-2 px-3 font-bold" style={{ color:"var(--red)" }}>{fmt(p.price)}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold" style={{
                              color: p.stock === 0 ? "var(--red)" : p.stock <= 2 ? "#ca8a04" : "#4ade80"
                            }}>
                              {p.stock ?? 0}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {p.featured ? "⭐" : "—"}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex gap-1">
                              <button onClick={() => setModal(p)}
                                className="px-2 py-1 rounded text-xs font-medium transition-colors"
                                style={{ background:"rgba(59,130,246,.15)", color:"#60a5fa" }}>
                                Editar
                              </button>
                              <button onClick={() => setDelConfirm(p.id)}
                                className="px-2 py-1 rounded text-xs font-medium transition-colors"
                                style={{ background:"rgba(229,0,43,.15)", color:"var(--red)" }}>
                                Borrar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProds.length === 0 && !prodLoading && (
                    <p className="text-center py-8 text-sm" style={{ color:"var(--text-muted)" }}>
                      No hay productos{prodSearch ? " con ese criterio" : ""}.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {tab === "orders" && (
          <div className="space-y-3">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ borderBottom:"1px solid var(--border)" }}>
                    <tr>
                      {["ID","Usuario","Items","Total","Pago","Estado","Fecha","Cambiar estado"]
                        .map(h => (
                          <th key={h} className="text-left py-3 px-3 font-semibold"
                            style={{ color:"var(--text-muted)" }}>{h}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ordLoading
                      ? [...Array(5)].map((_,i) => (
                          <tr key={i}><td colSpan={8} className="py-3 px-3">
                            <div className="h-6 rounded animate-pulse" style={{ background:"var(--bg3)" }} />
                          </td></tr>
                        ))
                      : orders.map((o) => {
                          const date = o.createdAt?.toDate
                            ? o.createdAt.toDate().toLocaleDateString("es-ES")
                            : "—";
                          return (
                            <tr key={o.id} style={{ borderBottom:"1px solid var(--border)" }}>
                              <td className="py-2 px-3 font-mono" style={{ color:"var(--text-muted)" }}>
                                #{o.id.slice(-6).toUpperCase()}
                              </td>
                              <td className="py-2 px-3 max-w-[140px] truncate" style={{ color:"var(--text)" }}>
                                {o.userEmail}
                              </td>
                              <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>
                                {o.items?.length ?? 0}
                              </td>
                              <td className="py-2 px-3 font-bold" style={{ color:"var(--red)" }}>
                                {fmt(o.total)}
                              </td>
                              <td className="py-2 px-3">
                                <span style={{
                                  color: o.paymentStatus === "aceptado" ? "#4ade80"
                                       : o.paymentStatus === "rechazado" ? "var(--red)" : "#ca8a04"
                                }}>
                                  {o.paymentStatus === "aceptado" ? "✅"
                                   : o.paymentStatus === "rechazado" ? "❌" : "⏳"}
                                </span>
                              </td>
                              <td className="py-2 px-3"><Badge status={o.status} /></td>
                              <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>{date}</td>
                              <td className="py-2 px-3">
                                <select
                                  className="inp text-xs"
                                  style={{ width:"auto", height:28, padding:"0 6px" }}
                                  value={o.status}
                                  onChange={(e) => handleOrderStatus(o.id, e.target.value)}>
                                  <option value="pendiente">Pendiente</option>
                                  <option value="enviado">Enviado</option>
                                  <option value="entregado">Entregado</option>
                                  <option value="cancelado">Cancelado</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
                {!ordLoading && orders.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color:"var(--text-muted)" }}>
                    Aún no hay pedidos.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {}
        {tab === "users" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead style={{ borderBottom:"1px solid var(--border)" }}>
                  <tr>
                    {["Nombre","Email","Rol","Proveedor","Registrado","Acciones"]
                      .map(h => (
                        <th key={h} className="text-left py-3 px-3 font-semibold"
                          style={{ color:"var(--text-muted)" }}>{h}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {usrLoading
                    ? [...Array(4)].map((_,i) => (
                        <tr key={i}><td colSpan={6} className="py-3 px-3">
                          <div className="h-6 rounded animate-pulse" style={{ background:"var(--bg3)" }} />
                        </td></tr>
                      ))
                    : users.map((u) => {
                        const date = u.createdAt?.toDate
                          ? u.createdAt.toDate().toLocaleDateString("es-ES")
                          : "—";
                        return (
                          <tr key={u.id} style={{ borderBottom:"1px solid var(--border)" }}>
                            <td className="py-2 px-3 font-medium" style={{ color:"var(--text)" }}>
                              {u.name} {u.surname}
                            </td>
                            <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>{u.email}</td>
                            <td className="py-2 px-3">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: u.role === "admin" ? "rgba(229,0,43,.15)" : "rgba(59,130,246,.15)",
                                  color:      u.role === "admin" ? "var(--red)"          : "#60a5fa",
                                }}>
                                {u.role || "user"}
                              </span>
                            </td>
                            <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>
                              {u.provider || "email"}
                            </td>
                            <td className="py-2 px-3" style={{ color:"var(--text-muted)" }}>{date}</td>
                            <td className="py-2 px-3">
                              {u.id !== user.uid && (
                                <button onClick={() => handleToggleRole(u.id, u.role)}
                                  className="px-2 py-1 rounded text-xs font-medium"
                                  style={{ background:"rgba(234,179,8,.15)", color:"#ca8a04" }}>
                                  {u.role === "admin" ? "→ User" : "→ Admin"}
                                </button>
                              )}
                              {u.id === user.uid && (
                                <span className="text-xs" style={{ color:"var(--text-muted)" }}>Tú</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
              {!usrLoading && users.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color:"var(--text-muted)" }}>
                  No hay usuarios registrados.
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background:"rgba(0,0,0,.6)", backdropFilter:"blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="w-full max-w-2xl max-h-screen overflow-y-auto rounded-xl"
            style={{ background:"var(--bg2)", border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom:"1px solid var(--border)" }}>
              <h2 className="font-bold text-lg" style={{ color:"var(--text)" }}>
                {modal === "create" ? "Nuevo producto" : `Editar: ${modal.name}`}
              </h2>
              <button onClick={() => setModal(null)}
                className="text-xl leading-none transition-colors"
                style={{ color:"var(--text-muted)" }}>✕</button>
            </div>
            <div className="p-6">
              <ProductForm
                initial={modal !== "create" ? modal : null}
                onSave={handleSaveProduct}
                onCancel={() => setModal(null)}
                saving={saving}
              />
            </div>
          </div>
        </div>
      )}

      {}
      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background:"rgba(0,0,0,.6)" }}>
          <div className="w-full max-w-sm rounded-xl p-6 text-center"
            style={{ background:"var(--bg2)", border:"1px solid var(--border)" }}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-bold mb-2" style={{ color:"var(--text)" }}>¿Eliminar producto?</h3>
            <p className="text-sm mb-5" style={{ color:"var(--text-muted)" }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button className="btn-outline flex-1" onClick={() => setDelConfirm(null)}>Cancelar</button>
              <button className="btn-primary flex-1"
                style={{ background:"var(--red)" }}
                onClick={() => handleDeleteProduct(delConfirm)}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
