// src/pages/PreviewPage.jsx — Free Preview Feature
// @ts-nocheck
import API_URL from "../lib/api";
import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brush, Upload, ChevronRight, ChevronLeft,
  Sparkles, Loader2, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  loadImageToCanvas,
  generateStrokes,
  generateSketchStrokes,
  paintStroke,
  paintSketchStroke,
  drawImprimatura,
  drawGrid,
  PHASES,
} from "../utils/paintingAlgorithm";

/* ── Palette ── */
const C = {
  canvas: "#0c0907",
  sienna: "#c8793a",
  ochre:  "#e8b86d",
  cream:  "#f2e8d9",
  muted:  "#7a6a58",
  border: "rgba(200,121,58,0.18)",
  cardBg: "#16100a",
};

/* ── Which paintingAlgorithm phase maps to each tutorial step index ── */
// We'll snapshot the canvas at progressive painting stages
const STEP_PHASE_MAP = [
  "grid",        // step 0 → grid lines
  "sketch",      // step 1 → pencil sketch
  "imprimatura", // step 2 → warm wash
  "grisaille",   // step 3 → dead layer
  "wetOnWet",    // step 4 → first color
  "glaze",       // step 5 → glazing
  "scumble",     // step 6 → scumble highlights
  "detail",      // step 7 → impasto details
  "pixel",       // step 8 → final refinement
];

