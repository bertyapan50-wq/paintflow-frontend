// @ts-nocheck
// src/pages/Home.jsx — Atelier Noir Redesign
import API_URL from "../lib/api";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "../components/paint-guide/ImageUploader";
import GuideDisplay from "../components/paint-guide/GuideDisplay";
import LoadingGuide from "../components/paint-guide/LoadingGuide";
import MediumSelector from "../components/paint-guide/MediumSelector";
import LandingPage from "./LandingPage";

/* ── Atelier Noir tokens (mirrors LandingPage palette) ── */
const C = {
  canvas:   "#0c0907",
  sienna:   "#c8793a",
  ochre:    "#e8b86d",
  cream:    "#f2e8d9",
  muted:    "#7a6a58",
  border:   "rgba(200,121,58,0.18)",
};

/* ── Ambient canvas background ── */
function AtelierCanvas() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: C.canvas }}>
      <div style={{
        position: "absolute", top: "-10%", left: "-5%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,121,58,0.13) 0%, transparent 70%)",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,184,109,0.08) 0%, transparent 70%)",
        filter: "blur(50px)",
      }} />
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
        <filter id="hm-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hm-grain)" />
      </svg>
    </div>
  );
}

const Divider = ({ style }) => (
  <div style={{
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.sienna}55, transparent)`,
    ...style,
  }} />
);

const SKILL_BADGES = {
  beginner:     { label: "Beginner",     emoji: "🌱", accent: "#5fa86d" },
  intermediate: { label: "Intermediate", emoji: "🎨", accent: C.sienna },
  advanced:     { label: "Advanced",     emoji: "🔥", accent: "#c84a3a" },
};



export default function Home() {
  const [showApp, setShowApp]           = useState(false);
  const [skillLevel, setSkillLevel]     = useState("advanced");
  const [guide, setGuide]               = useState(null);
  const [imageUrl, setImageUrl]         = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
const [paymentLoading, setPaymentLoading] = useState(false);

const medium = "oil";

const handleGetStarted = async (planType) => {
  if (!planType) { setShowApp(true); return; }
  setPaymentLoading(true);
  try {
    const endpoint = planType === "subscription"
      ? `${API_URL}/api/create-subscription`
      : `${API_URL}/api/create-payment`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillLevel, customerName: "PaintFlow User" }),
    });
    const data = await res.json();
    if (data.payment_link) {
      window.location.href = data.payment_link;
    } else {
      alert("Could not create payment. Please try again.");
    }
  } catch (err) {
    console.error("❌ Payment error:", err);
    alert("Payment error. Please try again.");
  } finally {
    setPaymentLoading(false);
  }
};

if (!showApp) {
  return <LandingPage onGetStarted={handleGetStarted} paymentLoading={paymentLoading} />;
}

  /* ── API call ── */
  const handleImageSelected = async (file) => {
    
    setIsLoading(true);
    setGuide(null);
    setLoadingPhase(0);

    try {
      const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      setImageUrl(imageBase64);
      setLoadingPhase(1);

      const res = await fetch(`${API_URL}/api/tutorial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          medium,
          skillLevel,
        
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Backend error");
      }

      const result = await res.json();

      const normalizedSteps = (result.steps || []).map((s, i) => ({
        title:        s.title        || `Step ${i + 1}`,
        description:  s.description  || "",
        tip:          s.tip          || "",
        colors:       s.colors       || [],
        image_prompt: s.image_prompt || "",
        stepImageUrl: null,
        imageLoading: false,
      }));

      const normalizedResult = {
        title:               result.title               || "Painting Guide",
        subject_description: result.subject_description || "",
        dominant_colors:     result.dominant_colors     || [],
        overview:            result.overview            || "",
        medium:              "oil_paint",
        difficulty:          result.difficulty          || "Intermediate",
        estimated_time:      result.estimated_time      || "",
        materials:           result.materials           || [],
        steps:               normalizedSteps,
      };

      if (!normalizedResult.steps.length) {
        alert("Could not generate guide. Please try again.");
        setIsLoading(false);
        return;
      }

      setGuide(normalizedResult);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleReset = () => { setGuide(null); setImageUrl(null); };
  const handleHome  = () => { setShowApp(false); handleReset(); };

  const badge = SKILL_BADGES[skillLevel];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.cream, background: C.canvas }}>
      <AtelierCanvas />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ══ HEADER ══ */}
        <header style={{
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: "blur(16px)",
          background: "rgba(12,9,7,0.75)",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleHome}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 18px ${C.sienna}55`,
              }}>
                <Brush size={16} color="#0c0907" strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 17, fontWeight: 700, letterSpacing: "0.03em",
                  color: C.cream, lineHeight: 1.1,
                }}>
                  PaintFlow <span style={{ color: C.sienna, fontStyle: "italic" }}>AI</span>
                </div>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Atelier Studio
                </div>
              </div>
            </button>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 99,
                border: `1px solid ${C.sienna}40`,
                background: `${C.sienna}12`,
                color: C.ochre, fontSize: 11,
                fontWeight: 600, letterSpacing: "0.04em",
              }}>
                🎨 Oil Painting
              </span>

              {guide && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 99,
                    background: `${badge.accent}22`,
                    border: `1px solid ${badge.accent}55`,
                    color: badge.accent, fontSize: 11, fontWeight: 600,
                  }}
                >
                  {badge.emoji} {badge.label}
                </motion.span>
              )}

              {guide && (
                <button
                  onClick={handleReset}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 99,
                    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
                    color: C.muted, fontSize: 11, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.cream}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >
                  <RotateCcw size={11} />
                  New
                </button>
              )}
            </div>
          </div>
          <Divider />
        </header>

        {/* ══ MAIN ══ */}
        <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "60px 20px" }}>
          <AnimatePresence mode="wait">

            {/* ── Upload screen ── */}
            {!guide && !isLoading && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                {/* Hero text */}
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "6px 16px", borderRadius: 99,
                      border: `1px solid ${C.sienna}40`,
                      background: `${C.sienna}10`,
                      color: C.ochre, fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      marginBottom: 28,
                    }}
                  >
                    <Film size={12} color={C.sienna} />
                    AI-Narrated Video Tutorial · Step by Step
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(36px, 6vw, 64px)",
                      fontWeight: 700, lineHeight: 1.08,
                      letterSpacing: "-0.01em",
                      color: C.cream, margin: "0 0 16px",
                    }}
                  >
                    Upload a photo,{" "}
                    <span style={{ color: C.sienna, fontStyle: "italic" }}>we'll teach</span>
                    <br />
                    <span style={{ color: C.ochre, fontStyle: "italic" }}>you to paint it.</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    style={{ fontSize: 15, color: C.muted, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}
                  >
                    Upload any reference photo — landscapes, portraits, still life —
                    and our AI instructor will craft a complete narrated oil painting tutorial,
                    step by step.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.36 }}
                    style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}
                  >
                    {[
                      { icon: "🧠", text: "AI Analysis" },
                      { icon: "🎙️", text: "Voice Narration" },
                      { icon: "🖼️", text: "Image Transformation" },
                      { icon: "🔥", text: "Advanced Level" },
                    ].map((f, i) => (
                      <motion.span
                        key={f.text}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.38 + i * 0.06 }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 99,
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${C.border}`,
                          color: C.muted, fontSize: 12,
                        }}
                      >
                        {f.icon} {f.text}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>

                <Divider style={{ marginBottom: 40 }} />

             

                {/* ── Image Uploader ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52 }}
                >
                  <ImageUploader
                    onImageSelected={handleImageSelected}
                    isLoading={isLoading}
                    medium={medium}
                  />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                  style={{
                    textAlign: "center", marginTop: 24,
                    fontSize: 12, color: `${C.muted}88`,
                    letterSpacing: "0.04em",
                  }}
                >
                  Best results: a clear photo of any subject 🎨
                </motion.p>
              </motion.div>
            )}

            {/* ── Loading ── */}
            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingGuide phase={loadingPhase} />
              </motion.div>
            )}

            {/* ── Guide result ── */}
            {guide && imageUrl && (
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GuideDisplay
                  guide={guide}
                  imageUrl={imageUrl}
                  onReset={handleReset}
                  skillLevel={skillLevel}
                  
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* ══ FOOTER ══ */}
        <footer>
          <Divider />
          <div style={{
            maxWidth: 960, margin: "0 auto", padding: "18px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brush size={12} color="#0c0907" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>PaintFlow AI</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="/privacy" style={{ fontSize: 11, color: `${C.muted}88`, textDecoration: "none", letterSpacing: "0.04em" }}
                onMouseEnter={e => e.currentTarget.style.color = C.sienna}
                onMouseLeave={e => e.currentTarget.style.color = `${C.muted}88`}>
                Privacy
              </a>
              <a href="/terms" style={{ fontSize: 11, color: `${C.muted}88`, textDecoration: "none", letterSpacing: "0.04em" }}
                onMouseEnter={e => e.currentTarget.style.color = C.sienna}
                onMouseLeave={e => e.currentTarget.style.color = `${C.muted}88`}>
                Terms
              </a>
              <p style={{ fontSize: 11, color: `${C.muted}88`, letterSpacing: "0.04em", margin: 0 }}>
                Powered by AI · Learn to paint anything
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}