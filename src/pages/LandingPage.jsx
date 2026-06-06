// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Brush, Film, Sparkles, ArrowRight, ChevronDown, BookOpen, Layers, Palette, Eye, Check, Zap } from "lucide-react";

/* ─── EFFECT 3: Floating Paint Dust Particles ───────────────── */
function PaintParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#c8793a", "#e8b86d", "#8b4513", "#7a9ab5", "#a05a28", "#f0d090", "#4a6741"];
    let w, h, particles, raf;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const spawn = () => ({
      x: Math.random() * w,
      y: h + Math.random() * 20,
      r: 1.2 + Math.random() * 2.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 0.25 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.35,
      alpha: 0,
      fadeIn: 0.008 + Math.random() * 0.01,
      maxAlpha: 0.25 + Math.random() * 0.35,
    });

    resize();
    particles = Array.from({ length: 35 }, () => {
      const p = spawn();
      p.y = Math.random() * h;
      p.alpha = Math.random() * p.maxAlpha;
      return p;
    });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        p.y -= p.speed;
        p.x += p.drift;
        p.alpha = Math.min(p.alpha + p.fadeIn, p.maxAlpha);
        if (p.y < -10) particles[i] = spawn();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0, left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

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
  { icon: "🖌️", title: "Alla Prima", subtitle: "Wet-on-wet painting", desc: "Complete the entire painting in a single session while the paint is still wet — bold, immediate, and expressive.", accent: "#c8793a" },
  { icon: "🔲", title: "Glazing", subtitle: "Transparent layers", desc: "Apply thin, transparent layers of color to build depth, luminosity, and rich optical complexity.", accent: "#7a9ab5" },
  { icon: "🎭", title: "Impasto", subtitle: "Thick texture strokes", desc: "Work with heavily loaded paint to create dramatic texture, physical dimension, and confident brushwork.", accent: "#c8793a" },
  { icon: "🌫️", title: "Sfumato", subtitle: "Soft blending", desc: "Gently soften edges and color transitions to achieve a hazy, atmospheric realism — the hallmark of the Old Masters.", accent: "#7a9ab5" },
];

const FEATURES = [
  { icon: <Sparkles className="w-4 h-4" />, title: "AI Analysis", desc: "The AI analyzes your reference photo to identify subject, color palette, and composition — then tailors every step to oil painting technique.", accent: "#c8793a" },
  { icon: <Film className="w-4 h-4" />, title: "Narrated Tutorial", desc: "Every step comes with a voice instructor guiding you through — like having a real oil painting teacher in the room.", accent: "#7a9ab5" },
  { icon: <Layers className="w-4 h-4" />, title: "Layer-by-Layer", desc: "From toning the canvas to final highlights — every oil painting layer is broken down clearly so nothing gets skipped.", accent: "#c8793a" },
  { icon: <Palette className="w-4 h-4" />, title: "Color Mixing Guide", desc: "Learn exactly how to mix colors in oil paint — from basic primaries to complex, nuanced flesh tones and neutrals.", accent: "#7a9ab5" },
  { icon: <Eye className="w-4 h-4" />, title: "Technique Preview", desc: "See how your photo will look as an oil painting — before you open a single tube of paint.", accent: "#c8793a" },
  { icon: <BookOpen className="w-4 h-4" />, title: "Advanced Level", desc: "Master-level Old Master technique — a 10-step classical approach with exact pigment names, mixing ratios, and drying times.", accent: "#7a9ab5" },
];

const HOW_STEPS = [
  { n: "I",   icon: "📸", title: "Upload a photo",           desc: "Any subject works — animals, landscapes, portraits, still life." },
  { n: "II",  icon: "🔥", title: "Advanced AI Tutorial",     desc: "Master-level oil painting technique — a full classical Old Master approach." },
  { n: "III", icon: "🧠", title: "Generate your guide",      desc: "The AI builds a complete narrated oil painting tutorial just for you." },
  { n: "IV",  icon: "🖌️", title: "Start painting!",         desc: "Follow each step — from canvas prep and imprimatura all the way to final varnish." },
];

const SWATCHES = ["#c8793a", "#e8b86d", "#8b4513", "#7a9ab5", "#4a6741", "#2c1810"];

