import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  Shield,
  ShieldCheck,
  Zap,
  Headphones,
  Bell,
  Eye,
  Send,
  Receipt,
  MoreHorizontal,
  Film,
  Landmark,
  ShoppingCart,
  CreditCard,
  ArrowLeftRight,
  PieChart,
  Wifi,
  Users,
  Smartphone,
  Lock,
  Star,
  TrendingUp,
  Wallet,
  Building2,
  Fingerprint,
  KeyRound,
  BellRing,
  MapPin,
  Heart,
  Compass,
  Sparkles,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  Check,
} from "lucide-react";
import InicioNavbar from "../components/InicioNavbar.jsx";
import "../assets/styles/inicio.css";

/*
  BANCHOCÓ BANK — página de inicio
  --------------------------------------------------
  Paleta: verde bosque (marca / navbar / CTA sólido) + dorado
  (CTA principal) + un verde lima como acento puntual ("ti",
  subrayado del logo, link "Ver todos").

  El mockup del teléfono es un "app dentro de la landing": misma
  jerarquía visual que ya usamos en Marea (saldo, accesos rápidos,
  movimientos), aquí adaptada a la marca Banchocó.

  Toques interactivos:
    - navbar propio con enlaces que bajan a las secciones de la página
    - entrada animada del hero (framer-motion)
    - teléfono con flotación suave e infinita
    - contador animado en la barra de estadísticas (cuenta al entrar en vista)
    - hover states en botones y tarjetas
*/

const TRUST_ITEMS = [
  { icon: Shield, title: "100% Seguro", text: "Protegemos tu información" },
  { icon: Zap, title: "Rápido y fácil", text: "Todo desde tu celular" },
  { icon: Headphones, title: "Soporte 24/7", text: "Estamos para ayudarte" },
];

const MOVIMIENTOS = [
  { icon: Send, nombre: "Transferencia a María G.", fecha: "Hoy, 10:30 a.m.", monto: -200000, tone: "blue" },
  { icon: Film, nombre: "Pago Netflix", fecha: "Ayer, 8:15 p.m.", monto: -37800, tone: "red" },
  { icon: Landmark, nombre: "Nómina recibida", fecha: "25 May, 8:00 a.m.", monto: 2850000, tone: "blue" },
  { icon: ShoppingCart, nombre: "Compra en D1", fecha: "24 May, 4:20 p.m.", monto: -45600, tone: "purple" },
];

const QUICK_ACTIONS = [
  { icon: Send, label: "Transferir" },
  { icon: Receipt, label: "Pagar" },
  { icon: Smartphone, label: "Recargar" },
  { icon: MoreHorizontal, label: "Más" },
];

const FEATURES = [
  { icon: CreditCard, title: "Cuentas y tarjetas", text: "Maneja tus cuentas y tarjetas de débito desde un solo lugar." },
  { icon: ArrowLeftRight, title: "Transferencias", text: "Envía y recibe dinero al instante a cualquier banco." },
  { icon: Receipt, title: "Paga tus servicios", text: "Paga servicios públicos, recargas, impuestos y más." },
  { icon: PieChart, title: "Controla tus gastos", text: "Categoriza tus gastos y toma mejores decisiones." },
  { icon: ShieldCheck, title: "Seguridad avanzada", text: "Tecnología de punta para mantener tu dinero siempre seguro." },
  { icon: Headphones, title: "Atención personalizada", text: "Soporte 24/7 para ayudarte cuando lo necesites." },
];

const STATS = [
  { icon: Users, value: 50000, prefix: "+", suffix: "", label: "Clientes confían en nosotros", decimals: 0 },
  { icon: Smartphone, value: 99.9, prefix: "", suffix: "%", label: "Disponibilidad de la app", decimals: 1 },
  { icon: Lock, value: 100, prefix: "", suffix: "%", label: "Seguro y confiable", decimals: 0 },
  { icon: Star, value: 4.8, prefix: "", suffix: "/5", label: "Calificación de nuestros usuarios", decimals: 1 },
];