/* ══════════════════════════════════════════════════════════
   generateStepSnapshots
   Runs the full painting algorithm on an offscreen canvas
   and returns a base64 snapshot at each phase boundary.
══════════════════════════════════════════════════════════ */
async function generateStepSnapshots(imageBase64, stepCount) {
  // 1. Load image onto source canvas
  const { img, width, height } = await loadImageToCanvas(imageBase64, 512);

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
  srcCtx.drawImage(img, 0, 0, width, height);

  const paintCanvas = document.createElement("canvas");
  paintCanvas.width = width;
  paintCanvas.height = height;
  const paintCtx = paintCanvas.getContext("2d");

  const snapshots = [];

  // ── Composite canvas: used only for snapshotting ───────
  // We keep a separate "sketch" canvas so we can composite
  // it on top of the paint layer for early phases.
  const sketchCanvas = document.createElement("canvas");
  sketchCanvas.width = width;
  sketchCanvas.height = height;
  const sketchCtx = sketchCanvas.getContext("2d");

  const snap = (sketchOpacity = 0) => {
    // If sketchOpacity > 0, composite sketch over paint layer
    if (sketchOpacity > 0) {
      const composite = document.createElement("canvas");
      composite.width = width;
      composite.height = height;
      const cCtx = composite.getContext("2d");
      cCtx.drawImage(paintCanvas, 0, 0);
      cCtx.globalAlpha = sketchOpacity;
      cCtx.drawImage(sketchCanvas, 0, 0);
      cCtx.globalAlpha = 1;
      return composite.toDataURL("image/jpeg", 0.82);
    }
    return paintCanvas.toDataURL("image/jpeg", 0.82);
  };

  // ── Phase 0: Grid ─────────────────────────────────────
  paintCtx.fillStyle = "#f8f4ee";
  paintCtx.fillRect(0, 0, width, height);
  paintCtx.drawImage(img, 0, 0, width, height);
  paintCtx.globalAlpha = 0.55;
  paintCtx.fillStyle = "#f8f4ee";
  paintCtx.fillRect(0, 0, width, height);
  paintCtx.globalAlpha = 1;
  drawGrid(paintCtx, width, height, 6, 6, "rgba(99,102,241,0.55)");
  snapshots.push(snap()); // index 0 — no sketch overlay needed

  // ── Phase 1: Sketch ───────────────────────────────────
  // Draw sketch on its own canvas so we can reuse it later
  paintCtx.fillStyle = "#f8f4ee";
  paintCtx.fillRect(0, 0, width, height);
  drawGrid(paintCtx, width, height, 6, 6, "rgba(99,102,241,0.18)");
  const sketchStrokes = generateSketchStrokes(width, height, srcCtx);
  for (const s of sketchStrokes) paintSketchStroke(paintCtx, s);
  // Save sketch separately for compositing
  sketchCtx.clearRect(0, 0, width, height);
  sketchCtx.drawImage(paintCanvas, 0, 0);
  snapshots.push(snap()); // index 1

  // ── Phase 2: Imprimatura ──────────────────────────────
  // Start fresh paint layer, sketch composited on top at 0.55
  paintCtx.fillStyle = "#f8f4ee";
  paintCtx.fillRect(0, 0, width, height);
  paintCtx.fillStyle = "rgba(192,120,64,0.48)";
  paintCtx.fillRect(0, 0, width, height);
  drawImprimatura(paintCtx, width, height);
  snapshots.push(snap(0.55)); // index 2 — sketch visible through wash

  // ── Phases 3-8: Progressive painting strokes ─────────
  const allStrokes = generateStrokes(width, height);
  const phaseOrder = ["grisaille", "wetOnWet", "glaze", "scumble", "detail", "pixel"];
  // Sketch opacity fades as painting progresses: grisaille=0.40, wetOnWet=0.20, rest=0
  const sketchOpacityPerPhase = { grisaille: 0.40, wetOnWet: 0.18, glaze: 0, scumble: 0, detail: 0, pixel: 0 };
  const strokesByType = {};
  for (const s of allStrokes) {
    if (!strokesByType[s.type]) strokesByType[s.type] = [];
    strokesByType[s.type].push(s);
  }

   for (let pi = 0; pi < phaseOrder.length; pi++) {
  const type = phaseOrder[pi];
  const strokes = strokesByType[type] ?? [];
  for (let i = 0; i < strokes.length; i++) {
    paintStroke(paintCtx, srcCtx, strokes[i], width, height);
    if (i % 50 === 0) await new Promise(r => setTimeout(r, 0));
  }

  // ── Extra passes para sa pixel (final refinement) phase ──
  if (type === "pixel") {
    // Pass 1: extra scumble para mapunan ang gaps
    const extraScumble = (strokesByType["scumble"] ?? []).slice(0, 80);
    for (const s of extraScumble) paintStroke(paintCtx, srcCtx, s, width, height);
    await new Promise(r => setTimeout(r, 0));

    // Pass 2 & 3: double detail pass para sa crisp final look
    const extraDetail = (strokesByType["detail"] ?? []).slice(0, 120);
    for (const s of extraDetail) paintStroke(paintCtx, srcCtx, s, width, height);
    await new Promise(r => setTimeout(r, 0));
    for (const s of extraDetail) paintStroke(paintCtx, srcCtx, s, width, height);
    await new Promise(r => setTimeout(r, 0));
  }

  snapshots.push(snap(sketchOpacityPerPhase[type] ?? 0));
}

  // Trim or pad to stepCount
  const result = [];
  for (let i = 0; i < stepCount; i++) {
    const mapIdx = Math.min(
      Math.round((i / Math.max(1, stepCount - 1)) * (snapshots.length - 1)),
      snapshots.length - 1
    );
    result.push(snapshots[mapIdx]);
  }
  return result;
}

/* ── Ambient background ── */
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
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
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

