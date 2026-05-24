// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Brush, Film, Sparkles, ArrowRight, ChevronDown, BookOpen, Layers, Palette, Eye } from "lucide-react";

/* ─── Background Component ─────────────────────────────────── */
function AtelierBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: "#0c0907" }} />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(200,121,58,0.13) 0%, transparent 65%)" }} />
      <div className="absolute top-1/3 -right-48 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,78,40,0.09) 0%, transparent 65%)" }} />
      <div className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(80,100,130,0.07) 0%, transparent 65%)" }} />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(6,4,2,0.7) 100%)" }} />
    </div>
  );
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay },
});
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay },
});

const OIL_TECHNIQUES = [
  { icon: "🖌️", title: "Alla Prima", subtitle: "Wet-on-wet painting", desc: "Kumpletuhin ang buong painting sa iisang session habang basa pa ang pintura.", accent: "#c8793a" },
  { icon: "🔲", title: "Glazing", subtitle: "Transparent layers", desc: "Mag-apply ng manipis na transparent na kulay para sa depth at luminosity.", accent: "#7a9ab5" },
  { icon: "🎭", title: "Impasto", subtitle: "Thick texture strokes", desc: "Gumamit ng makapal na pintura para lumikha ng tekstura at dramatic na brush strokes.", accent: "#c8793a" },
  { icon: "🌫️", title: "Sfumato", subtitle: "Soft blending", desc: "Gawing malambot ang mga gilid at transisyon ng kulay para sa realistic na hitsura.", accent: "#7a9ab5" },
];

const FEATURES = [
  { icon: <Sparkles className="w-4 h-4" />, title: "AI Analysis", desc: "Sinusuri ng AI ang iyong reference photo para ma-identify ang subject, kulay, at composisyon — specific sa oil painting technique.", accent: "#c8793a" },
  { icon: <Film className="w-4 h-4" />, title: "Narrated Tutorial", desc: "Bawat hakbang ay may kasamang boses na nagtuturo — para parang may tunay na oil painting instructor ka.", accent: "#7a9ab5" },
  { icon: <Layers className="w-4 h-4" />, title: "Layer-by-Layer", desc: "Mula sa toning the canvas hanggang final highlights — lahat ng oil painting layers ay naka-breakdown ng malinaw.", accent: "#c8793a" },
  { icon: <Palette className="w-4 h-4" />, title: "Color Mixing Guide", desc: "Alamin kung paano i-mix ang mga kulay gamit ang oil paints — mula sa basic primaries hanggang complex mixes.", accent: "#7a9ab5" },
  { icon: <Eye className="w-4 h-4" />, title: "Technique Preview", desc: "Makita kung paano mag-mumukhang oil painting ang iyong photo — bago ka pa man magbukas ng pintura.", accent: "#c8793a" },
  { icon: <BookOpen className="w-4 h-4" />, title: "Advanced Level", desc: "Master-level Old Master technique — 10-step classical approach with exact pigment names, mixing ratios, and drying times.", accent: "#7a9ab5" },
];

const HOW_STEPS = [
  { n: "I",   icon: "📸", title: "Mag-upload ng photo",      desc: "Kahit anong larawan — hayop, tanawin, portrait, still life." },
  { n: "II",  icon: "🔥", title: "Advanced AI Tutorial",     desc: "Master-level oil painting technique — classical Old Master approach." },
  { n: "III", icon: "🧠", title: "I-generate ang guide",     desc: "Ang AI ay gagawa ng buong narrated oil painting tutorial para sa iyo." },
  { n: "IV",  icon: "🖌️", title: "Magsimulang mag-paint!", desc: "Sundan ang bawat hakbang — mula canvas prep hanggang final varnish." },
];

const TESTIMONIALS = [
  { name: "Maria Santos", role: "Hobbyist Painter", avatar: "🧑‍🎨", quote: "Hindi ako makapaniwala — dati hindi ko alam kung saan magsisimula sa oil painting, ngayon natapos ko na ang aking unang portrait!" },
  { name: "Joven Reyes", role: "Art Student", avatar: "👨‍🎓", quote: "Ang color mixing guide ay sobrang helpful. Hindi ko na kailangang hulaan kung paano i-mix ang flesh tones." },
  { name: "Celine Lim", role: "Creative Professional", avatar: "👩‍💻", quote: "Grabe ang kalidad ng AI analysis. Alam niya kung anong technique ang angkop sa bawat subject na i-o-oil paint." },
];

const SWATCHES = ["#c8793a", "#e8b86d", "#8b4513", "#7a9ab5", "#4a6741", "#2c1810"];

function PaintSwatches() {
  return (
    <div className="flex gap-1 items-center">
      {SWATCHES.map((c) => (
        <div key={c} className="rounded-full border border-white/10"
          style={{ width: 10, height: 10, backgroundColor: c }} />
      ))}
    </div>
  );
}

