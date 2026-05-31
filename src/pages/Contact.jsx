import { useState } from "react";

const SUBJECTS = ["Pedido", "Devolución", "Envío", "Cuenta", "Otro"];
const FAQS = [
  {
    q: "¿Cuánto tarda el envío?",
    a: "Los envíos estándar tardan entre 2 y 4 días hábiles. También ofrecemos envío express en 24 horas con un coste adicional de 3,99 €.",
  },
  {
    q: "¿Puedo devolver un artículo?",
    a: "Sí, aceptamos devoluciones en los 30 días siguientes a la recepción. El artículo debe estar en las mismas condiciones en que se recibió.",
  },
  {
    q: "¿Cómo puedo seguir mi pedido?",
    a: "Una vez confirmado el pedido, recibirás un email con el número de seguimiento. También puedes consultarlo en 'Mis pedidos'.",
  },
  {
    q: "¿Los productos son auténticos?",
    a: "Verificamos todos los artículos antes de publicarlos. Cada producto incluye una descripción honesta de su estado para que puedas comprar con confianza.",
  },
];

export default function Contact() {
  const [form, setForm]       = useState({ name: "", surname: "", email: "", msg: "" });
  const [subject, setSubject] = useState("Pedido");
  const [openFaq, setOpenFaq] = useState(null);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.msg) {
      setError("Completa nombre, email y mensaje."); return;
    }
    setError("");
    // If there's no backend configured, open the user's email client with mailto as a fallback.
    try {
      const to = 'hola@soldshoes.com';
      const mailSubject = `${subject} - ${form.name}`;
      const body = `Nombre: ${form.name} ${form.surname}%0D%0AEmail: ${form.email}%0D%0A%0D%0A${encodeURIComponent(form.msg)}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(mailSubject)}&body=${body}`;
    } catch (err) {
      // ignore
    }
    setSent(true);
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 56px)" }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">

        {}
        <div className="text-center mb-10">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ background: "var(--bg3)", border: "1px solid var(--bdr2)", color: "var(--tx2)" }}
          >
            🎧 Soporte 24/7
          </span>
          <h1 className="display text-4xl sm:text-5xl mb-3" style={{ color: "var(--tx)" }}>
            ¿EN QUÉ PODEMOS AYUDARTE?
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--tx2)", lineHeight: 1.7 }}>
            Nuestro equipo está listo para resolver tus dudas sobre envíos, devoluciones o tu cuenta.
            Respondemos en menos de 24 horas.
          </p>
        </div>

        {}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "✉️", title: "Email", lines: ["hola@soldshoes.com"] },
            { icon: "📞", title: "Teléfono", lines: ["+34 91 234 56 78", "Lun–Vie 9h–18h"] },
            { icon: "📍", title: "Oficina", lines: ["Gran Vía 42", "Madrid, 28013"] },
          ].map((c) => (
            <div
              key={c.title}
              className="card text-center py-5 px-3"
            >
              <div
                className="text-2xl mb-3 mx-auto flex items-center justify-center rounded"
                style={{ width: 44, height: 44, background: "var(--bg3)", border: "1px solid var(--bdr)" }}
              >
                {c.icon}
              </div>
              <p className="text-xs font-bold mb-1 display tracking-widest" style={{ color: "var(--tx)" }}>
                {c.title.toUpperCase()}
              </p>
              {c.lines.map((l) => (
                <p key={l} className="text-xs" style={{ color: "var(--tx2)" }}>
                  {c.title === 'Email' ? (
                    <a href={`mailto:${l}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{l}</a>
                  ) : l}
                </p>
              ))}
            </div>
          ))}
        </div>

        {}
        <div className="card p-6 sm:p-8 mb-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="display text-2xl mb-2" style={{ color: "var(--tx)" }}>¡MENSAJE ENVIADO!</h2>
              <p className="text-sm" style={{ color: "var(--tx2)" }}>
                Gracias por contactarnos. Te responderemos en menos de 24 horas a{" "}
                <span style={{ color: "var(--red)" }}>{form.email}</span>.
              </p>
              <button
                className="btn btn-o mt-6 text-xs"
                onClick={() => { setSent(false); setForm({ name:"", surname:"", email:"", msg:"" }); }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="display text-2xl mb-1" style={{ color: "var(--tx)" }}>ENVÍANOS UN MENSAJE</h2>
              <p className="text-xs mb-6" style={{ color: "var(--tx2)" }}>
                Completa el formulario y te contestamos lo antes posible.
              </p>

              {error && (
                <div
                  className="text-xs px-3 py-2 rounded mb-4"
                  style={{ background: "var(--red-g)", border: "1px solid var(--bdr-r)", color: "var(--red)" }}
                >
                  {error}
                </div>
              )}

              {}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="lbl">Nombre *</label>
                  <input className="inp" placeholder="Tu nombre" value={form.name} onChange={set("name")} />
                </div>
                <div>
                  <label className="lbl">Apellidos</label>
                  <input className="inp" placeholder="Tus apellidos" value={form.surname} onChange={set("surname")} />
                </div>
              </div>

              {}
              <div className="mb-3">
                <label className="lbl">Correo electrónico *</label>
                <input type="email" className="inp" placeholder="tu@email.com" value={form.email} onChange={set("email")} />
              </div>

              {}
              <div className="mb-4">
                <label className="lbl">Asunto</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                      style={{
                        background:   subject === s ? "var(--red)"   : "var(--bg3)",
                        color:        subject === s ? "#fff"          : "var(--tx2)",
                        border:       subject === s ? "1px solid var(--red)" : "1px solid var(--bdr2)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="mb-6">
                <label className="lbl">Mensaje *</label>
                <textarea
                  className="inp"
                  rows={5}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  value={form.msg}
                  onChange={set("msg")}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--tx3)" }}>🔒 Tus datos están seguros</p>
                <button type="submit" className="btn btn-p px-6 py-2.5 text-sm">
                  Enviar mensaje →
                </button>
              </div>
            </form>
          )}
        </div>

        {}
        <div>
          <h2 className="display text-2xl mb-4" style={{ color: "var(--tx)" }}>
            PREGUNTAS FRECUENTES
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ background: "transparent", border: "none", cursor: "pointer" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--tx)" }}>{faq.q}</span>
                  <span
                    className="text-lg flex-shrink-0 ml-4 transition-transform"
                    style={{
                      color: "var(--tx3)",
                      display: "inline-block",
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    className="px-5 pb-4 text-sm"
                    style={{ color: "var(--tx2)", lineHeight: 1.7, borderTop: "1px solid var(--bdr)" }}
                  >
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
