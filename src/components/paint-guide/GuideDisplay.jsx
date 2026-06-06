// src/components/paint-guide/GuideDisplay.jsx — Atelier Noir + Dodo Payment + Subscription
import API_URL from "../../lib/api";
import PaintingTimelapse from "./PaintingTimelapse";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, ChevronDown, ChevronUp, Clock, BarChart2, Palette,
  Film, Info, CreditCard, CheckCircle, XCircle, Zap, Shield, RefreshCw,
  Lock, Star, ArrowRight,
} from "lucide-react";

/* ── Atelier Noir tokens ── */
const C = {
  canvas:  "#0c0907",
  sienna:  "#c8793a",
  ochre:   "#e8b86d",
  cream:   "#f2e8d9",
  muted:   "#7a6a58",
  border:  "rgba(200,121,58,0.18)",
  card:    "rgba(255,255,255,0.03)",
  green:   "#5fa86d",
  red:     "#c84a3a",
  purple:  "#8b5cf6",
};

const SKILL_BADGE = {
  beginner:     { label: "Beginner",     emoji: "🌱", accent: C.green  },
  intermediate: { label: "Intermediate", emoji: "🎨", accent: C.sienna },
  advanced:     { label: "Advanced",     emoji: "🔥", accent: C.red    },
};

const PRICE = {
  beginner:     "$0.99",
  intermediate: "$1.99",
  advanced:     "$2.99",
};

/* ── Thin gold divider ── */
const Divider = ({ style }) => (
  <div style={{
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.sienna}55, transparent)`,
    ...style,
  }} />
);

/* ── Card wrapper ── */
const Card = ({ children, style }) => (
  <div style={{
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    backdropFilter: "blur(12px)",
    ...style,
  }}>
    {children}
  </div>
);

/* ── Section label ── */
const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 11, letterSpacing: "0.14em",
    textTransform: "uppercase", color: C.sienna,
    marginBottom: 10,
  }}>
    {children}
  </p>
);

/* ── Waveform bars ── */
const Waveform = () => (
  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 28 }}>
    {[0.5, 0.9, 0.6, 1, 0.7, 1.1, 0.5, 0.8, 0.6].map((h, i) => (
      <motion.div
        key={i}
        animate={{ scaleY: [h, h * 2, h] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
        style={{
          width: 4, borderRadius: 99,
          height: `${h * 18}px`, originY: 1,
          background: i % 2 === 0 ? `${C.sienna}70` : `${C.ochre}50`,
        }}
      />
    ))}
  </div>
);

/* ── Plan card ── */
const PlanCard = ({ selected, onClick, accent, children, badge }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.985 }}
    style={{
      flex: 1, minWidth: 0,
      padding: "18px 20px",
      borderRadius: 14,
      background: selected
        ? `linear-gradient(145deg, ${accent}18, ${accent}08)`
        : "rgba(255,255,255,0.025)",
      border: `1.5px solid ${selected ? accent : "rgba(255,255,255,0.07)"}`,
      cursor: "pointer",
      textAlign: "left",
      position: "relative",
      transition: "border-color 0.2s, background 0.2s",
      overflow: "hidden",
    }}
  >
    {badge && (
      <div style={{
        position: "absolute", top: 0, right: 14,
        background: accent,
        color: "#0c0907",
        fontSize: 9, fontWeight: 800,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: "0 0 8px 8px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {badge}
      </div>
    )}
    {/* Glow when selected */}
    {selected && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "absolute", inset: 0, borderRadius: 12,
          background: `radial-gradient(ellipse at 20% 50%, ${accent}12, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    )}
    {children}
  </motion.button>
);

/* ── Trust badge row ── */
const TrustBadges = () => (
  <div style={{
    display: "flex", gap: 16, flexWrap: "wrap",
    padding: "12px 0 0",
    borderTop: `1px solid rgba(255,255,255,0.05)`,
    marginTop: 6,
  }}>
    {[
      { icon: <Shield size={11} color={C.muted} />, label: "Secure via Dodo Payments" },
      { icon: <RefreshCw size={11} color={C.muted} />, label: "Cancel anytime" },
      { icon: <Lock size={11} color={C.muted} />, label: "256-bit SSL" },
    ].map((t, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 11, color: `${C.muted}99`,
      }}>
        {t.icon}
        {t.label}
      </div>
    ))}
  </div>
);