function Counter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = Math.ceil(to / 60);
        const t = setInterval(() => {
          s = Math.min(s + step, to);
          setCount(s);
          if (s >= to) clearInterval(t);
        }, 16);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(200,121,58,0.3))" }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#c8793a" }} />
      <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(200,121,58,0.3))" }} />
    </div>
  );
}

export default function LandingPage({ onGetStarted }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpa = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: "#f2e8d8", fontFamily: "'DM Sans', sans-serif" }}>
      <AtelierBackground />
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ══ NAV ══ */}
        <motion.header {...fadeIn(0)} className="sticky top-0 z-20 border-b"
          style={{ borderColor: "rgba(200,121,58,0.12)", background: "rgba(12,9,7,0.85)", backdropFilter: "blur(16px)" }}>
          <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #c8793a, #8b4513)" }}>
                <Brush className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
                  PaintFlow <span style={{ color: "#c8793a" }}>AI</span>
                </h1>
                <p className="text-[9px] tracking-widest uppercase" style={{ color: "#8a7660" }}>Oil Painting Studio</p>
              </div>
            </div>
            <nav className="ml-auto hidden md:flex items-center gap-6">
              {["Features", "How it Works", "Techniques"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-xs tracking-wide transition-colors" style={{ color: "#8a7660" }}
                  onMouseEnter={e => e.target.style.color = "#f2e8d8"}
                  onMouseLeave={e => e.target.style.color = "#8a7660"}>
                  {item}
                </a>
              ))}
            </nav>
            <button onClick={onGetStarted}
              className="ml-4 md:ml-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)", boxShadow: "0 0 20px rgba(200,121,58,0.25)" }}>
              Subukan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.header>

        {/* ══ HERO ══ */}
        <section ref={heroRef} className="relative flex items-center justify-center px-5 pt-20 pb-32 md:pt-28 md:pb-40 overflow-hidden">
          <motion.div style={{ y: heroY, opacity: heroOpa }} className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div {...fadeIn(0.1)} className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{ border: "1px solid rgba(200,121,58,0.3)", background: "rgba(200,121,58,0.08)", color: "#c8793a" }}>
                <Film className="w-3.5 h-3.5" />
                AI Oil Painting Instructor
              </div>
            </motion.div>

            <motion.h2 {...fadeUp(0.18)}
              className="text-5xl sm:text-6xl md:text-8xl font-bold leading-[1.02] tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <span style={{ color: "#f2e8d8" }}>Upload a photo,</span><br />
              <em style={{ background: "linear-gradient(120deg, #e8b86d 0%, #c8793a 50%, #e8b86d 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                learn to oil paint it.
              </em>
            </motion.h2>

            <motion.p {...fadeUp(0.28)} className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#8a7660" }}>
              I-upload ang kahit anong reference photo at ang aming AI instructor ay gagawa ng buong
              narrated <span style={{ color: "#c8793a" }}>oil painting tutorial</span>, hakbang-hakbang.
            </motion.p>

            <motion.div {...fadeIn(0.32)} className="flex justify-center"><PaintSwatches /></motion.div>

            <motion.div {...fadeUp(0.36)} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={onGetStarted}
                className="group flex items-center gap-2 px-8 py-4 rounded-full text-white text-sm font-semibold transition-all"
                style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)", boxShadow: "0 0 40px rgba(200,121,58,0.30)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 60px rgba(200,121,58,0.50)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 40px rgba(200,121,58,0.30)"}>
                Simulan ang Tutorial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#how-it-works"
                className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(200,121,58,0.2)", background: "rgba(200,121,58,0.05)", color: "#8a7660" }}>
                Paano ito gumagana?
              </a>
            </motion.div>

            {/* ── Feature pills — Advanced only ── */}
            <motion.div {...fadeIn(0.5)} className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {["🧠 AI Analysis", "🎙️ Voice Narration", "🖌️ Oil Painting", "🔥 Advanced Level"].map((f) => (
                <span key={f} className="text-xs px-3 py-1.5 rounded-full"
                  style={{ border: "1px solid rgba(200,121,58,0.15)", background: "rgba(200,121,58,0.04)", color: "#8a7660" }}>
                  {f}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            style={{ color: "#4a3728" }}>
            <span className="text-[9px] tracking-[0.2em] uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* ══ STATS ══ */}
        <section className="border-y py-12"
          style={{ borderColor: "rgba(200,121,58,0.12)", background: "rgba(200,121,58,0.03)" }}>
          <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 4,   suffix: "",  label: "Oil Techniques" },
              { value: 10,  suffix: "",  label: "Steps per Guide" },
              { value: 100, suffix: "%", label: "AI-Generated" },
              { value: 1,   suffix: "",  label: "Advanced Level" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c8793a" }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs tracking-wide uppercase" style={{ color: "#4a3728" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" className="py-28 px-5">
          <div className="max-w-6xl mx-auto space-y-16">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center space-y-4">
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#c8793a" }}>Features</span>
              <h3 className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
                Lahat ng kailangan mo para<br /><em>matutong mag-oil paint.</em>
              </h3>
              <GoldDivider />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="rounded-2xl p-6 space-y-4 group transition-all"
                  style={{ border: "1px solid rgba(200,121,58,0.12)", background: "rgba(200,121,58,0.04)" }}
                  onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(200,121,58,0.28)"; e.currentTarget.style.background = "rgba(200,121,58,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(200,121,58,0.12)"; e.currentTarget.style.background = "rgba(200,121,58,0.04)"; }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30`, color: f.accent }}>
                    {f.icon}
                  </div>
                  <h4 className="text-sm font-semibold" style={{ color: "#f2e8d8" }}>{f.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#6a5a4a" }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section id="how-it-works" className="py-28 px-5 border-t"
          style={{ borderColor: "rgba(200,121,58,0.10)", background: "rgba(12,9,7,0.5)" }}>
          <div className="max-w-5xl mx-auto space-y-16">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center space-y-4">
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#7a9ab5" }}>How it Works</span>
              <h3 className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
                Apat na hakbang. <em style={{ color: "#c8793a" }}>Isang masterpiece.</em>
              </h3>
              <GoldDivider />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
                style={{ background: "linear-gradient(to right, transparent, rgba(200,121,58,0.25), transparent)" }} />
              {HOW_STEPS.map((s, i) => (
                <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.55 }}
                  className="flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center relative z-10"
                    style={{ border: "1px solid rgba(200,121,58,0.25)", background: "rgba(200,121,58,0.06)" }}>
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-[10px] font-bold tracking-widest mt-0.5"
                      style={{ color: "#c8793a", fontFamily: "'Cormorant Garamond', serif" }}>{s.n}</span>
                  </div>
                  <h4 className="text-sm font-semibold" style={{ color: "#f2e8d8" }}>{s.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#6a5a4a" }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ OIL TECHNIQUES ══ */}
        <section id="techniques" className="py-28 px-5 border-t" style={{ borderColor: "rgba(200,121,58,0.10)" }}>
          <div className="max-w-5xl mx-auto space-y-14">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center space-y-4">
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#c8793a" }}>Techniques</span>
              <h3 className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
                Piliin ang iyong <em style={{ color: "#c8793a" }}>technique.</em>
              </h3>
              <GoldDivider />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OIL_TECHNIQUES.map((t, i) => (
                <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-6 space-y-3 group transition-all"
                  style={{ border: `1px solid ${t.accent}20`, background: `${t.accent}06` }}>
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{t.icon}</span>
                    <div>
                      <h4 className="text-base font-bold"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>{t.title}</h4>
                      <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: `${t.accent}99` }}>{t.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#6a5a4a" }}>{t.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="py-28 px-5 border-t"
          style={{ borderColor: "rgba(200,121,58,0.10)", background: "rgba(12,9,7,0.5)" }}>
          <div className="max-w-5xl mx-auto space-y-14">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center space-y-4">
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#7a9ab5" }}>Testimonials</span>
              <h3 className="text-3xl md:text-4xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>Ano ang sinasabi nila.</h3>
              <GoldDivider />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-6 space-y-5"
                  style={{ border: "1px solid rgba(200,121,58,0.12)", background: "rgba(200,121,58,0.04)" }}>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <span key={i} style={{ color: "#c8793a", fontSize: 12 }}>★</span>)}
                  </div>
                  <p className="text-sm leading-relaxed italic" style={{ color: "#8a7660" }}>"{t.quote}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(200,121,58,0.10)" }}>
                    <span className="text-2xl">{t.avatar}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#f2e8d8" }}>{t.name}</p>
                      <p className="text-[10px]" style={{ color: "#4a3728" }}>{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="py-32 px-5 border-t" style={{ borderColor: "rgba(200,121,58,0.10)" }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center space-y-8">
            <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mx-auto shadow-lg"
              style={{ background: "linear-gradient(135deg, #c8793a, #8b4513)", boxShadow: "0 0 60px rgba(200,121,58,0.30)" }}>
              <span className="text-3xl">🖌️</span>
            </div>
            <h3 className="text-4xl md:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
              Handa ka na bang{" "}
              <em style={{ background: "linear-gradient(120deg, #e8b86d, #c8793a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                matutong mag-oil paint?
              </em>
            </h3>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#6a5a4a" }}>
              I-upload ang iyong unang photo ngayon at makita kung paano ito ginagawang oil painting ng AI.
            </p>
            <PaintSwatches />
            <button onClick={onGetStarted}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-sm transition-all"
              style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)", boxShadow: "0 0 50px rgba(200,121,58,0.30)" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 70px rgba(200,121,58,0.50)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(200,121,58,0.30)"}>
              Simulan ang Tutorial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="border-t py-8" style={{ borderColor: "rgba(200,121,58,0.10)" }}>
          <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #c8793a, #8b4513)" }}>
                <Brush className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium" style={{ color: "#4a3728" }}>PaintFlow AI</span>
            </div>
            <PaintSwatches />
            <p className="text-xs" style={{ color: "#4a3728" }}>Powered by AI • Learn to oil paint anything 🖌️</p>
          </div>
        </footer>

      </div>
    </div>
  );
}