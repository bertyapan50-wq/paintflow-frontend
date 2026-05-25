// @ts-nocheck
// src/components/paint-guide/LoadingGuide.jsx — Atelier Noir Redesign
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Paintbrush, Sparkles } from "lucide-react";

/* ── Atelier Noir tokens ── */
const C = {
  sienna: "#c8793a",
  ochre:  "#e8b86d",
  cream:  "#f2e8d9",
  muted:  "#7a6a58",
};

const phases = [
  {
    icon: Palette,
    title: "Analyzing your photo",
    subtitle: "Examining color, composition, and subject",
    accent: C.sienna,
  },
  {
    icon: Paintbrush,
    title: "Building your tutorial",
    subtitle: "Each step is carefully crafted",
    accent: C.ochre,
  },
  {
    icon: Sparkles,
    title: "Almost done",
    subtitle: "Preparing your step-by-step guide",
    accent: C.sienna,
  },
];

/* Bar heights for the brush-stroke waveform */
const BARS = [0.6, 1, 0.7, 1.2, 0.5, 0.9, 0.6, 1.1, 0.8, 0.7, 1.3, 0.5];

export default function LoadingGuide() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [dots, setDots]             = useState("");

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 420);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPhaseIndex(p => Math.min(p + 1, phases.length - 1)), 3500);
    return () => clearInterval(id);
  }, []);

  const current = phases[phaseIndex];
  const Icon    = current.icon;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: 40, padding: "0 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── Animated icon ── */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {/* Outer ping ring */}
        <div style={{
          position: "absolute", width: 110, height: 110, borderRadius: "50%",
          border: `1px solid ${current.accent}25`,
          animation: "atelier-ping 2.2s cubic-bezier(0,0,0.2,1) infinite",
        }} />

        {/* Mid pulse ring */}
        <div style={{
          position: "absolute", width: 82, height: 82, borderRadius: "50%",
          border: `1px solid ${current.accent}35`,
          animation: "atelier-pulse 2s ease-in-out infinite",
        }} />

        {/* Icon box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phaseIndex}
            initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
            animate={{ scale: 1,   opacity: 1, rotate: 0   }}
            exit={{   scale: 0.8,  opacity: 0, rotate: 8   }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: `linear-gradient(135deg, ${current.accent}22, ${current.accent}08)`,
              border: `1px solid ${current.accent}45`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 32px ${current.accent}30`,
            }}
          >
            <Icon size={28} color={current.accent} strokeWidth={1.6} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Phase text ── */}
      <div style={{ textAlign: "center" }}>
        <AnimatePresence mode="wait">
          <motion.h3
            key={`title-${phaseIndex}`}
            initial={{ opacity: 0, y: 8  }}
            animate={{ opacity: 1, y: 0  }}
            exit={{   opacity: 0, y: -8  }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 26, fontWeight: 700,
              color: C.cream, margin: "0 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            {current.title}{dots}
          </motion.h3>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${phaseIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ fontSize: 13, color: C.muted, margin: 0 }}
          >
            {current.subtitle}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Progress pills ── */}
      <div style={{ display: "flex", gap: 8 }}>
        {phases.map((ph, i) => (
          <motion.div
            key={i}
            animate={{
              width:   i === phaseIndex ? 28 : 8,
              opacity: i <= phaseIndex  ? 1  : 0.25,
              background: i === phaseIndex ? ph.accent : C.muted,
            }}
            transition={{ duration: 0.4 }}
            style={{ height: 8, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* ── Brush-stroke waveform ── */}
      <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 40 }}>
        {BARS.map((h, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [h, h * 1.9, h] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.09,
              ease: "easeInOut",
            }}
            style={{
              width: 5, borderRadius: 99,
              height: `${h * 22}px`,
              originY: 1,
              background: i % 2 === 0
                ? `${C.sienna}60`
                : `${C.ochre}45`,
            }}
          />
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes atelier-ping {
          0%   { transform: scale(1);    opacity: 0.5; }
          70%  { transform: scale(1.55); opacity: 0;   }
          100% { transform: scale(1.55); opacity: 0;   }
        }
        @keyframes atelier-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1);    }
          50%       { opacity: 0.7; transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}