/* ---------- PRODUCTOS ---------- */
const PRODUCTOS = [
  {
    icon: Wallet,
    title: "Cuenta de ahorros",
    text: "Sin cuota de manejo y con rendimientos que se abonan cada día, no cada mes.",
    tag: "La más pedida",
  },
  {
    icon: CreditCard,
    title: "Tarjeta débito",
    text: "Paga y retira donde quieras. Bloquéala o actívala al instante desde la app.",
    tag: null,
  },
  {
    icon: Smartphone,
    title: "Billetera digital",
    text: "Cobra y paga con QR o con un link, sin necesidad de tener el plástico a la mano.",
    tag: "Nuevo",
  },
  {
    icon: Building2,
    title: "Cuenta para tu negocio",
    text: "Recibe pagos, paga proveedores y organiza tu flujo de caja en un solo lugar.",
    tag: null,
  },
];

/* ---------- PARA TI ---------- */
const PARA_TI = [
  {
    icon: Users,
    title: "Personas",
    text: "Tu día a día financiero, sin filas ni papeleos.",
    items: ["Abre tu cuenta en 5 minutos", "Transferencias gratis e ilimitadas", "Ahorra con metas automáticas"],
  },
  {
    icon: Compass,
    title: "Emprendedores",
    text: "Herramientas simples para vender y cobrar mejor.",
    items: ["Cobra con QR o link de pago", "Separa tus gastos del negocio", "Reportes claros de tus ventas"],
  },
  {
    icon: Building2,
    title: "Empresas",
    text: "Control financiero para equipos que crecen.",
    items: ["Nómina y pagos a proveedores", "Varios usuarios con permisos", "Integración con tu contabilidad"],
  },
];

/* ---------- SEGURIDAD ---------- */
const SEGURIDAD = [
  { icon: KeyRound, title: "Cifrado de extremo a extremo", text: "Tu información viaja protegida con estándares bancarios AES-256." },
  { icon: Fingerprint, title: "Autenticación biométrica", text: "Entra con huella o reconocimiento facial, además de tu clave." },
  { icon: BellRing, title: "Alertas en tiempo real", text: "Te avisamos al instante de cada movimiento en tu cuenta." },
  { icon: Eye, title: "Monitoreo 24/7", text: "Un equipo y sistemas automáticos vigilan actividad sospechosa todo el día." },
];

/* ---------- NOSOTROS ---------- */
const VALORES = [
  { icon: MapPin, title: "Cercanía", text: "Nacimos en el Chocó, pensando en las comunidades del río Atrato y del Pacífico." },
  { icon: Heart, title: "Transparencia", text: "Sin letra pequeña: cero cuotas ocultas y condiciones claras desde el inicio." },
  { icon: Sparkles, title: "Innovación", text: "Tecnología simple para que la banca digital llegue a más personas cada día." },
];

/* ---------- AYUDA ---------- */
const FAQS = [
  { q: "¿Cómo abro una cuenta?", a: "Descarga la app, valida tu identidad con tu documento y una foto, y en minutos tendrás tu cuenta activa." },
  { q: "¿Tiene algún costo mantener mi cuenta?", a: "No. La cuenta de ahorros no tiene cuota de manejo ni montos mínimos de mantenimiento." },
  { q: "¿Qué hago si pierdo mi tarjeta?", a: "Bloquéala al instante desde la app en la sección Tarjetas, y pide una nueva sin salir de casa." },
  { q: "¿Mis transferencias tienen costo?", a: "Las transferencias entre cuentas Banchocó y a otros bancos son gratis e ilimitadas." },
];

const CANALES_AYUDA = [
  { icon: MessageCircle, title: "Chat en vivo", text: "Respuesta en minutos, todos los días.", action: "Iniciar chat" },
  { icon: Mail, title: "Correo", text: "ayuda@banchoco.com", action: "Escribir correo" },
  { icon: Phone, title: "Línea telefónica", text: "01 8000 123 456, 24/7.", action: "Llamar ahora" },
];

function fmtCOP(n) {
  return `$ ${Math.abs(n).toLocaleString("es-CO")}`;
}

