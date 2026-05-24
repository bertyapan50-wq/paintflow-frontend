// @ts-nocheck
// src/components/paint-guide/MediumSelector.jsx — Atelier Noir Redesign
import React from "react";
import { motion } from "framer-motion";

/* ── Atelier Noir tokens ── */
const C = {
  sienna: "#c8793a",
  ochre:  "#e8b86d",
  cream:  "#f2e8d9",
  muted:  "#7a6a58",
  border: "rgba(200,121,58,0.18)",
};

const SKILL_LEVELS = [
  {
    id: "beginner",
    label: "Baguhan",
    icon: "🌱",
    subtitle: "Para sa mga nagsisimula",
    description: "4 hakbang lang: Grid, Sketch, Imprimatura, at Wet-on-Wet. Simple at madaling sundin.",
    phases: ["Grid", "Sketch", "Imprimatura", "Wet-on-Wet"],
    accent: "#5fa86d",
  },
  {
    id: "intermediate",
    label: "Katamtaman",
    icon: "🎨",
    subtitle: "Para sa may karanasan",
    description: "Buong 9-step Old Master process — grisaille, glazing, scumbling, at impasto.",
    phases: ["Grid", "Sketch", "Imprimatura", "Grisaille", "Wet-on-Wet", "Glaze", "Scumble", "Impasto", "Final"],
    accent: C.sienna,
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: "🔥",
    subtitle: "Para sa mga serious",
    description: "Full Old Master technique — detalyadong color theory, precise mixing ratios, at advanced color mixing sa bawat phase.",
    phases: ["Grid", "Sketch", "Imprimatura", "Grisaille", "Wet-on-Wet", "Glaze", "Scumble", "Impasto", "Final"],
    accent: "#c84a3a",
  },
];

export default function MediumSelector({ selected, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 11, letterSpacing: "0.14em",
          textTransform: "uppercase", color: C.sienna, margin: 0,
        }}>
          Skill Level
        </p>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 11px", borderRadius: 99, fontSize: 10, fontWeight: 600,
          background: `${C.sienna}15`, border: `1px solid ${C.sienna}35`,
          color: C.ochre, letterSpacing: "0.04em",
        }}>
          🎨 Oil Painting
        </span>
      </div>

      {/* ── Cards grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}>
        {SKILL_LEVELS.map((level, i) => {
          const isSelected = selected === level.id;
          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => onSelect(level.id)}
              style={{
                position: "relative", overflow: "hidden",
                padding: "16px 16px 14px",
                borderRadius: 14,
                border: `1px solid ${isSelected ? level.accent + "70" : C.border}`,
                background: isSelected
                  ? `linear-gradient(145deg, ${level.accent}18, ${level.accent}08)`
                  : "rgba(255,255,255,0.02)",
                boxShadow: isSelected ? `0 0 28px ${level.accent}22` : "none",
                cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 10,
                transition: "all 0.22s ease",
              }}
              whileHover={{ y: -2, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selected shimmer overlay */}
              {isSelected && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
                  borderRadius: 14, pointerEvents: "none",
                }} />
              )}

              {/* ── Icon row ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                <span style={{ fontSize: 24, lineHeight: 1 }}>{level.icon}</span>

                {/* Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: level.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 10px ${level.accent}60`,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* ── Labels ── */}
              <div style={{ position: "relative" }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18, fontWeight: 700, lineHeight: 1.1,
                  color: isSelected ? level.accent : C.cream,
                  margin: "0 0 3px",
                  transition: "color 0.2s",
                }}>
                  {level.label}
                </p>
                <p style={{
                  fontSize: 10, color: C.muted,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  margin: 0,
                }}>
                  {level.subtitle}
                </p>
              </div>

              {/* ── Description ── */}
              <p style={{
                fontSize: 11, color: isSelected ? `${C.cream}80` : C.muted,
                lineHeight: 1.6, margin: 0, position: "relative",
                transition: "color 0.2s",
              }}>
                {level.description}
              </p>

              {/* ── Phase pills ── */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, position: "relative" }}>
                {level.phases.map((p) => (
                  <span key={p} style={{
                    fontSize: 9, fontWeight: 600,
                    padding: "3px 7px", borderRadius: 99,
                    letterSpacing: "0.06em",
                    background: isSelected ? `${level.accent}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isSelected ? level.accent + "45" : C.border}`,
                    color: isSelected ? level.accent : C.muted,
                    transition: "all 0.2s",
                  }}>
                    {p}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}