/* ── Step Card ── */
function StepCard({ step, index, total, imageUrl }) {
  const progress = ((index + 1) / total) * 100;
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden" }}
    >
      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(200,121,58,0.12)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${C.sienna}, ${C.ochre})` }}
        />
      </div>

      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.sienna }}>
            Step {index + 1} of {total}
          </span>
          <span style={{ fontSize: 11, color: C.muted, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}` }}>
            {Math.round(progress)}% complete
          </span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, color: C.cream, margin: "0 0 16px", lineHeight: 1.2 }}>
          {step.title}
        </h2>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }} className="step-grid">
        {/* Image side */}
        <div style={{ position: "relative", minHeight: 280, background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
          {imageUrl ? (
            <motion.img
              key={imageUrl}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              src={imageUrl}
              alt={`Step ${index + 1} preview`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 280 }}>
              <Loader2 size={28} color={C.sienna} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 12, color: C.muted }}>Generating preview…</span>
            </div>
          )}
          <div style={{ position: "absolute", bottom: 12, left: 12, padding: "4px 10px", borderRadius: 99, background: "rgba(12,9,7,0.8)", backdropFilter: "blur(8px)", border: `1px solid ${C.border}`, fontSize: 10, color: C.ochre, fontWeight: 600, letterSpacing: "0.06em" }}>
            🖼️ AI Preview
          </div>
        </div>

        {/* Text side */}
        <div style={{ padding: "28px 28px 28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontSize: 14, color: C.cream, lineHeight: 1.75, margin: 0 }}>{step.description}</p>
          {step.tip && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: `${C.sienna}12`, border: `1px solid ${C.sienna}30`, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
              <p style={{ fontSize: 12, color: C.ochre, margin: 0, lineHeight: 1.6 }}>{step.tip}</p>
            </div>
          )}
          {step.colors?.length > 0 && (
            <div>
              <p style={{ fontSize: 10, color: C.muted, margin: "0 0 8px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Colors used</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {step.colors.map((color, i) => (
                  <span key={i} style={{ fontSize: 11, color: C.cream, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}` }}>
                    🎨 {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Upload Zone ── */
function UploadZone({ onFileSelected, isLoading }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFileSelected(file);
  }, [onFileSelected]);

  return (
    <div
      onClick={() => !isLoading && inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{ border: `2px dashed ${dragOver ? C.sienna : C.border}`, borderRadius: 20, padding: "52px 32px", textAlign: "center", cursor: isLoading ? "not-allowed" : "pointer", background: dragOver ? `${C.sienna}08` : "rgba(255,255,255,0.02)", transition: "all 0.25s", position: "relative", overflow: "hidden" }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg, ${C.sienna}22, ${C.ochre}11)`, border: `1px solid ${C.sienna}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        {isLoading
          ? <Loader2 size={24} color={C.sienna} style={{ animation: "spin 1s linear infinite" }} />
          : <Upload size={24} color={C.sienna} />}
      </div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: C.cream, margin: "0 0 8px" }}>
        {isLoading ? "Generating your tutorial…" : "Drop your photo here"}
      </p>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 20px" }}>
        {isLoading ? "This may take 20–40 seconds. Hang tight! 🎨" : "or click to browse · JPG, PNG, WEBP"}
      </p>
      {!isLoading && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 99, background: `linear-gradient(135deg, ${C.sienna}, #a05a28)`, color: "#fff", fontSize: 13, fontWeight: 600, boxShadow: `0 4px 20px ${C.sienna}40` }}>
          <Sparkles size={13} /> Generate Free Tutorial
        </span>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelected(f); }} style={{ display: "none" }} />
    </div>
  );
}

/* ── Completed Banner ── */
function CompletedBanner({ title, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: C.cardBg, border: `1px solid ${C.sienna}40`, borderRadius: 20, padding: "36px 32px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${C.sienna}20`, border: `2px solid ${C.sienna}50`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <CheckCircle2 size={28} color={C.sienna} />
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: C.cream, margin: "0 0 10px" }}>Tutorial Complete! 🎉</h2>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 28px", lineHeight: 1.7, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
        You just previewed <strong style={{ color: C.ochre }}>"{title}"</strong>. Want full narrated video, advanced techniques, and more detail?
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 99, background: `linear-gradient(135deg, ${C.sienna}, #a05a28)`, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: `0 4px 24px ${C.sienna}40` }}>
          <Brush size={15} /> Get Full Tutorial — $2.99
        </a>
        <button onClick={onReset} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, cursor: "pointer" }}>
          Try Another Photo
        </button>
      </div>
    </motion.div>
  );
}