function CountUp({ value, decimals = 0, prefix = "", suffix = "" }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let raf;
    const duration = 1100;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular">
      {prefix}
      {display.toLocaleString("es-CO", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`bc-faq-item ${open ? "is-open" : ""}`}>
      <button className="bc-faq-item__q" onClick={onToggle}>
        <span>{q}</span>
        <ChevronDown size={18} className="bc-faq-item__chev" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="bc-faq-item__a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Inicio() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 560);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="inicio" className="bc">
      {/* NAVBAR */}
      <InicioNavbar />

      {/* HERO */}
      <section className="bc-hero">
        <motion.div
          className="bc-hero__content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="bc-badge">
            <span className="bc-badge__dot" />
            Tu banco, siempre contigo
          </span>

          <h1 className="bc-hero__title">
            Un banco digital
            <br />
            hecho para <span className="bc-hero__accent">ti</span>
          </h1>

          <p className="bc-hero__text">
            Gestiona tu dinero de forma fácil, rápida y segura desde donde estés. Sin filas, sin
            complicaciones.
          </p>

          <div className="bc-hero__ctas">
            <Link to="/registro" className="btn btn--dark">
              Abrir mi cuenta <ArrowRight size={16} />
            </Link>
            <button className="btn btn--outline">Conoce más</button>
          </div>

          <div className="bc-trust">
            {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bc-trust__item">
                <div className="bc-trust__icon">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="bc-trust__title">{title}</p>
                  <p className="bc-trust__text">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* VISUAL: teléfono + tarjeta */}
        <motion.div
          className="bc-hero__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bc-orbit" />
          <div className="bc-dot" />

          <motion.div
            className="bc-card-behind"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="bc-card-behind__top">
              <div className="bc-card-behind__brand">
                <div className="bc-card-behind__mark">B</div>
                <span>
                  Banchocó <em>BANK</em>
                </span>
              </div>
              <Wifi size={18} className="bc-card-behind__wifi" />
            </div>
            <div className="bc-card-behind__chip" />
            <span className="bc-card-behind__visa">VISA</span>
          </motion.div>

          <motion.div
            className="bc-phone"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="bc-phone__notch" />
            <div className="bc-phone__screen">
              <div className="bc-app-topbar">
                <span>Hola, Juan 👋</span>
                <div className="bc-app-topbar__icons">
                  <Bell size={15} />
                  <div className="bc-app-avatar" />
                </div>
              </div>

              <div className="bc-app-balance">
                <div className="bc-app-balance__row">
                  <span>Saldo total</span>
                  <Eye size={13} />
                </div>
                <p className="bc-app-balance__amount tabular">$ 12.450.000,00</p>
                <span className="bc-app-balance__trend">
                  <TrendingUp size={11} /> +12.5% inversión
                </span>
              </div>

              <div className="bc-app-actions">
                {QUICK_ACTIONS.map(({ icon: Icon, label }) => (
                  <div key={label} className="bc-app-action">
                    <Icon size={15} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="bc-app-movs">
                <div className="bc-app-movs__header">
                  <span>Últimos movimientos</span>
                  <span className="bc-app-movs__link">Ver todos</span>
                </div>
                {MOVIMIENTOS.map((m) => {
                  const Icon = m.icon;
                  const positivo = m.monto > 0;
                  return (
                    <div key={m.nombre} className="bc-app-mov">
                      <div className={`bc-app-mov__icon bc-app-mov__icon--${m.tone}`}>
                        <Icon size={13} />
                      </div>
                      <div className="bc-app-mov__info">
                        <p>{m.nombre}</p>
                        <span>{m.fecha}</span>
                      </div>
                      <strong className={positivo ? "is-positive" : ""}>
                        {positivo ? "+" : "-"} {fmtCOP(m.monto)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bc-floating-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bc-floating-badge__icon">
              <ShieldCheck size={16} />
            </div>
            <p>
              Tu dinero
              <br />
              siempre disponible
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="bc-features">
        <div className="bc-features__inner">
          <h2 className="bc-features__title">Todo lo que necesitas en un solo lugar</h2>

          <div className="bc-features__grid">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                className="bc-feature-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="bc-feature-card__icon">
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.div>
            ))}
          </div>

          {/* STATS */}
          <div className="bc-stats">
            {STATS.map(({ icon: Icon, value, prefix, suffix, label, decimals }) => (
              <div key={label} className="bc-stats__item">
                <div className="bc-stats__icon">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="bc-stats__value">
                    <CountUp value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
                  </p>
                  <p className="bc-stats__label">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTOS ================= */}
      <section id="productos" className="bc-section">
        <div className="bc-section__inner">
          <span className="bc-eyebrow">
            <CreditCard size={13} /> Productos
          </span>
          <h2 className="bc-section__title">Elige lo que necesitas, cuando lo necesitas</h2>
          <p className="bc-section__subtitle">
            Todos nuestros productos viven dentro de una sola app, sin trámites en oficina.
          </p>

          <div className="bc-products-grid">
            {PRODUCTOS.map(({ icon: Icon, title, text, tag }, i) => (
              <motion.div
                key={title}
                className="bc-product-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                {tag && <span className="bc-product-card__tag">{tag}</span>}
                <div className="bc-product-card__icon">
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="bc-product-card__link">
                  Conoce más <ArrowRight size={14} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PARA TI ================= */}
      <section id="para-ti" className="bc-section bc-section--tint">
        <div className="bc-section__inner">
          <span className="bc-eyebrow">
            <Star size={13} /> Para ti
          </span>
          <h2 className="bc-section__title">Banchocó se adapta a tu momento</h2>
          <p className="bc-section__subtitle">
            Seas persona, emprendedor o empresa, hay una forma de Banchocó pensada para ti.
          </p>

          <div className="bc-audience-grid">
            {PARA_TI.map(({ icon: Icon, title, text, items }, i) => (
              <motion.div
                key={title}
                className="bc-audience-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="bc-audience-card__icon">
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p className="bc-audience-card__lead">{text}</p>
                <ul className="bc-audience-card__list">
                  {items.map((it) => (
                    <li key={it}>
                      <Check size={14} /> {it}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SEGURIDAD ================= */}
      <section id="seguridad" className="bc-section bc-section--dark">
        <div className="bc-section__inner">
          <span className="bc-eyebrow bc-eyebrow--light">
            <ShieldCheck size={13} /> Seguridad
          </span>
          <h2 className="bc-section__title bc-section__title--light">Tu dinero, protegido en todo momento</h2>
          <p className="bc-section__subtitle bc-section__subtitle--light">
            Combinamos tecnología de punta con monitoreo humano para que tu tranquilidad nunca dependa del azar.
          </p>

          <div className="bc-security-grid">
            {SEGURIDAD.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                className="bc-security-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="bc-security-card__icon">
                  <Icon size={20} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NOSOTROS ================= */}
      <section id="nosotros" className="bc-section">
        <div className="bc-section__inner">
          <div className="bc-about">
            <div className="bc-about__text">
              <span className="bc-eyebrow">
                <Users size={13} /> Nosotros
              </span>
              <h2 className="bc-section__title">El banco digital del Pacífico</h2>
              <p className="bc-section__subtitle" style={{ margin: "0 0 8px" }}>
                Banchocó nació en el Chocó con una idea simple: que la banca digital también llegue a las
                comunidades del río Atrato y de todo el Pacífico colombiano, sin depender de una sucursal
                física para acceder a servicios financieros justos.
              </p>
              <p className="bc-section__subtitle">
                Hoy seguimos construyendo con la región en mente: productos claros, soporte cercano y
                tecnología que funciona incluso con conexiones limitadas.
              </p>
            </div>

            <div className="bc-about__values">
              {VALORES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bc-value-card">
                  <div className="bc-value-card__icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= AYUDA ================= */}
      <section id="ayuda" className="bc-section bc-section--tint">
        <div className="bc-section__inner">
          <span className="bc-eyebrow">
            <Headphones size={13} /> Ayuda
          </span>
          <h2 className="bc-section__title">¿En qué te podemos ayudar?</h2>
          <p className="bc-section__subtitle">
            Revisa las preguntas más frecuentes o contáctanos directamente por el canal que prefieras.
          </p>

          <div className="bc-help-grid">
            <div className="bc-faq">
              {FAQS.map((faq, i) => (
                <FaqItem
                  key={faq.q}
                  q={faq.q}
                  a={faq.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              ))}
            </div>

            <div className="bc-channels">
              {CANALES_AYUDA.map(({ icon: Icon, title, text, action }) => (
                <div key={title} className="bc-channel-card">
                  <div className="bc-channel-card__icon">
                    <Icon size={18} />
                  </div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                  <button className="bc-channel-card__btn">{action}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTÓN VOLVER ARRIBA ================= */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="bc-scrolltop"
            aria-label="Volver arriba"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}