/* ─── EFFECT 4: Swatch Pulse + Hover Glow ───────────────────── */
function PaintSwatches() {
  return (
    <div className="flex gap-1 items-center">
      {SWATCHES.map((c, i) => (
        <div
          key={c}
          className="rounded-full border border-white/10 transition-transform duration-300"
          style={{
            width: 10,
            height: 10,
            backgroundColor: c,
            animation: `swatchPulse 3s ease-in-out ${i * 0.4}s infinite`,
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.7)";
            e.currentTarget.style.boxShadow = `0 0 8px ${c}99`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      ))}
      {/* Inject keyframes once */}
      <style>{`
        @keyframes swatchPulse {
          0%, 100% { box-shadow: 0 0 0px rgba(200,121,58,0); }
          50% { box-shadow: 0 0 7px rgba(200,121,58,0.55); }
        }
      `}</style>
    </div>
  );
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

// ── Pricing Plans ────────────────────────────────────────────
const PLANS = [
  {
    id: "one-time",
    label: "One Tutorial",
    price: "$2.99",
    period: "one-time",
    accent: "#7a9ab5",
    badge: null,
    description: "Perfect for trying it out with a single painting project.",
    features: [
      "1 AI-generated oil painting tutorial",
      "Full 10-step classical technique",
      "Voice-narrated guide",
      "Color mixing instructions",
      "Layer-by-layer breakdown",
      "Painting preview image",
    ],
    cta: "Get One Tutorial",
    type: "one-time",
  },
  {
    id: "subscription",
    label: "Unlimited",
    price: "$9.99",
    period: "per month",
    accent: "#c8793a",
    badge: "Best Value",
    description: "For painters who want to practice with any photo, anytime.",
    features: [
      "Unlimited AI tutorials every month",
      "All skill levels (Beginner → Advanced)",
      "Full voice narration on every guide",
      "Priority tutorial generation",
      "Color mixing & pigment names",
      "Cancel anytime",
    ],
    cta: "Start Subscription",
    type: "subscription",
  },
];

function PricingCard({ plan, onGetStarted }) {
  const isPopular = plan.badge !== null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      className="relative rounded-2xl p-7 flex flex-col gap-6"
      style={{
        border: isPopular ? `1px solid rgba(200,121,58,0.45)` : `1px solid rgba(200,121,58,0.15)`,
        background: isPopular ? "rgba(200,121,58,0.07)" : "rgba(200,121,58,0.03)",
        boxShadow: isPopular ? "0 0 60px rgba(200,121,58,0.12)" : "none",
      }}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white"
            style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)" }}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: plan.accent }}>
          {plan.label}
        </p>
        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
            {plan.price}
          </span>
          <span className="text-xs mb-1.5" style={{ color: "#6a5a4a" }}>/ {plan.period}</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#6a5a4a" }}>{plan.description}</p>
      </div>

      <GoldDivider />

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.accent }} />
            <span className="text-xs leading-relaxed" style={{ color: "#8a7660" }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* ─── EFFECT 2: Button Shine on Pricing CTA ─── */}
      <button
        onClick={() => onGetStarted(plan.type)}
        className="w-full py-3 rounded-full text-sm font-semibold transition-all relative overflow-hidden"
        style={
          isPopular
            ? { background: "linear-gradient(135deg, #c8793a, #a05a28)", color: "#fff", boxShadow: "0 0 30px rgba(200,121,58,0.30)" }
            : { border: "1px solid rgba(200,121,58,0.3)", background: "transparent", color: "#c8793a" }
        }
        onMouseEnter={e => {
          if (isPopular) e.currentTarget.style.boxShadow = "0 0 50px rgba(200,121,58,0.50)";
          else { e.currentTarget.style.background = "rgba(200,121,58,0.08)"; }
        }}
        onMouseLeave={e => {
          if (isPopular) e.currentTarget.style.boxShadow = "0 0 30px rgba(200,121,58,0.30)";
          else { e.currentTarget.style.background = "transparent"; }
        }}
      >
        {isPopular && (
          <span style={{
            position: "absolute", top: "-50%", left: "-75%",
            width: "50%", height: "200%",
            background: "rgba(255,255,255,0.18)",
            transform: "skewX(-20deg)",
            animation: "btnShine 2.5s infinite",
            pointerEvents: "none",
          }} />
        )}
        {plan.cta}
      </button>
    </motion.div>
  );
}