export default function GuideDisplay({ guide, imageUrl, onReset, skillLevel = "intermediate", customerEmail = "" }) {
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const DEV_BYPASS_PAYMENT = false;
  const [videoRequested, setVideoRequested] = useState(DEV_BYPASS_PAYMENT);

  const [paymentState, setPaymentState] = useState("idle");
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMode, setPaymentMode]   = useState(null);
  const [accessToken, setAccessToken]   = useState(null);
  // Which plan the user has highlighted in the UI
  const [selectedPlan, setSelectedPlan] = useState("onetime");

  const pollIntervalRef   = useRef(null);
  const paymentIdRef      = useRef(null);
  const subscriptionIdRef = useRef(null);
  const checkoutTabRef    = useRef(null);

  const badge = SKILL_BADGE[skillLevel] ?? SKILL_BADGE.intermediate;
  const price = PRICE[skillLevel] ?? "$1.99";

  useEffect(() => {
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, []);

  const startPolling = (checkFn) => {
    pollIntervalRef.current = setInterval(checkFn, 3000);
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        setPaymentState((prev) => {
          if (prev === "waiting") {
            setPaymentError("Payment timed out. Please try again.");
            return "failed";
          }
          return prev;
        });
      }
    }, 10 * 60 * 1000);
  };

  const handleOneTimePayment = async () => {
    setPaymentMode("onetime");
    setPaymentState("creating");
    setPaymentError(null);
    try {
      const res = await fetch(`${API_URL}/api/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillLevel, customerEmail }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errBody)}`);
      }
      const { payment_id, payment_link } = await res.json();
      paymentIdRef.current = payment_id;
      checkoutTabRef.current = window.open(payment_link, "_blank");
      setPaymentState("waiting");
      startPolling(async () => {
        try {
          const verifyRes = await fetch(`${API_URL}/api/verify-payment/${payment_id}`);
          const { paid, token } = await verifyRes.json();
          if (paid) {
            clearInterval(pollIntervalRef.current);
            if (checkoutTabRef.current) checkoutTabRef.current.close();
            setAccessToken(token);
            setPaymentState("idle");
            setVideoRequested(true);
          }
        } catch { /* silent */ }
      });
    } catch (err) {
      setPaymentState("failed");
      setPaymentError(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleSubscriptionPayment = async () => {
    setPaymentMode("subscription");
    setPaymentState("creating");
    setPaymentError(null);
    try {
      const res = await fetch(`${API_URL}/api/create-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerEmail }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errBody)}`);
      }
      const { subscription_id, payment_link } = await res.json();
      subscriptionIdRef.current = subscription_id;
      checkoutTabRef.current = window.open(payment_link, "_blank");
      setPaymentState("waiting");
      startPolling(async () => {
        try {
          const verifyRes = await fetch(`${API_URL}/api/verify-subscription/${subscription_id}`);
          const { active, token } = await verifyRes.json();
          if (active) {
            clearInterval(pollIntervalRef.current);
            if (checkoutTabRef.current) checkoutTabRef.current.close();
            setAccessToken(token);
            setPaymentState("idle");
            setVideoRequested(true);
          }
        } catch { /* silent */ }
      });
    } catch (err) {
      setPaymentState("failed");
      setPaymentError(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleCancelPayment = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (checkoutTabRef.current) checkoutTabRef.current.close();
    setPaymentState("idle");
    setPaymentError(null);
    setPaymentMode(null);
  };

  const handleRetryPayment = () => {
    setPaymentState("idle");
    setPaymentError(null);
    setPaymentMode(null);
  };

  const handleProceed = () => {
    if (selectedPlan === "subscription") handleSubscriptionPayment();
    else handleOneTimePayment();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ══ HEADER CARD ══ */}
      <Card>
        <div style={{ padding: "24px 24px 0" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, width: 100 }}>
              <div style={{
                borderRadius: 12, overflow: "hidden",
                border: `1px solid ${C.border}`,
                boxShadow: `0 0 24px ${C.sienna}22`,
              }}>
                <img src={imageUrl} alt="Reference"
                  style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
              </div>
              <p style={{
                fontSize: 10, color: C.muted, textAlign: "center",
                marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>Reference</p>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: C.ochre,
                }}>🎨 Oil Painting Guide</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600,
                  background: `${badge.accent}20`, border: `1px solid ${badge.accent}50`,
                  color: badge.accent,
                }}>
                  {badge.emoji} {badge.label}
                </span>
              </div>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(22px, 4vw, 34px)",
                fontWeight: 700, lineHeight: 1.1,
                color: C.cream, margin: "0 0 8px", letterSpacing: "-0.01em",
              }}>
                {guide.title}
              </h2>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: 0 }}>
                {guide.overview}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            {[
              { icon: <Clock size={12} color={C.sienna} />, label: guide.estimated_time },
              { icon: <BarChart2 size={12} color={C.ochre} />, label: guide.difficulty },
            ].map((s, i) => (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 99,
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                fontSize: 12, color: C.muted,
              }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
        </div>

        {guide.materials?.length > 0 && (
          <>
            <Divider style={{ margin: "20px 0 0" }} />
            <div style={{ padding: "16px 24px 20px" }}>
              <button
                onClick={() => setShowAllMaterials(!showAllMaterials)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, color: C.sienna, fontSize: 13, fontWeight: 600,
                }}
              >
                <Palette size={14} color={C.sienna} />
                Materials needed ({guide.materials.length})
                {showAllMaterials
                  ? <ChevronUp size={14} color={C.muted} />
                  : <ChevronDown size={14} color={C.muted} />}
              </button>
              <AnimatePresence>
                {showAllMaterials && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: 8, marginTop: 14,
                    }}>
                      {guide.materials.map((mat, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 12px", borderRadius: 8,
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${C.border}`,
                            fontSize: 12, color: C.muted,
                          }}
                        >
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: C.sienna, flexShrink: 0,
                          }} />
                          {mat}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </Card>

      {/* ══ VIDEO / PAYMENT SECTION ══ */}
      <AnimatePresence mode="wait">

        {/* ── 1. IDLE — Payment chooser ── */}
        {!videoRequested && paymentState === "idle" && (
          <motion.div
            key="video-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card style={{ overflow: "hidden" }}>

              {/* Card header */}
              <div style={{
                padding: "22px 24px 18px",
                borderBottom: `1px solid rgba(255,255,255,0.05)`,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.sienna}28, ${C.ochre}10)`,
                  border: `1px solid ${C.sienna}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Film size={20} color={C.sienna} strokeWidth={1.6} />
                </div>
                <div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 19, fontWeight: 700, color: C.cream,
                    margin: "0 0 3px", letterSpacing: "-0.01em",
                  }}>
                    Generate Tutorial Video
                  </h3>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                    AI renders your painting step-by-step with voice narration
                  </p>
                </div>
              </div>

              {/* Plan selector */}
              <div style={{ padding: "20px 24px" }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: `${C.muted}88`,
                  marginBottom: 12,
                }}>Choose a plan</p>

                <div style={{ display: "flex", gap: 10 }}>

                  {/* One-time plan */}
                  <PlanCard
                    selected={selectedPlan === "onetime"}
                    onClick={() => setSelectedPlan("onetime")}
                    accent={C.sienna}
                  >
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: selectedPlan === "onetime" ? `${C.ochre}cc` : `${C.muted}88`,
                      margin: "0 0 8px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>One-time</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 30, fontWeight: 700, lineHeight: 1,
                        color: C.cream,
                      }}>{price}</span>
                    </div>
                    <p style={{
                      fontSize: 11, color: C.muted, margin: 0,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>This painting only</p>

                    {/* Selection indicator */}
                    <div style={{
                      marginTop: 12,
                      display: "flex", alignItems: "center", gap: 5,
                      opacity: selectedPlan === "onetime" ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: C.sienna,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle size={9} color="#0c0907" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 10, color: C.sienna, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Selected</span>
                    </div>
                  </PlanCard>

                  {/* Subscription plan */}
                  <PlanCard
                    selected={selectedPlan === "subscription"}
                    onClick={() => setSelectedPlan("subscription")}
                    accent={C.purple}
                    badge="Best value"
                  >
                    <p style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: selectedPlan === "subscription" ? `${C.purple}cc` : `${C.muted}88`,
                      margin: "0 0 8px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>Subscription</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 30, fontWeight: 700, lineHeight: 1,
                        color: C.cream,
                      }}>$9.99</span>
                      <span style={{ fontSize: 12, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>/mo</span>
                    </div>
                    <p style={{
                      fontSize: 11, margin: 0,
                      color: selectedPlan === "subscription" ? `${C.purple}bb` : C.muted,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "color 0.2s",
                    }}>Unlimited videos, cancel anytime</p>

                    <div style={{
                      marginTop: 12,
                      display: "flex", alignItems: "center", gap: 5,
                      opacity: selectedPlan === "subscription" ? 1 : 0,
                      transition: "opacity 0.2s",
                    }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: C.purple,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle size={9} color="#fff" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 10, color: C.purple, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Selected</span>
                    </div>
                  </PlanCard>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceed}
                  style={{
                    width: "100%",
                    marginTop: 14,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    padding: "14px 24px",
                    borderRadius: 12,
                    background: selectedPlan === "subscription"
                      ? `linear-gradient(135deg, ${C.purple}dd, #7c3aed)`
                      : `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                    border: "none",
                    color: selectedPlan === "subscription" ? "#fff" : "#0c0907",
                    fontSize: 14, fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: selectedPlan === "subscription"
                      ? `0 4px 24px ${C.purple}35`
                      : `0 4px 24px ${C.sienna}35`,
                    transition: "background 0.25s, box-shadow 0.25s",
                  }}
                >
                  {selectedPlan === "subscription"
                    ? <Zap size={15} strokeWidth={2.5} />
                    : <CreditCard size={15} strokeWidth={2.5} />
                  }
                  {selectedPlan === "subscription"
                    ? "Subscribe — $9.99/mo"
                    : `Pay — ${price}`
                  }
                  <ArrowRight size={14} strokeWidth={2.5} style={{ marginLeft: 2 }} />
                </motion.button>

                {/* Ghost dismiss */}
                <button
                  onClick={onReset}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "10px 20px", borderRadius: 10,
                    background: "transparent",
                    border: `1px solid rgba(255,255,255,0.06)`,
                    color: `${C.muted}99`, fontSize: 12, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = `${C.muted}99`; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <RotateCcw size={12} />
                  No thanks, upload a new photo
                </button>

                <TrustBadges />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── 2. Creating checkout link ── */}
        {paymentState === "creating" && (
          <motion.div
            key="payment-creating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card style={{ padding: "48px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", width: 64, height: 64 }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: `2px solid ${C.sienna}20`,
                  }} />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: `2px solid transparent`,
                      borderTopColor: paymentMode === "subscription" ? C.purple : C.sienna,
                      borderRightColor: paymentMode === "subscription" ? `${C.purple}80` : `${C.ochre}80`,
                    }}
                  />
                  <div style={{
                    position: "absolute", inset: 10, borderRadius: "50%",
                    background: paymentMode === "subscription"
                      ? `${C.purple}15`
                      : `${C.sienna}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {paymentMode === "subscription"
                      ? <Zap size={18} color={C.purple} strokeWidth={1.6} />
                      : <CreditCard size={18} color={C.sienna} strokeWidth={1.6} />
                    }
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20, fontWeight: 700, color: C.cream,
                      margin: "0 0 6px",
                    }}
                  >
                    Preparing checkout…
                  </motion.p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                    Connecting to Dodo Payments, just a moment…
                  </p>
                </div>
                <Waveform />
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── 3. Waiting for payment ── */}
        {paymentState === "waiting" && (
          <motion.div
            key="payment-waiting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card style={{ overflow: "hidden" }}>

              {/* Animated top bar */}
              <motion.div
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
                style={{
                  height: 3,
                  background: paymentMode === "subscription"
                    ? `linear-gradient(90deg, ${C.purple}, #a78bfa)`
                    : `linear-gradient(90deg, ${C.sienna}, ${C.ochre})`,
                  transformOrigin: "left",
                }}
              />

              <div style={{ padding: "36px 28px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

                  <motion.div
                    animate={{
                      scale: [1, 1.06, 1],
                      boxShadow: [
                        `0 0 0px ${paymentMode === "subscription" ? C.purple : C.sienna}00`,
                        `0 0 28px ${paymentMode === "subscription" ? C.purple : C.sienna}45`,
                        `0 0 0px ${paymentMode === "subscription" ? C.purple : C.sienna}00`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: 60, height: 60, borderRadius: 16,
                      background: paymentMode === "subscription"
                        ? `linear-gradient(135deg, ${C.purple}28, #7c3aed14)`
                        : `linear-gradient(135deg, ${C.sienna}28, ${C.ochre}14)`,
                      border: `1px solid ${paymentMode === "subscription" ? C.purple : C.sienna}50`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {paymentMode === "subscription"
                      ? <Zap size={26} color={C.purple} strokeWidth={1.5} />
                      : <CreditCard size={26} color={C.sienna} strokeWidth={1.5} />
                    }
                  </motion.div>

                  <div style={{ textAlign: "center" }}>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22, fontWeight: 700, color: C.cream,
                      margin: "0 0 6px",
                    }}>
                      {paymentMode === "subscription" ? "Complete your subscription" : "Complete your payment"}
                    </p>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 3px" }}>
                      Checkout opened in a new tab.
                    </p>
                    <p style={{ fontSize: 11, color: `${C.muted}77`, margin: 0 }}>
                      This page continues automatically once confirmed.
                    </p>
                  </div>

                  {/* Pulse dots */}
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}
                        style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: paymentMode === "subscription" ? C.purple : C.sienna,
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleCancelPayment}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 18px", borderRadius: 8,
                      background: "transparent",
                      border: `1px solid rgba(255,255,255,0.08)`,
                      color: `${C.muted}88`, fontSize: 12, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = `${C.muted}88`; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    <XCircle size={12} />
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── 4. Payment failed ── */}
        {paymentState === "failed" && (
          <motion.div
            key="payment-failed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card style={{ overflow: "hidden" }}>
              <div style={{
                height: 3,
                background: `linear-gradient(90deg, ${C.red}, #f87171)`,
              }} />
              <div style={{ padding: "36px 28px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${C.red}12`, border: `1px solid ${C.red}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <XCircle size={24} color={C.red} strokeWidth={1.5} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20, fontWeight: 700, color: C.cream, margin: "0 0 6px",
                    }}>
                      Payment unsuccessful
                    </p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                      {paymentError || "Something went wrong. Please try again."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRetryPayment}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 22px", borderRadius: 10,
                        background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                        border: "none", color: "#0c0907",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <RotateCcw size={13} color="#0c0907" />
                      Try again
                    </motion.button>
                    <button
                      onClick={onReset}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 20px", borderRadius: 10,
                        background: "transparent",
                        border: `1px solid rgba(255,255,255,0.08)`,
                        color: C.muted, fontSize: 13, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Upload a new photo
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── 5. Video player (paid & ready) ── */}
        {videoRequested && (
          <motion.div
            key="video-player"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", borderRadius: 10, marginBottom: 12,
                background: `${C.green}10`, border: `1px solid ${C.green}30`,
              }}
            >
              <CheckCircle size={15} color={C.green} />
              <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>
                {paymentMode === "subscription"
                  ? "Subscription active — generating your video! 🎉"
                  : "Payment confirmed — generating your video!"
                }
              </span>
            </motion.div>

            <Card style={{ overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 8px" }}>
                <SectionLabel>🎬 Tutorial Video</SectionLabel>
              </div>
              <PaintingTimelapse guide={guide} imageUrl={imageUrl} skillLevel={skillLevel} accessToken={accessToken} />
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ══ RESET BUTTON ══ */}
      {videoRequested && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <button
            onClick={onReset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px", borderRadius: 99,
              background: "transparent", border: `1px solid ${C.sienna}55`,
              color: C.sienna, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.sienna}18`; e.currentTarget.style.borderColor = C.sienna; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${C.sienna}55`; }}
          >
            <RotateCcw size={14} />
            New Photo
          </button>
        </div>
      )}

    </motion.div>
  );
}