// @ts-nocheck
// src/components/paint-guide/ImageUploader.jsx — Atelier Noir Redesign
import React, { useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Atelier Noir tokens ── */
const C = {
  canvas:  "#0c0907",
  sienna:  "#c8793a",
  ochre:   "#e8b86d",
  cream:   "#f2e8d9",
  muted:   "#7a6a58",
  border:  "rgba(200,121,58,0.18)",
};

const SKILL_CHIPS = [
  { key: "advanced", label: "🔥 Advanced", accent: "#c84a3a" },
];

export default function ImageUploader({ onImageSelected, isLoading, skillLevel = "advanced" }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview]       = useState(null);
  const [fileName, setFileName]     = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  };

  const processFile = (file) => {
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    onImageSelected(file);
  };

  /* dynamic border color */
  const borderColor = isDragging
    ? C.sienna
    : preview
    ? `${C.sienna}55`
    : C.border;

  const boxShadow = isDragging
    ? `0 0 60px ${C.sienna}22, inset 0 0 40px ${C.sienna}08`
    : "none";

  return (
    <motion.div
      onClick={() => !isLoading && fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      animate={{ borderColor, boxShadow }}
      transition={{ duration: 0.25 }}
      style={{
        position: "relative", overflow: "hidden",
        borderRadius: 20,
        border: `2px dashed ${borderColor}`,
        background: isDragging
          ? `${C.sienna}08`
          : preview
          ? `${C.sienna}05`
          : "rgba(255,255,255,0.015)",
        cursor: isLoading ? "default" : "pointer",
        opacity: isLoading ? 0.4 : 1,
        pointerEvents: isLoading ? "none" : "all",
        transition: "background 0.3s",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >

      {/* Ambient hover glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 50%, ${C.sienna}08 0%, transparent 70%)`,
        borderRadius: 20, opacity: isDragging ? 1 : 0,
        transition: "opacity 0.4s",
      }} />

      {/* Corner paint-stroke accents — only when empty */}
      {!preview && (
        <>
          {[
            { top: 0, left: 0,  borderTop: `2px solid ${C.sienna}40`, borderLeft:  `2px solid ${C.sienna}40`, borderRadius: "18px 0 0 0" },
            { top: 0, right: 0, borderTop: `2px solid ${C.sienna}40`, borderRight: `2px solid ${C.sienna}40`, borderRadius: "0 18px 0 0" },
            { bottom: 0, left: 0,  borderBottom: `2px solid ${C.sienna}40`, borderLeft:  `2px solid ${C.sienna}40`, borderRadius: "0 0 0 18px" },
            { bottom: 0, right: 0, borderBottom: `2px solid ${C.sienna}40`, borderRight: `2px solid ${C.sienna}40`, borderRadius: "0 0 18px 0" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
          ))}
        </>
      )}

      {/* Content */}
      <div style={{
        position: "relative",
        padding: "56px 32px",
        minHeight: 300,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 28,
      }}>
        <AnimatePresence mode="wait">

          {/* ── Preview state ── */}
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}
            >
              {/* Image */}
              <div style={{
                position: "relative", width: 148, height: 148,
                borderRadius: 16, overflow: "hidden",
                border: `2px solid ${C.sienna}55`,
                boxShadow: `0 0 32px ${C.sienna}30, 0 8px 32px rgba(0,0,0,0.5)`,
              }}>
                <img src={preview} alt="Reference" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {/* Bottom label overlay */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(12,9,7,0.85) 0%, transparent 100%)",
                  padding: "18px 8px 8px", textAlign: "center",
                }}>
                  <span style={{
                    fontSize: 10, color: C.ochre, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    Reference Photo
                  </span>
                </div>
              </div>

              {/* Filename + badges */}
              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16, fontWeight: 600, color: C.cream,
                  marginBottom: 10, maxWidth: 280,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {fileName}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: `${C.sienna}18`, border: `1px solid ${C.sienna}45`,
                    color: C.ochre,
                  }}>
                    🎨 Oil Painting
                  </span>
                  {SKILL_CHIPS.filter(c => c.key === skillLevel).map(c => (
                    <span key={c.key} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "5px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: `${c.accent}20`, border: `1px solid ${c.accent}50`,
                      color: c.accent,
                    }}>
                      {c.label}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: 12, color: C.muted, marginTop: 10, letterSpacing: "0.04em" }}>
                  Generating your AI tutorial…
                </p>
              </div>
            </motion.div>
          ) : (

            /* ── Empty / drag state ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
            >
              {/* Icon */}
              <motion.div
                animate={{
                  scale: isDragging ? 1.12 : 1,
                  rotate: isDragging ? [0, -4, 4, 0] : 0,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  width: 76, height: 76, borderRadius: 18,
                  background: `linear-gradient(135deg, ${C.sienna}25, ${C.ochre}12)`,
                  border: `1px solid ${C.sienna}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                  boxShadow: `0 0 ${isDragging ? 40 : 20}px ${C.sienna}${isDragging ? "40" : "18"}`,
                  transition: "box-shadow 0.3s",
                }}
              >
                <ImagePlus size={32} color={C.sienna} strokeWidth={1.5} />
                {/* Pulse ring */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 18,
                  border: `1px solid ${C.sienna}30`,
                  animation: "atelier-ping 2s cubic-bezier(0,0,0.2,1) infinite",
                }} />
              </motion.div>

              {/* Text */}
              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 700, color: C.cream,
                  marginBottom: 6, letterSpacing: "-0.01em",
                }}>
                  {isDragging ? "Drop it here!" : "Drop your reference photo here"}
                </p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
                  Nature, animals, landscapes, portraits — anything goes
                </p>
                <p style={{ fontSize: 11, color: `${C.muted}80`, letterSpacing: "0.04em" }}>
                  PNG · JPG · WebP · Max 15MB
                </p>
              </div>

              {/* CTA button */}
              <motion.div
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "11px 28px", borderRadius: 99,
                  background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                  color: "#0c0907", fontSize: 13, fontWeight: 700,
                  boxShadow: `0 0 28px ${C.sienna}50`,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                <Upload size={15} color="#0c0907" strokeWidth={2.5} />
                Choose a Photo
              </motion.div>

              {/* Skill level chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {SKILL_CHIPS.map((chip) => {
                  const isActive = chip.key === skillLevel;
                  return (
                    <span key={chip.key} style={{
                      fontSize: 11, padding: "4px 12px", borderRadius: 99,
                      background: isActive ? `${chip.accent}20` : `${chip.accent}08`,
                      border: `1px solid ${isActive ? chip.accent + "55" : chip.accent + "20"}`,
                      color: isActive ? chip.accent : `${chip.accent}70`,
                      fontWeight: isActive ? 600 : 400,
                      transition: "all 0.2s",
                    }}>
                      {chip.label}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Ping keyframe */}
      <style>{`
        @keyframes atelier-ping {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.5); opacity: 0;   }
          100% { transform: scale(1.5); opacity: 0;   }
        }
      `}</style>
    </motion.div>
  );
}