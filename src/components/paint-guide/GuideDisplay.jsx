// src/components/paint-guide/GuideDisplay.jsx — Atelier Noir + Dodo Payment + Subscription
import API_URL from "../../lib/api";
import PaintingTimelapse from "./PaintingTimelapse";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronDown, ChevronUp, Clock, BarChart2, Palette, Film, Info, CreditCard, CheckCircle, XCircle, Zap } from "lucide-react";

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

/* ── Waveform bars (reusable) ── */
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

export default function GuideDisplay({ guide, imageUrl, onReset, skillLevel = "intermediate", customerEmail = "" }) {
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const DEV_BYPASS_PAYMENT = false;
const [videoRequested, setVideoRequested]     = useState(DEV_BYPASS_PAYMENT);

  // Payment states: idle | creating | waiting | verifying | failed
  const [paymentState, setPaymentState]         = useState("idle");
  const [paymentError, setPaymentError]         = useState(null);
  // "onetime" | "subscription"
  const [paymentMode, setPaymentMode]           = useState(null);

  const pollIntervalRef   = useRef(null);
  const paymentIdRef      = useRef(null);
  const subscriptionIdRef = useRef(null);
  const checkoutTabRef    = useRef(null);

  const badge = SKILL_BADGE[skillLevel] ?? SKILL_BADGE.intermediate;
  const price = PRICE[skillLevel] ?? "$1.99";

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  /* ── Poll helper ── */
  const startPolling = (checkFn) => {
    pollIntervalRef.current = setInterval(checkFn, 3000);

    // Auto-stop after 10 minutes
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

  /* ── One-time payment ── */
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
          const { paid } = await verifyRes.json();
          if (paid) {
            clearInterval(pollIntervalRef.current);
            if (checkoutTabRef.current) checkoutTabRef.current.close();
            setPaymentState("idle");
            setVideoRequested(true);
          }
        } catch { /* silent fail — keep polling */ }
      });

    } catch (err) {
      console.error("❌ Payment error:", err);
      setPaymentState("failed");
      setPaymentError(err.message || "Something went wrong. Please try again.");
    }
  };

  /* ── Subscription payment ── */
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
          const { active } = await verifyRes.json();
          if (active) {
            clearInterval(pollIntervalRef.current);
            if (checkoutTabRef.current) checkoutTabRef.current.close();
            setPaymentState("idle");
            setVideoRequested(true);
          }
        } catch { /* silent fail */ }
      });

    } catch (err) {
      console.error("❌ Subscription error:", err);
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

            {/* Reference image */}
            <div style={{ flexShrink: 0, width: 100 }}>
              <div style={{
                borderRadius: 12, overflow: "hidden",
                border: `1px solid ${C.border}`,
                boxShadow: `0 0 24px ${C.sienna}22`,
              }}>
                <img
                  src={imageUrl}
                  alt="Reference"
                  style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }}
                />
              </div>
              <p style={{
                fontSize: 10, color: C.muted, textAlign: "center",
                marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Reference
              </p>
            </div>

            {/* Title + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: C.ochre,
                }}>
                  🎨 Oil Painting Guide
                </span>
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

          {/* Stats row */}
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

        {/* Materials */}
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

      {/* ══ VIDEO SECTION ══ */}
      <AnimatePresence mode="wait">

        {/* ── 1. Idle prompt card ── */}
        {!videoRequested && paymentState === "idle" && (
          <motion.div
            key="video-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.sienna}22, ${C.ochre}10)`,
                  border: `1px solid ${C.sienna}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 20px ${C.sienna}18`,
                }}>
                  <Film size={22} color={C.sienna} strokeWidth={1.6} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20, fontWeight: 700, color: C.cream,
                    margin: "0 0 5px", letterSpacing: "-0.01em",
                  }}>
                    Want to generate a Tutorial Video?
                  </h3>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: "0 0 12px" }}>
                    The video is rendered step by step using AI — this may take a few minutes
                    depending on the complexity of your image and the number of steps.
                  </p>

                  {/* Pricing options */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

                    {/* One-time badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 12px", borderRadius: 8,
                      background: `${C.sienna}15`, border: `1px solid ${C.sienna}40`,
                      fontSize: 12, color: C.ochre, fontWeight: 700,
                    }}>
                      <CreditCard size={11} color={C.ochre} />
                      {price} one-time
                    </div>

                    {/* Subscription badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 12px", borderRadius: 8,
                      background: `${C.purple}15`, border: `1px solid ${C.purple}40`,
                      fontSize: 12, color: C.purple, fontWeight: 700,
                    }}>
                      <Zap size={11} color={C.purple} />
                      $9.99/mo unlimited
                    </div>

                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 8,
                      background: `${C.ochre}10`, border: `1px solid ${C.ochre}25`,
                      fontSize: 11, color: `${C.ochre}cc`,
                    }}>
                      <Info size={11} color={C.ochre} />
                      Secure via Dodo Payments
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>

                {/* One-time pay button */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOneTimePayment}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 22px", borderRadius: 99,
                    background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                    border: "none", color: "#0c0907",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    boxShadow: `0 0 24px ${C.sienna}40`,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <CreditCard size={14} color="#0c0907" strokeWidth={2.5} />
                  Pay — {price}
                </motion.button>

                {/* Subscription button */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubscriptionPayment}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 22px", borderRadius: 99,
                    background: `linear-gradient(135deg, ${C.purple}cc, #7c3aed)`,
                    border: "none", color: "#fff",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    boxShadow: `0 0 24px ${C.purple}30`,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Zap size={14} color="#fff" strokeWidth={2.5} />
                  Subscribe — $9.99/mo
                </motion.button>

                <button
                  onClick={onReset}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "10px 20px", borderRadius: 99,
                    background: "transparent", border: `1px solid ${C.border}`,
                    color: C.muted, fontSize: 13, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.cream}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >
                  <RotateCcw size={13} />
                  No thanks, upload a new photo
                </button>
              </div>

              {/* Subscription value note */}
              <p style={{
                fontSize: 11, color: `${C.muted}88`,
                marginTop: 12, paddingTop: 12,
                borderTop: `1px solid ${C.border}`,
              }}>
                💡 <strong style={{ color: `${C.muted}cc` }}>Subscription</strong> — unlimited video generation for all your tutorials. Cancel anytime.
              </p>
            </Card>
          </motion.div>
        )}

        {/* ── 2. Creating payment/subscription link ── */}
        {paymentState === "creating" && (
          <motion.div
            key="payment-creating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card style={{ padding: "36px 28px" }}>
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
                    position: "absolute", inset: 8, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.sienna}20, ${C.ochre}10)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {paymentMode === "subscription"
                      ? <Zap size={20} color={C.purple} strokeWidth={1.6} />
                      : <CreditCard size={20} color={C.sienna} strokeWidth={1.6} />
                    }
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20, fontWeight: 700, color: C.cream,
                      margin: "0 0 6px", letterSpacing: "-0.01em",
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
            <Card style={{ padding: "36px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

                <motion.div
                  animate={{ scale: [1, 1.08, 1], boxShadow: [`0 0 0px ${C.sienna}00`, `0 0 32px ${C.sienna}55`, `0 0 0px ${C.sienna}00`] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 64, height: 64, borderRadius: 18,
                    background: paymentMode === "subscription"
                      ? `linear-gradient(135deg, ${C.purple}30, #7c3aed15)`
                      : `linear-gradient(135deg, ${C.sienna}30, ${C.ochre}15)`,
                    border: `1px solid ${paymentMode === "subscription" ? C.purple : C.sienna}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {paymentMode === "subscription"
                    ? <Zap size={28} color={C.purple} strokeWidth={1.5} />
                    : <CreditCard size={28} color={C.sienna} strokeWidth={1.5} />
                  }
                </motion.div>

                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, fontWeight: 700, color: C.cream,
                    margin: "0 0 8px", letterSpacing: "-0.01em",
                  }}>
                    {paymentMode === "subscription"
                      ? "Waiting for subscription…"
                      : "Waiting for payment…"
                    }
                  </p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 4px" }}>
                    Dodo checkout opened in a new tab.
                  </p>
                  <p style={{ fontSize: 12, color: `${C.muted}88`, margin: 0 }}>
                    This page will continue automatically once payment is complete.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: paymentMode === "subscription" ? C.purple : C.sienna,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleCancelPayment}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 18px", borderRadius: 99,
                    background: "transparent", border: `1px solid ${C.border}`,
                    color: C.muted, fontSize: 12, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.cream}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}
                >
                  <XCircle size={13} />
                  Cancel
                </button>
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
            <Card style={{ padding: "32px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${C.red}15`, border: `1px solid ${C.red}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <XCircle size={26} color={C.red} strokeWidth={1.5} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 20, fontWeight: 700, color: C.cream,
                    margin: "0 0 6px",
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
                      padding: "10px 22px", borderRadius: 99,
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
                      padding: "10px 20px", borderRadius: 99,
                      background: "transparent", border: `1px solid ${C.border}`,
                      color: C.muted, fontSize: 13, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Upload a new photo
                  </button>
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
            {/* Success banner */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 16px", borderRadius: 10, marginBottom: 12,
                background: `${C.green}12`, border: `1px solid ${C.green}35`,
              }}
            >
              <CheckCircle size={16} color={C.green} />
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
              <PaintingTimelapse guide={guide} imageUrl={imageUrl} skillLevel={skillLevel} />
            </Card>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ══ RESET BUTTON — after video ══ */}
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
            onMouseEnter={e => {
              e.currentTarget.style.background = `${C.sienna}18`;
              e.currentTarget.style.borderColor = C.sienna;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = `${C.sienna}55`;
            }}
          >
            <RotateCcw size={14} />
            New Photo
          </button>
        </div>
      )}

    </motion.div>
  );
}