/* ══ MAIN PAGE ══ */
export default function PreviewPage() {
  const navigate = useNavigate();
  const [phase, setPhase]             = useState("upload"); // upload | loading | steps | done
  const [imageUrl, setImageUrl]       = useState(null);
  const [tutorial, setTutorial]       = useState(null);
  const [stepImages, setStepImages]   = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingMsg, setLoadingMsg]   = useState("Analyzing your photo…");

  const LOADING_MSGS = [
    "Analyzing your photo…",
    "Crafting your oil painting tutorial…",
    "Rendering painting stages…",
    "Almost ready — finalizing previews…",
  ];

  const handleFileSelected = async (file) => {
    setPhase("loading");
    setCurrentStep(0);
    setStepImages([]);

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      setLoadingMsg(LOADING_MSGS[msgIdx]);
    }, 3500);

    try {
      // 1. Read file as base64
      const imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      setImageUrl(imageBase64);

      // 2. Generate tutorial text from backend
      const res = await fetch(`${API_URL}/api/tutorial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, medium: "oil", skillLevel: "intermediate" }),
      });
      if (!res.ok) throw new Error("Failed to generate tutorial");
      const data = await res.json();

      const steps = (data.steps || []).map((s, i) => ({
        title:        s.title        || `Step ${i + 1}`,
        description:  s.description  || "",
        tip:          s.tip          || "",
        colors:       s.colors       || [],
        image_prompt: s.image_prompt || s.title || "",
      }));

      setTutorial({ ...data, steps });
      // Initialize with nulls so spinner shows immediately
      setStepImages(new Array(steps.length).fill(null));
      setPhase("steps");

      // 3. Generate all step snapshots using paintingAlgorithm — browser-side, no API
      const snapshots = await generateStepSnapshots(imageBase64, steps.length);
      setStepImages(snapshots);

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again!");
      setPhase("upload");
    } finally {
      clearInterval(msgInterval);
    }
  };

  const handleReset = () => {
    setPhase("upload");
    setTutorial(null);
    setImageUrl(null);
    setStepImages([]);
    setCurrentStep(0);
  };

  const goNext = () => {
    if (currentStep < tutorial.steps.length - 1) setCurrentStep(s => s + 1);
    else setPhase("done");
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.cream, background: C.canvas }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .step-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <AtelierCanvas />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ══ HEADER ══ */}
        <header style={{ borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(16px)", background: "rgba(12,9,7,0.75)", position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${C.sienna}55` }}>
                <Brush size={16} color="#0c0907" strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, letterSpacing: "0.03em", color: C.cream, lineHeight: 1.1 }}>
                  PaintFlow <span style={{ color: C.sienna, fontStyle: "italic" }}>AI</span>
                </div>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>Free Preview</div>
              </div>
            </button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, border: `1px solid ${C.sienna}40`, background: `${C.sienna}12`, color: C.ochre, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
                ✨ Free
              </span>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 99, background: `linear-gradient(135deg, ${C.sienna}, #a05a28)`, color: "#fff", fontSize: 11, fontWeight: 600, textDecoration: "none", boxShadow: `0 2px 12px ${C.sienna}40` }}>
                Get Full Tutorial →
              </a>
            </div>
          </div>
          <Divider />
        </header>

        {/* ══ MAIN ══ */}
        <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "48px 20px" }}>
          <AnimatePresence mode="wait">

            {/* ── Upload ── */}
            {phase === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 16px", borderRadius: 99, border: `1px solid ${C.sienna}40`, background: `${C.sienna}10`, color: C.ochre, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
                    <Sparkles size={12} color={C.sienna} /> Free Step-by-Step Preview · No Payment Needed
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1, color: C.cream, margin: "0 0 16px" }}>
                    See your photo as an{" "}
                    <span style={{ color: C.sienna, fontStyle: "italic" }}>oil painting</span>
                    <br />step by step — <span style={{ color: C.ochre, fontStyle: "italic" }}>for free.</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
                    style={{ fontSize: 15, color: C.muted, maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7 }}>
                    Upload any photo and get a free 7–10 step oil painting tutorial with AI-generated image previews for every stage.
                  </motion.p>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }}
                    style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}>
                    {[
                      { icon: "🖼️", text: "AI Image per Step" },
                      { icon: "🎨", text: "7–10 Detailed Steps" },
                      { icon: "✅", text: "100% Free" },
                      { icon: "💡", text: "Tips & Color Guide" },
                    ].map((f, i) => (
                      <motion.span key={f.text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 + i * 0.06 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.muted, fontSize: 12 }}>
                        {f.icon} {f.text}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                <Divider style={{ marginBottom: 36 }} />
                <UploadZone onFileSelected={handleFileSelected} isLoading={false} />
                <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: `${C.muted}70`, letterSpacing: "0.04em" }}>
                  Best results with clear photos — landscapes, portraits, still life 🎨
                </p>
              </motion.div>
            )}

            {/* ── Loading ── */}
            {phase === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "80px 20px" }}>
                {imageUrl && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ width: 160, height: 160, borderRadius: 20, overflow: "hidden", margin: "0 auto 32px", border: `2px solid ${C.border}`, boxShadow: `0 0 40px ${C.sienna}30` }}>
                    <img src={imageUrl} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </motion.div>
                )}
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${C.sienna}20`, border: `2px solid ${C.sienna}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <Loader2 size={24} color={C.sienna} style={{ animation: "spin 1s linear infinite" }} />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: C.cream, margin: "0 0 12px" }}>
                  {loadingMsg}
                </h2>
                <p style={{ fontSize: 13, color: C.muted }}>Our AI is crafting your personalized oil painting tutorial…</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      style={{ width: 8, height: 8, borderRadius: "50%", background: C.sienna }} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Steps ── */}
            {phase === "steps" && tutorial && (
              <motion.div key="steps" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ marginBottom: 32, textAlign: "center" }}>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, color: C.cream, margin: "0 0 10px" }}>
                    {tutorial.title}
                  </h1>
                  <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>{tutorial.overview}</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
                    {tutorial.estimated_time && (
                      <span style={{ fontSize: 12, color: C.ochre, padding: "4px 12px", borderRadius: 99, background: `${C.ochre}12`, border: `1px solid ${C.ochre}25` }}>
                        ⏱ {tutorial.estimated_time}
                      </span>
                    )}
                    {tutorial.difficulty && (
                      <span style={{ fontSize: 12, color: C.sienna, padding: "4px 12px", borderRadius: 99, background: `${C.sienna}12`, border: `1px solid ${C.sienna}25` }}>
                        🎨 {tutorial.difficulty}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: C.muted, padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}` }}>
                      {tutorial.steps.length} Steps
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <StepCard
                    key={currentStep}
                    step={tutorial.steps[currentStep]}
                    index={currentStep}
                    total={tutorial.steps.length}
                    imageUrl={stepImages[currentStep]}
                  />
                </AnimatePresence>

                {/* Navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
                  <button onClick={goPrev} disabled={currentStep === 0}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 99, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, color: currentStep === 0 ? `${C.muted}40` : C.muted, fontSize: 14, cursor: currentStep === 0 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {/* Step dots */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {tutorial.steps.map((_, i) => (
                      <button key={i} onClick={() => setCurrentStep(i)}
                        style={{ width: i === currentStep ? 20 : 7, height: 7, borderRadius: 99, background: i === currentStep ? C.sienna : `${C.muted}40`, border: "none", cursor: "pointer", transition: "all 0.25s", padding: 0 }} />
                    ))}
                  </div>

                  <button onClick={goNext}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 99, background: `linear-gradient(135deg, ${C.sienna}, #a05a28)`, color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: `0 4px 20px ${C.sienna}40`, transition: "all 0.2s" }}>
                    {currentStep === tutorial.steps.length - 1 ? "Finish 🎉" : "Next Step"}
                    {currentStep < tutorial.steps.length - 1 && <ChevronRight size={16} />}
                  </button>
                </div>

                {/* Upsell nudge */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                  style={{ marginTop: 32, padding: "18px 24px", borderRadius: 14, background: `${C.sienna}0c`, border: `1px solid ${C.sienna}25`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, color: C.ochre, fontWeight: 600, margin: "0 0 2px" }}>🎙️ Want narrated video + advanced detail?</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Upgrade for full AI-narrated video tutorial, color mixing ratios & more.</p>
                  </div>
                  <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 99, background: `linear-gradient(135deg, ${C.sienna}, #a05a28)`, color: "#fff", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", boxShadow: `0 2px 12px ${C.sienna}35` }}>
                    Unlock Full Tutorial — $2.99
                  </a>
                </motion.div>
              </motion.div>
            )}

            {/* ── Done ── */}
            {phase === "done" && tutorial && (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CompletedBanner title={tutorial.title} onReset={handleReset} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* ══ FOOTER ══ */}
        <footer>
          <Divider />
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brush size={12} color="#0c0907" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>PaintFlow AI</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <a href="/privacy" style={{ fontSize: 11, color: `${C.muted}88`, textDecoration: "none" }}>Privacy</a>
              <a href="/terms" style={{ fontSize: 11, color: `${C.muted}88`, textDecoration: "none" }}>Terms</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}