export default function LandingPage({ onGetStarted }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY   = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpa = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const handleGetStarted = (planType) => {
    if (typeof onGetStarted === "function") onGetStarted(planType);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ color: "#f2e8d8", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ─── Global keyframes for all effects ─── */}
      <style>{`
        @keyframes btnShine {
          0%   { left: -75%; }
          100% { left: 125%; }
        }
        @keyframes shimmerText {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

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
              {["Features", "How it Works", "Pricing"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                  className="text-xs tracking-wide transition-colors" style={{ color: "#8a7660" }}
                  onMouseEnter={e => e.target.style.color = "#f2e8d8"}
                  onMouseLeave={e => e.target.style.color = "#8a7660"}>
                  {item}
                </a>
              ))}
            </nav>

            {/* ─── EFFECT 2: Button Shine on nav CTA ─── */}
            <button onClick={() => handleGetStarted()}
              className="ml-4 md:ml-6 flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-semibold transition-all relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)", boxShadow: "0 0 20px rgba(200,121,58,0.25)" }}>
              <span style={{
                position: "absolute", top: "-50%", left: "-75%",
                width: "50%", height: "200%",
                background: "rgba(255,255,255,0.18)",
                transform: "skewX(-20deg)",
                animation: "btnShine 2.8s infinite",
                pointerEvents: "none",
              }} />
              Try it now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.header>

        {/* ══ HERO ══ */}
        {/* ─── EFFECT 3: Paint Dust Particles live here ─── */}
        <section ref={heroRef} className="relative flex items-center justify-center px-5 pt-20 pb-32 md:pt-28 md:pb-40 overflow-hidden">
          <PaintParticles />
          <motion.div style={{ y: heroY, opacity: heroOpa, position: "relative", zIndex: 2 }} className="text-center space-y-8 max-w-4xl mx-auto">
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
              {/* ─── EFFECT 1: Shimmer Text on hero headline ─── */}
              <em style={{
                background: "linear-gradient(90deg, #c8793a 0%, #f0d090 35%, #e8b86d 50%, #c8793a 65%, #f0d090 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmerText 3.5s linear infinite",
              }}>
                learn to oil paint it.
              </em>
            </motion.h2>

            <motion.p {...fadeUp(0.28)} className="text-base md:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "#8a7660" }}>
              Upload any reference photo and our AI instructor will generate a complete
              narrated <span style={{ color: "#c8793a" }}>oil painting tutorial</span>, step by step.
            </motion.p>

            <motion.div {...fadeIn(0.32)} className="flex justify-center"><PaintSwatches /></motion.div>

            <motion.div {...fadeUp(0.36)} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* ─── EFFECT 2: Button Shine on hero CTA ─── */}
              <button onClick={() => handleGetStarted()}
                className="group flex items-center gap-2 px-8 py-4 rounded-full text-white text-sm font-semibold transition-all relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)", boxShadow: "0 0 40px rgba(200,121,58,0.30)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 60px rgba(200,121,58,0.50)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 40px rgba(200,121,58,0.30)"}>
                <span style={{
                  position: "absolute", top: "-50%", left: "-75%",
                  width: "50%", height: "200%",
                  background: "rgba(255,255,255,0.18)",
                  transform: "skewX(-20deg)",
                  animation: "btnShine 2.5s infinite",
                  pointerEvents: "none",
                }} />
                Start Your Tutorial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#pricing"
                className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(200,121,58,0.2)", background: "rgba(200,121,58,0.05)", color: "#8a7660" }}>
                See pricing
              </a>
              <a href="/preview"
                className="flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(200,121,58,0.35)", background: "rgba(200,121,58,0.08)", color: "#c8793a" }}>
                ✨ Try Free Preview
              </a>
            </motion.div>

            <motion.div {...fadeIn(0.5)} className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {["💳 $2.99 one tutorial", "🔁 $9.99/mo unlimited", "🎙️ Voice Narration", "🖌️ Old Master Technique"].map((f) => (
                <span key={f} className="text-xs px-3 py-1.5 rounded-full"
                  style={{ border: "1px solid rgba(200,121,58,0.15)", background: "rgba(200,121,58,0.04)", color: "#8a7660" }}>
                  {f}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            style={{ color: "#4a3728", zIndex: 2, position: "relative" }}>
            <span className="text-[9px] tracking-[0.2em] uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* ══ WHY SECTION ══ */}
        <section className="border-y py-14"
          style={{ borderColor: "rgba(200,121,58,0.12)", background: "rgba(200,121,58,0.03)" }}>
          <div className="max-w-4xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🖌️", title: "Classical technique", desc: "Old Master approach — imprimatura, grisaille, glazing, impasto. Not shortcuts." },
              { icon: "🧠", title: "Tailored to your photo", desc: "Every tutorial is generated fresh for your specific subject and composition." },
              { icon: "🎙️", title: "Voice-guided steps", desc: "A narrated instructor walks you through every layer so you never get lost." },
            ].map((s) => (
              <div key={s.title} className="space-y-3 px-4">
                <span className="text-3xl">{s.icon}</span>
                <p className="text-sm font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8", fontSize: "1.05rem" }}>{s.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#6a5a4a" }}>{s.desc}</p>
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
                Everything you need to<br /><em>learn to oil paint.</em>
              </h3>
              <GoldDivider />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="rounded-2xl p-6 space-y-4 group transition-all"
                  style={{ border: "1px solid rgba(200,121,58,0.12)", background: "rgba(200,121,58,0.04)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = "1px solid rgba(200,121,58,0.35)";
                    e.currentTarget.style.background = "rgba(200,121,58,0.08)";
                    e.currentTarget.style.boxShadow = "0 0 28px rgba(200,121,58,0.15), inset 0 0 20px rgba(200,121,58,0.04)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = "1px solid rgba(200,121,58,0.12)";
                    e.currentTarget.style.background = "rgba(200,121,58,0.04)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
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
                Four steps. <em style={{ color: "#c8793a" }}>One masterpiece.</em>
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
                Choose your <em style={{ color: "#c8793a" }}>technique.</em>
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

        {/* ══ PRICING ══ */}
        <section id="pricing" className="py-28 px-5 border-t"
          style={{ borderColor: "rgba(200,121,58,0.10)", background: "rgba(12,9,7,0.5)" }}>
          <div className="max-w-3xl mx-auto space-y-14">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center space-y-4">
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "#c8793a" }}>Pricing</span>
              <h3 className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2e8d8" }}>
                Simple, <em style={{ color: "#c8793a" }}>honest</em> pricing.
              </h3>
              <p className="text-sm max-w-sm mx-auto" style={{ color: "#6a5a4a" }}>
                No subscriptions required to try. Pay once for one tutorial, or go unlimited for serious painters.
              </p>
              <GoldDivider />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PLANS.map((plan) => (
                <PricingCard key={plan.id} plan={plan} onGetStarted={handleGetStarted} />
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {["🔒 Secure payment via Dodo", "📧 Instant email confirmation", "❌ Cancel subscription anytime"].map(t => (
                  <span key={t} className="text-xs" style={{ color: "#4a3728" }}>{t}</span>
                ))}
              </div>
            </motion.div>
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
              Ready to learn{" "}
              <em style={{
                background: "linear-gradient(90deg, #c8793a 0%, #f0d090 35%, #e8b86d 50%, #c8793a 65%, #f0d090 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmerText 3.5s linear infinite",
              }}>
                oil painting?
              </em>
            </h3>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "#6a5a4a" }}>
              Upload your first photo and get a complete, classical oil painting tutorial in seconds. Start with one tutorial for $2.99 — no commitment needed.
            </p>
            <PaintSwatches />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* ─── EFFECT 2: Button Shine on CTA section ─── */}
              <button onClick={() => handleGetStarted("one-time")}
                className="group inline-flex items-center gap-3 px-10 py-4 rounded-full text-white font-semibold text-sm transition-all relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #c8793a, #a05a28)", boxShadow: "0 0 50px rgba(200,121,58,0.30)" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 70px rgba(200,121,58,0.50)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 50px rgba(200,121,58,0.30)"}>
                <span style={{
                  position: "absolute", top: "-50%", left: "-75%",
                  width: "50%", height: "200%",
                  background: "rgba(255,255,255,0.18)",
                  transform: "skewX(-20deg)",
                  animation: "btnShine 2.5s infinite",
                  pointerEvents: "none",
                }} />
                Try for $2.99
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => handleGetStarted("subscription")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium transition-all"
                style={{ border: "1px solid rgba(200,121,58,0.2)", background: "rgba(200,121,58,0.05)", color: "#8a7660" }}>
                <Zap className="w-3.5 h-3.5" style={{ color: "#c8793a" }} />
                Go unlimited — $9.99/mo
              </button>
            </div>
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
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-xs transition-colors" style={{ color: "#4a3728" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c8793a"}
                onMouseLeave={e => e.currentTarget.style.color = "#4a3728"}>
                Privacy Policy
              </a>
              <span className="text-xs" style={{ color: "#4a3728" }}>·</span>
              <a href="/terms" className="text-xs transition-colors" style={{ color: "#4a3728" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c8793a"}
                onMouseLeave={e => e.currentTarget.style.color = "#4a3728"}>
                Terms of Service
              </a>
            </div>
            <p className="text-xs" style={{ color: "#4a3728" }}>Powered by AI · Learn to oil paint anything 🖌️</p>
          </div>
        </footer>

      </div>
    </div>
  );
}