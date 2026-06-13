// src/components/paint-guide/PaintingTimelapse.jsx
import { useRef, useState, useEffect } from "react";
import {
  loadImageToCanvas,
  generateStrokes,
  generateSketchStrokes,
  paintStroke,
  paintSketchStroke,
  drawImprimatura,
  drawGrid,
  PHASES,
} from "../../utils/paintingAlgorithm";
import {
  initVoice,
  enqueueCaption,
  flushSpeech,
  pauseSpeech,
  resumeSpeech,
} from "../../utils/voiceManager";

const BATCH_SIZE = 8;
const CAPTION_DURATION_MS = 5500;

// ═══════════════════════════════════════════════════════════
//  SKILL LEVEL CONFIG
// ═══════════════════════════════════════════════════════════
const SKILL_CONFIG = {
  beginner: {
    strokeTypes: ["grisaille", "wetOnWet"],
    // 4 phases only — no grisaille, no pixel/final
    phaseIds:    ["grid", "sketch", "imprimatura", "wetOnWet"],
    label:       "Beginner 🌱",
    titleSub:    "Beginner Oil Painting • 4 Steps",
    useAdvancedCaptions: false,
  },
  intermediate: {
    strokeTypes: ["grisaille", "wetOnWet", "glaze", "scumble", "detail", "pixel"],
    phaseIds:    ["grid", "sketch", "imprimatura", "grisaille", "wetOnWet", "glaze", "scumble", "detail", "pixel"],
    label:       "Intermediate 🎨",
    titleSub:    "Old Master Technique • 9 Steps",
    useAdvancedCaptions: false,
  },
  advanced: {
    strokeTypes: ["grisaille", "wetOnWet", "glaze", "scumble", "detail", "pixel"],
    phaseIds:    ["grid", "sketch", "imprimatura", "grisaille", "wetOnWet", "glaze", "scumble", "detail", "pixel"],
    label:       "Advanced 🔥",
    titleSub:    "Classical Old Master • Technical Mode",
    useAdvancedCaptions: true,
  },
};

// ═══════════════════════════════════════════════════════════
//  COLOR MIXES — Standard (Beginner / Intermediate)
// ═══════════════════════════════════════════════════════════
const COLOR_MIXES = {
  grid: null,
  sketch: null,
  imprimatura: {
    label: "Imprimatura Mix",
    mixes: [
      { a: { color: "#8B4513", name: "Burnt Sienna" }, b: { color: "#F5DEB3", name: "Turpentine" }, result: { color: "#C8803A", name: "Thin Warm Wash" }, ratio: "2 : 1" },
    ],
  },
  grisaille: {
    label: "Grisaille Mix",
    mixes: [
      { a: { color: "#6B3A2A", name: "Burnt Umber" }, b: { color: "#FFFFFF", name: "Titanium White" }, result: { color: "#9C8070", name: "Mid Grey-Brown" }, ratio: "1 : 2" },
      { a: { color: "#6B3A2A", name: "Burnt Umber" }, b: { color: "#1a1a1a", name: "Ivory Black" }, result: { color: "#2C1810", name: "Deep Shadow" }, ratio: "2 : 1" },
    ],
  },
  wetOnWet: {
    label: "Wet-on-Wet Mix",
    mixes: [
      { a: { color: "#CD5C5C", name: "Cadmium Red" },  b: { color: "#FFFFFF", name: "Titanium White" }, result: { color: "#E8A090", name: "Warm Skin" },   ratio: "1 : 3" },
      { a: { color: "#4169E1", name: "Ultramarine" },  b: { color: "#6B3A2A", name: "Burnt Umber" },   result: { color: "#2C2840", name: "Cool Shadow" }, ratio: "1 : 1" },
      { a: { color: "#DAA520", name: "Yellow Ochre" }, b: { color: "#FFFFFF", name: "Titanium White" }, result: { color: "#E8C97A", name: "Light Tone" },  ratio: "1 : 2" },
    ],
  },
  glaze: {
    label: "Glaze Mix",
    mixes: [
      { a: { color: "#8B0000", name: "Alizarin Crimson" }, b: { color: "#DAA520", name: "Linseed Oil" }, result: { color: "#9B2020", name: "Red Glaze" },  ratio: "1 : 4" },
      { a: { color: "#00008B", name: "Prussian Blue" },    b: { color: "#DAA520", name: "Linseed Oil" }, result: { color: "#001A4D", name: "Blue Glaze" }, ratio: "1 : 4" },
    ],
  },
  scumble: {
    label: "Scumble Mix",
    mixes: [
      { a: { color: "#FFFFFF", name: "Titanium White" }, b: { color: "#DAA520", name: "Yellow Ochre" }, result: { color: "#F0E0A0", name: "Warm Highlight" }, ratio: "3 : 1" },
    ],
  },
  detail: {
    label: "Impasto Mix",
    mixes: [
      { a: { color: "#FFFFFF", name: "Titanium White" }, b: { color: "#FFD700", name: "Cadmium Yellow" }, result: { color: "#FFFAAA", name: "Bright Impasto" }, ratio: "2 : 1" },
      { a: { color: "#6B3A2A", name: "Burnt Umber" },    b: { color: "#1a1a1a", name: "Ivory Black" },    result: { color: "#1C0F08", name: "Deep Detail" },   ratio: "1 : 1" },
    ],
  },
  pixel: null,
};

// ═══════════════════════════════════════════════════════════
//  ADVANCED COLOR MIXES — Technical, more detailed
// ═══════════════════════════════════════════════════════════
const ADVANCED_COLOR_MIXES = {
  grid: null,
  sketch: null,
  imprimatura: {
    label: "Imprimatura — Toned Ground",
    mixes: [
      {
        a: { color: "#8B4513", name: "Burnt Sienna (PBr7)" },
        b: { color: "#E8D5A3", name: "Rectified Turpentine" },
        result: { color: "#C8803A", name: "Warm Mid-Tone Ground" },
        ratio: "2 : 1",
        note: "Fat-over-lean: very lean layer. Dry 2–4 hrs."
      },
      {
        a: { color: "#5C4A1E", name: "Raw Umber (PBr7)" },
        b: { color: "#E8D5A3", name: "Rectified Turpentine" },
        result: { color: "#7A6035", name: "Cool Neutral Ground" },
        ratio: "1 : 1",
        note: "Alternative: cooler ground for blue-dominant subjects."
      },
    ],
  },
  grisaille: {
    label: "Grisaille — Value Structure",
    mixes: [
      {
        a: { color: "#6B3A2A", name: "Burnt Umber (PBr7)" },
        b: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        result: { color: "#9C8070", name: "Mid Value (Value 5)" },
        ratio: "1 : 2",
        note: "Aim for a 5-step value scale. This is your middle grey."
      },
      {
        a: { color: "#6B3A2A", name: "Burnt Umber (PBr7)" },
        b: { color: "#1a1a1a", name: "Ivory Black (PBk9)" },
        result: { color: "#2C1810", name: "Deep Shadow (Value 1–2)" },
        ratio: "2 : 1",
        note: "Never pure black. Max ~80% dark to preserve depth."
      },
      {
        a: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        b: { color: "#6B3A2A", name: "Burnt Umber (trace)" },
        result: { color: "#EDE0D0", name: "Highlight (Value 8–9)" },
        ratio: "8 : 1",
        note: "Reserve brightest white for impasto stage only."
      },
    ],
  },
  wetOnWet: {
    label: "Wet-on-Wet — Chromatic Layer",
    mixes: [
      {
        a: { color: "#CD5C5C", name: "Cadmium Red (PR108)" },
        b: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        result: { color: "#E8A090", name: "Warm Skin Light" },
        ratio: "1 : 3",
        note: "Push into wet grisaille — don't float on top."
      },
      {
        a: { color: "#DAA520", name: "Yellow Ochre (PY43)" },
        b: { color: "#CD5C5C", name: "Cadmium Red (small)" },
        result: { color: "#D4882A", name: "Mid Skin (Zorn Palette)" },
        ratio: "3 : 1",
        note: "Zorn palette: Ivory Black + White + Yellow Ochre + Cad Red."
      },
      {
        a: { color: "#4169E1", name: "Ultramarine (PB29)" },
        b: { color: "#6B3A2A", name: "Burnt Umber (PBr7)" },
        result: { color: "#2C2840", name: "Cool Shadow (neutralized)" },
        ratio: "1 : 1",
        note: "Complementary mix — no black needed for neutral darks."
      },
      {
        a: { color: "#4169E1", name: "Ultramarine (PB29)" },
        b: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        result: { color: "#7090D0", name: "Cool Halftone" },
        ratio: "1 : 4",
        note: "Temperature shift: warm lights, cool shadows = luminosity."
      },
    ],
  },
  glaze: {
    label: "Glazing — Optical Depth",
    mixes: [
      {
        a: { color: "#8B0000", name: "Alizarin Crimson (PR83)" },
        b: { color: "#C4A35A", name: "Linseed + Stand Oil (3:1)" },
        result: { color: "#9B2020", name: "Warm Shadow Glaze" },
        ratio: "1 : 5",
        note: "Transparent glaze. 24–48 hrs dry time between coats."
      },
      {
        a: { color: "#00008B", name: "Prussian Blue (PB27)" },
        b: { color: "#C4A35A", name: "Linseed + Stand Oil (3:1)" },
        result: { color: "#001A4D", name: "Atmospheric Recession Glaze" },
        ratio: "1 : 5",
        note: "Blue glaze on darks — pushes them back spatially."
      },
      {
        a: { color: "#DAA520", name: "Yellow Ochre (PY43)" },
        b: { color: "#C4A35A", name: "Linseed Oil" },
        result: { color: "#C8901A", name: "Warm Skin Glaze" },
        ratio: "1 : 4",
        note: "Titian's secret: warm yellow glaze over cool flesh."
      },
    ],
  },
  scumble: {
    label: "Scumbling — Broken Color",
    mixes: [
      {
        a: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        b: { color: "#DAA520", name: "Yellow Ochre (PY43)" },
        result: { color: "#F0E0A0", name: "Warm Highlight Scumble" },
        ratio: "4 : 1",
        note: "Scrub 90% paint off brush. Circular motion, hog bristle."
      },
      {
        a: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        b: { color: "#4169E1", name: "Ultramarine (trace)" },
        result: { color: "#D8E4F5", name: "Cool Light Scumble" },
        ratio: "6 : 1",
        note: "For atmospheric highlights — sky, fabric, cool skin areas."
      },
    ],
  },
  detail: {
    label: "Impasto — Focal Point",
    mixes: [
      {
        a: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        b: { color: "#FFD700", name: "Cadmium Yellow Lt (PY35)" },
        result: { color: "#FFFAAA", name: "Highest-Key Impasto" },
        ratio: "3 : 1",
        note: "Reserve for single focal highlight. One stroke. Don't go back."
      },
      {
        a: { color: "#FFFFFF", name: "Titanium White (PW6)" },
        b: { color: "#CD5C5C", name: "Cadmium Red (PY108)" },
        result: { color: "#F4C0B0", name: "Warm Highlight Impasto" },
        ratio: "4 : 1",
        note: "Palette knife for maximum texture — 3D light-catching effect."
      },
      {
        a: { color: "#6B3A2A", name: "Burnt Umber (PBr7)" },
        b: { color: "#1a1a1a", name: "Ivory Black (PBk9)" },
        result: { color: "#1C0F08", name: "Deep Accent (final darks)" },
        ratio: "1 : 1",
        note: "Sharpest darks last — anchors the composition."
      },
    ],
  },
  pixel: {
    label: "Final Refinement Checklist",
    mixes: [
      {
        a: { color: "#FFFFFF", name: "Stand Oil" },
        b: { color: "#C4A35A", name: "Damar Varnish (diluted)" },
        result: { color: "#F5EED0", name: "Isolation Coat" },
        ratio: "1 : 1",
        note: "Apply after 6 months dry. Protects before final varnish."
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
//  PHASE INDEX
// ═══════════════════════════════════════════════════════════
const PHASE_INDEX = {
  grisaille: 3,
  wetOnWet:  4,
  glaze:     5,
  scumble:   6,
  detail:    7,
  pixel:     8,
};

// ═══════════════════════════════════════════════════════════
//  TECHNIQUE STEPS
// ═══════════════════════════════════════════════════════════
const TECHNIQUE_STEPS = {
  grid: [
    "Divide your paper into a 6×6 grid using a ruler and pencil.",
    "Draw the same grid on your reference photo.",
    "Each cell in the reference matches one cell on your paper.",
  ],
  sketch: [
    "Use an HB or 2B pencil — keep a light touch.",
    "Look at one cell in the reference, then draw it in the matching cell.",
    "Follow the edges and outlines of shapes, not the details.",
    "Erase and redo until the proportions feel right.",
  ],
  imprimatura: [
    "Dilute Burnt Sienna in turpentine — aim for a thin wash.",
    "Apply evenly across the canvas using a large flat brush.",
    "Let it dry for 15–30 minutes before moving on.",
  ],
  grisaille: [
    "Mix Burnt Umber + Titanium White for your mid-tone.",
    "Add Ivory Black for the darkest areas.",
    "Paint from lightest to darkest values.",
    "No color yet — stay in grey and sepia tones for now.",
  ],
  wetOnWet: [
    "Make sure the previous layer is still wet.",
    "Apply color directly onto the wet surface.",
    "Let the colors blend naturally — avoid over-mixing.",
    "Use a soft brush for smooth, fluid blending.",
  ],
  glaze: [
    "Make sure the previous layer is fully dry.",
    "Mix your color with linseed oil — 1 part pigment, 4 parts oil.",
    "Apply thin and even with a soft brush.",
    "Let each glaze dry completely before adding another.",
  ],
  scumble: [
    "Load a small amount of paint onto the brush, then wipe most of it off on a cloth.",
    "The brush should be almost dry — very little paint.",
    "Light, quick strokes — don't press the brush down.",
    "Use this technique on highlights and light areas.",
  ],
  detail: [
    "Use a small brush or palette knife for impasto.",
    "Apply thick paint to the brightest areas.",
    "One confident stroke — don't go back over it.",
    "Let the texture of the brushstroke show.",
  ],
  pixel: [
    "Step back from the painting — view it from 1–2 meters away.",
    "Compare to your reference — what's missing or off?",
    "Small adjustments only — don't touch what's already working.",
    "When it looks great from a distance — you're done!",
  ],
};

// ═══════════════════════════════════════════════════════════
//  INSTRUCTOR CAPTIONS (Beginner / Intermediate)
// ═══════════════════════════════════════════════════════════
const INSTRUCTOR_CAPTIONS = {
  grid: [
    "First, let's divide our canvas into equal sections using the grid method.",
    "Each cell in the reference matches a cell on your canvas.",
    "The grid helps you get the proportions of your drawing just right.",
    "Look for the main lines — where each shape begins and ends.",
  ],
  sketch: [
    "Now let's lightly sketch the main shapes.",
    "Keep a light hand — don't press hard. Mistakes can always be erased.",
    "Follow the edges of each shape, cell by cell, from your reference.",
    "Don't worry about details yet — focus on the big shapes first.",
  ],
  imprimatura: [
    "This is the imprimatura — a thin wash of warm color to tone the canvas.",
    "Apply burnt sienna diluted in turpentine across the entire canvas.",
    "This warm tone will give depth to all the layers that follow.",
    "Let it dry completely before moving on to the next step.",
  ],
  grisaille: [
    "This is the grisaille — the dead layer. Paint everything in sepia and grey first.",
    "No color yet at this stage — values are our only focus.",
    "Values are the difference between light and dark in your painting.",
    "If your values are correct here, the painting will look great even without color.",
  ],
  wetOnWet: [
    "Now comes wet-on-wet — this is where we apply color.",
    "Apply paint while the canvas is still wet so colors blend naturally.",
    "Don't over-mix — let the colors bleed into each other.",
    "Use large brushes for broad areas, smaller ones for detail.",
  ],
  glaze: [
    "Glazing means applying thin, transparent color on top of dried paint.",
    "Mix your color with linseed oil to make it transparent.",
    "Let each glaze dry before applying another one.",
    "Glazing gives classic paintings their depth and luminosity.",
  ],
  scumble: [
    "Scumbling is a dry brush technique — used for highlights and texture.",
    "Wipe most of the paint off the brush before applying it to the canvas.",
    "Light, quick strokes — don't press the brush down.",
    "Watch how the texture changes as you build up the scumbling.",
  ],
  detail: [
    "This is the most exciting part — details and impasto.",
    "Use a stiff brush or palette knife for thick paint.",
    "One confident stroke — don't repeat it or over-blend.",
    "Impasto on the highlights gives the painting a three-dimensional look.",
  ],
  pixel: [
    "Last step — final refinement.",
    "Step back and look at your painting from a distance. That's the real test.",
    "Compare your work to the reference and fix what's left.",
    "When it looks great from far away, your masterpiece is done!",
  ],
};

// ═══════════════════════════════════════════════════════════
//  ADVANCED CAPTIONS — Technical / Color Theory
// ═══════════════════════════════════════════════════════════
const ADVANCED_CAPTIONS = {
  grid: [
    "The grid method was used by Renaissance masters to transfer cartoons to large panels.",
    "Divide your reference into thirds — notice how the focal points align with the intersections.",
    "Study the negative space in each cell — it's as important as the positive shapes.",
    "Your eye should move fluidly between reference and canvas without tilting your head.",
  ],
  sketch: [
    "Sketch with the shoulder, not the wrist — longer, more confident lines.",
    "Sight your proportions: close one eye, hold your brush at arm's length, measure.",
    "Find the largest rhythm of the composition first — the C or S curve of the design.",
    "Ghost your lines before committing — hover the pencil over the paper first.",
  ],
  imprimatura: [
    "The imprimatura unifies the canvas and eliminates the intimidating white ground.",
    "Burnt sienna in turpentine — very lean. Fat over lean is the golden rule in oils.",
    "The warm undertone will influence every color you apply over it — plan for this.",
    "Consider a cool imprimatura — raw umber or terre verte — for blue-dominant subjects.",
  ],
  grisaille: [
    "In classical technique, the grisaille establishes your entire value structure.",
    "Rembrandt used grisaille to map every shadow and highlight before touching color.",
    "Your darkest dark should be about 80% black — don't go full black in oils.",
    "The lost edges in your grisaille will become the soft transitions in your final painting.",
    "Apply burnt umber in thin, confident strokes — no overworking the surface.",
  ],
  wetOnWet: [
    "Alla prima wet-on-wet: apply color directly into the wet grisaille.",
    "Push color into the wet surface — don't float it on top.",
    "For skin tones: cadmium red + yellow ochre + white, warmed with burnt sienna.",
    "Cool shadows with ultramarine + burnt umber — neutralizes without going muddy.",
    "The boundary between warm and cool temperature is where luminosity lives.",
  ],
  glaze: [
    "Each glaze layer multiplies optical depth — Titian applied up to 40 layers.",
    "Alizarin crimson glaze over warm shadows — the secret to glowing skin tones.",
    "Prussian blue glaze into cool shadows for atmospheric depth and recession.",
    "Medium ratio: 1 part pigment, 3 parts linseed oil, 1 part stand oil for slow dry.",
    "Never glaze over paint that isn't bone dry — minimum 24–48 hours between layers.",
  ],
  scumble: [
    "Scumbling is optically broken color — light bounces between paint layers.",
    "Load your brush, then scrub 90% of the paint off on a dry rag before applying.",
    "Work in circular motions with a hog bristle brush for maximum texture.",
    "Rembrandt scumbled titanium white into highlights for his famous impasto glow.",
    "Scumbling cools or lightens an area without actually mixing the paint — keep it optical.",
  ],
  detail: [
    "Impasto reserves the highest-key lights — your lightest lights painted thickest.",
    "One stroke, one decision. Hesitation destroys impasto — commit and don't go back.",
    "Use a painting knife for the most textured, three-dimensional impasto marks.",
    "The thick paint will catch light differently depending on viewing angle — use this.",
    "Save your highest chroma and brightest value for the single focal point of the painting.",
  ],
  pixel: [
    "The final refinement is the editing phase — remove, not add.",
    "Squint at your painting — lose the detail, see only value and mass.",
    "Compare your painting to the reference at equal distances for an objective view.",
    "Edge control is the final adjustment: sharpen focal edges, soften peripheral ones.",
    "When you can find nothing more to improve — sign it. Knowing when to stop is mastery.",
  ],
};

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
function groupStrokesByColor(strokes, pixels, width, height, bucketSize = 36) {
  if (!strokes.length) return strokes;
  const withColor = strokes.map(s => {
    const ix  = Math.max(0, Math.min(Math.floor(s.x), width  - 1));
    const iy  = Math.max(0, Math.min(Math.floor(s.y), height - 1));
    const pi  = (iy * width + ix) * 4;
    const r = pixels[pi], g = pixels[pi+1], b = pixels[pi+2];
    const key = `${Math.floor(r/bucketSize)}_${Math.floor(g/bucketSize)}_${Math.floor(b/bucketSize)}`;
    return { stroke: s, r, g, b, key, brightness: r*.299+g*.587+b*.114 };
  });
  const groups = new Map();
  for (const item of withColor) {
    if (!groups.has(item.key)) groups.set(item.key, []);
    groups.get(item.key).push(item.stroke);
  }
  return [...groups.values()].sort((a, b) => {
    const bA = withColor.find(w => w.stroke === a[0])?.brightness ?? 0;
    const bB = withColor.find(w => w.stroke === b[0])?.brightness ?? 0;
    return bA - bB;
  }).flat();
}

function drawPencil(ctx, tipX, tipY, holdAngle, size) {
  const s          = Math.max(0.5, size / 10);
  const tipLen     = 10 * s;
  const woodLen    = 8  * s;
  const bodyLen    = 60 * s;
  const ferruleLen = 8  * s;
  const eraserLen  = 10 * s;
  const w          = 5  * s;

  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(holdAngle);

  // Graphite tip
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-w * 0.3, tipLen);
  ctx.lineTo( w * 0.3, tipLen);
  ctx.closePath();
  ctx.fillStyle = "#2a2a2a";
  ctx.fill();

  // Sharpened wood cone
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, tipLen);
  ctx.lineTo(-w, tipLen + woodLen);
  ctx.lineTo( w, tipLen + woodLen);
  ctx.lineTo( w * 0.3, tipLen);
  ctx.closePath();
  const wg = ctx.createLinearGradient(-w, 0, w, 0);
  wg.addColorStop(0,   "#c8a060");
  wg.addColorStop(0.5, "#e8c080");
  wg.addColorStop(1,   "#b89040");
  ctx.fillStyle = wg;
  ctx.fill();

  // Yellow body
  const bodyStart = tipLen + woodLen;
  const bg = ctx.createLinearGradient(-w, 0, w, 0);
  bg.addColorStop(0,    "#c8a010");
  bg.addColorStop(0.25, "#f5d030");
  bg.addColorStop(0.5,  "#fce060");
  bg.addColorStop(0.75, "#f0c820");
  bg.addColorStop(1,    "#b89010");
  ctx.beginPath();
  ctx.rect(-w, bodyStart, w * 2, bodyLen);
  ctx.fillStyle = bg;
  ctx.fill();

  // Silver ferrule
  const ferruleStart = bodyStart + bodyLen;
  const fg = ctx.createLinearGradient(-w, 0, w, 0);
  fg.addColorStop(0,   "#888");
  fg.addColorStop(0.3, "#ddd");
  fg.addColorStop(0.7, "#bbb");
  fg.addColorStop(1,   "#777");
  ctx.beginPath();
  ctx.rect(-w, ferruleStart, w * 2, ferruleLen);
  ctx.fillStyle = fg;
  ctx.fill();

  // Pink eraser
  ctx.beginPath();
  ctx.rect(-w * 0.9, ferruleStart + ferruleLen, w * 1.8, eraserLen);
  ctx.fillStyle = "#f4a0a0";
  ctx.fill();

  ctx.restore();
}

function drawPaintbrush(ctx, tipX, tipY, holdAngle, brushSize, paintColor) {
  const s          = Math.max(0.5, brushSize / 10);
  const bristleLen = 14 * s;
  const ferruleLen = 8  * s;
  const handleLen  = 72 * s;
  const bWidth     = 8  * s;
  const pr = paintColor?.r ?? 100;
  const pg = paintColor?.g ?? 60;
  const pb = paintColor?.b ?? 20;
  ctx.save();
  ctx.translate(tipX, tipY);
  ctx.rotate(holdAngle);
  const bristleCount = 7;
  for (let i = 0; i < bristleCount; i++) {
    const t = i / (bristleCount - 1);
    const spread = (t - 0.5) * bWidth * 1.5;
    const tipEnd = spread * 0.15;
    ctx.beginPath();
    ctx.moveTo(spread, 0);
    ctx.quadraticCurveTo(spread * 0.6, bristleLen * 0.55, tipEnd, bristleLen);
    ctx.strokeStyle = i%2===0 ? `rgba(${pr},${pg},${pb},0.80)` : `rgba(${Math.min(255,pr+35)},${Math.min(255,pg+22)},${Math.min(255,pb+12)},0.65)`;
    ctx.lineWidth = 1.3 * s;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, bristleLen * 0.9, bWidth * 0.55, bristleLen * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${pr},${pg},${pb},0.35)`;
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur  = 3 * s;
  const fg = ctx.createLinearGradient(-bWidth*.6, 0, bWidth*.6, 0);
  fg.addColorStop(0,"#777"); fg.addColorStop(0.3,"#e0e0e0");
  fg.addColorStop(0.7,"#b8b8b8"); fg.addColorStop(1,"#666");
  ctx.beginPath();
  ctx.roundRect(-bWidth*.62, -ferruleLen, bWidth*1.24, ferruleLen, 1*s);
  ctx.fillStyle = fg; ctx.fill();
  const hg = ctx.createLinearGradient(-bWidth*.5, 0, bWidth*.5, 0);
  hg.addColorStop(0,"#3a1805"); hg.addColorStop(0.22,"#7a3510");
  hg.addColorStop(0.50,"#c87838"); hg.addColorStop(0.78,"#7a3510");
  hg.addColorStop(1,"#3a1805");
  const hTop = -ferruleLen - handleLen;
  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.moveTo(-bWidth*.58,-ferruleLen);
  ctx.lineTo(-bWidth*.26,hTop+5); ctx.lineTo(0,hTop);
  ctx.lineTo(bWidth*.26,hTop+5); ctx.lineTo(bWidth*.58,-ferruleLen);
  ctx.closePath();
  ctx.fillStyle = hg; ctx.fill();
  ctx.restore();
}

function drawOverlay(ctx, width, height, phase, progress) {
  if (!phase) return;
  ctx.save();
  const pbH = 5;
  const pbY = height - pbH;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, pbY, width, pbH);
  ctx.fillStyle = phase.color;
  ctx.fillRect(0, pbY, Math.round(width * (progress / 100)), pbH);
  ctx.restore();
}

function drawGridFrame(ctx, img, width, height, animProgress) {
  ctx.save();
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, width, height);
  const padding = Math.round(width * 0.03);
  const halfW   = Math.round((width - padding * 3) / 2);
  const imgH    = Math.round(halfW * (img.height / img.width));
  const topY    = Math.round((height * 0.65 - imgH) / 2);
  const refX    = padding;
  ctx.drawImage(img, refX, topY, halfW, imgH);
  const canvX = padding * 2 + halfW;
  ctx.fillStyle = "#f5e6c8";
  ctx.fillRect(canvX, topY, halfW, imgH);
  const lblSz = Math.max(9, Math.round(width * 0.028));
  ctx.font = `bold ${lblSz}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("📷 Reference Photo", refX + halfW / 2, topY + imgH + 6);
  ctx.fillStyle = "rgba(255,220,80,0.90)";
  ctx.fillText("🎨 Your Canvas", canvX + halfW / 2, topY + imgH + 6);
  const COLS = 6, ROWS = 6;
  const totalLines  = COLS - 1 + ROWS - 1;
  const visibleLines = Math.floor(animProgress * totalLines);
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  let drawn = 0;
  for (let c = 1; c < COLS && drawn < visibleLines; c++, drawn++) {
    const lx1 = refX  + (halfW / COLS) * c;
    const lx2 = canvX + (halfW / COLS) * c;
    ctx.strokeStyle = "rgba(99,102,241,0.70)";
    ctx.beginPath(); ctx.moveTo(lx1,topY); ctx.lineTo(lx1,topY+imgH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx2,topY); ctx.lineTo(lx2,topY+imgH); ctx.stroke();
  }
  for (let r = 1; r < ROWS && drawn < visibleLines; r++, drawn++) {
    const ly = topY + (imgH / ROWS) * r;
    ctx.strokeStyle = "rgba(99,102,241,0.70)";
    ctx.beginPath(); ctx.moveTo(refX,ly); ctx.lineTo(refX+halfW,ly); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvX,ly); ctx.lineTo(canvX+halfW,ly); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(99,102,241,0.90)";
  ctx.lineWidth = 1.5;
  [{ox:refX,ow:halfW},{ox:canvX,ow:halfW}].forEach(({ox,ow}) => {
    ctx.beginPath(); ctx.moveTo(ox+ow/2,topY); ctx.lineTo(ox+ow/2,topY+imgH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox,topY+imgH/2); ctx.lineTo(ox+ow,topY+imgH/2); ctx.stroke();
  });
  const lblGridSz = Math.max(7, Math.round(halfW * 0.055));
  ctx.font = `bold ${lblGridSz}px sans-serif`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const label = `${String.fromCharCode(65+c)}${r+1}`;
      const cellX = refX + (halfW/COLS)*c + 2;
      const cellY = topY + (imgH/ROWS)*r + 2;
      ctx.fillStyle = "rgba(99,102,241,0.65)";
      ctx.fillText(label, cellX, cellY);
      ctx.fillStyle = "rgba(99,102,241,0.50)";
      ctx.fillText(label, cellX+halfW+padding, cellY);
    }
  }
  ctx.textAlign = "left";
  ctx.restore();
}

function drawTitleCard(ctx, img, width, height, title, medium, skillLabel, titleSub) {
  ctx.save();
  ctx.filter = "blur(6px) brightness(0.35)";
  ctx.drawImage(img, 0, 0, width, height);
  ctx.filter = "none";
  const tw = Math.round(width * 0.44);
  const th = Math.round(tw * (img.height / img.width));
  const tx = Math.round((width  - tw) / 2);
  const ty = Math.round((height - th) / 2) - Math.round(height * 0.05);
  ctx.shadowColor = "rgba(255,140,50,0.5)";
  ctx.shadowBlur  = 16;
  ctx.beginPath();
  ctx.roundRect(tx-3, ty-3, tw+6, th+6, 8);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.drawImage(img, tx, ty, tw, th);
  const t1sz = Math.max(12, Math.round(width * 0.047));
  ctx.font = `bold ${t1sz}px sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("🎨 Paintflow AI — Oil Painting Tutorial", width/2, ty+th+14);
  const t2sz = Math.max(9, Math.round(width * 0.030));
  ctx.font = `${t2sz}px sans-serif`;
  ctx.fillStyle = "rgba(255,160,60,0.92)";
  ctx.fillText(titleSub, width/2, ty+th+t1sz+20);
  const t3sz = Math.max(8, Math.round(width * 0.025));
  ctx.font = `${t3sz}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(`Level: ${skillLabel}`, width/2, ty+th+t1sz+t2sz+28);
  ctx.textAlign = "left";
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════
export default function PaintingTimelapse({ guide, imageUrl, skillLevel = "intermediate", accessToken = null }) {
  const displayRef  = useRef(null);
  const [status,    setStatus]   = useState("idle");
  const [progress,  setProgress] = useState(0);
  const [phase,     setPhase]    = useState(null);
  const [videoUrl,  setVideoUrl] = useState(null);
  const [fileExt,   setFileExt]  = useState("webm");
  const [caption,   setCaption]  = useState("");
  const [colorMix,  setColorMix] = useState(null);
  const isPausedRef = useRef(false);
  const [isPaused,  setIsPaused] = useState(false);
const [startPhase, setStartPhase] = useState(null);
const startPhaseRef = useRef(null);

  const cfg = SKILL_CONFIG[skillLevel] ?? SKILL_CONFIG.intermediate;

  // Pick color mix source based on skill level
  const colorMixSource = skillLevel === "advanced" ? ADVANCED_COLOR_MIXES : COLOR_MIXES;

  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    if (isPausedRef.current) pauseSpeech(); else resumeSpeech();
  };

  useEffect(() => { initVoice(); }, []);

  const getMime = () =>
    ["video/mp4","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"]
      .find(t => MediaRecorder.isTypeSupported(t)) ?? "";

  // Get captions based on skill level
  const getCaptions = (phaseId) => {
    if (cfg.useAdvancedCaptions && ADVANCED_CAPTIONS[phaseId]) {
      return ADVANCED_CAPTIONS[phaseId];
    }
    return INSTRUCTOR_CAPTIONS[phaseId] ?? [];
  };

  // Active phases for progress dots (filtered by skill level)
  const activePhases = PHASES.filter(p => cfg.phaseIds.includes(p.id));

  const generate = async () => {
    if (!accessToken && !import.meta.env.DEV) {
  setStatus("error");
  return;
}
    setStatus("recording");
    setProgress(0);
    setVideoUrl(null);

    try {
      const { img, width, height } = await loadImageToCanvas(imageUrl, 1920);

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = width; srcCanvas.height = height;
      const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true });
      srcCtx.imageSmoothingEnabled = true;
      srcCtx.imageSmoothingQuality = "high";
      srcCtx.drawImage(img, 0, 0, width, height);

      const _imgData = srcCtx.getImageData(0, 0, width, height);
      const _pixels  = _imgData.data;
      const getPixel = (x, y) => {
        const i = Math.max(0,Math.min(Math.floor(y),height-1)) * width * 4
                + Math.max(0,Math.min(Math.floor(x),width-1))  * 4;
        return { r: _pixels[i], g: _pixels[i+1], b: _pixels[i+2] };
      };

      const paintCanvas = document.createElement("canvas");
      paintCanvas.width = width; paintCanvas.height = height;
      const paintCtx = paintCanvas.getContext("2d");
      paintCtx.imageSmoothingEnabled = true;
      paintCtx.imageSmoothingQuality = "high";

      const display = displayRef.current;
      display.width = width; display.height = height;
      const dCtx = display.getContext("2d");
      dCtx.imageSmoothingEnabled = true;
      dCtx.imageSmoothingQuality = "high";

      const mime     = getMime();
      const ext      = mime.includes("mp4") ? "mp4" : "webm";
      setFileExt(ext);
      const stream   = display.captureStream(24);
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      const chunks   = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      let resolveRec;
      const recDone = new Promise(r => { resolveRec = r; });
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mime || "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        setStatus("done");
        resolveRec();
      };
      recorder.start(80);

      let phaseStartMs   = Date.now();
      let lastSpokenPhase = "";

      const speakPhase = (phaseId) => {
        const captions = getCaptions(phaseId);
        if (!captions.length) return;
        captions.forEach(text => enqueueCaption(text, setCaption));
      };

      const speakIfNew = (phaseId) => {
        if (phaseId === lastSpokenPhase) return;
        lastSpokenPhase = phaseId;
        speakPhase(phaseId);
      };

      const waitWhilePaused = async () => {
        while (isPausedRef.current) await new Promise(r => setTimeout(r, 100));
      };

      const renderFrame = (ph, pct, brushX, brushY, brushAngle, brushSize, brushColor, toolType = "brush") => {
        dCtx.clearRect(0, 0, width, height);
        dCtx.drawImage(paintCanvas, 0, 0);
        if (brushX !== null) {
          if (toolType === "pencil") {
            drawPencil(dCtx, brushX, brushY, (brushAngle ?? 0) + Math.PI * 0.82, brushSize ?? 8);
          } else {
            drawPaintbrush(dCtx, brushX, brushY, (brushAngle ?? 0) + Math.PI * 0.82, brushSize ?? 8, brushColor);
          }
        }
        drawOverlay(dCtx, width, height, ph, pct);
      };

      // ── 1. TITLE CARD ─────────────────────────────────────
      drawTitleCard(dCtx, img, width, height, guide?.title ?? "", guide?.medium ?? "Oil Paint", cfg.label, cfg.titleSub);
      await new Promise(r => setTimeout(r, 1500));

      // ── 2. GRID PHASE ──────────────────────────────────────────
const skipGrid = startPhaseRef.current && startPhaseRef.current !== "grid";
if (!skipGrid) {
setPhase(PHASES[0]);
      setColorMix(colorMixSource.grid);
      phaseStartMs = Date.now();
      speakIfNew("grid");
      const gridFrames = 60;
      for (let f = 0; f <= gridFrames; f++) {
        const animPct = f / gridFrames;
        drawGridFrame(dCtx, img, width, height, animPct);
        drawOverlay(dCtx, width, height, PHASES[0], Math.round(animPct * 100));
        await new Promise(r => setTimeout(r, 0));
      }
      await new Promise(r => setTimeout(r, 1500));
} // end skipGrid

     // ── 3. SKETCH PHASE ────────────────────────────────────────
const skipSketch = startPhaseRef.current && !["grid","sketch"].includes(startPhaseRef.current);
if (!skipSketch) {
setPhase(PHASES[1]);
      setColorMix(colorMixSource.sketch);
      phaseStartMs = Date.now();
      speakIfNew("sketch");
      setProgress(0);
      paintCtx.fillStyle = "#f8f4ee";
      paintCtx.fillRect(0, 0, width, height);
      drawGrid(paintCtx, width, height, 6, 6, "rgba(99,102,241,0.18)");
      const sketchStrokes = generateSketchStrokes(width, height, srcCtx);
      const skTotal = sketchStrokes.length;
      const SK_BATCH = 6;
      for (let i = 0; i < skTotal; i += SK_BATCH) {
        const end    = Math.min(i + SK_BATCH, skTotal);
        for (let j = i; j < end; j++) paintSketchStroke(paintCtx, sketchStrokes[j]);
        const lastSk = sketchStrokes[end - 1];
        const skPct  = Math.round((end / skTotal) * 100);
        const skX = lastSk.type === "contour"
          ? lastSk.points[lastSk.points.length - 1]?.x
          : lastSk.x;
        const skY = lastSk.type === "contour"
          ? lastSk.points[lastSk.points.length - 1]?.y
          : lastSk.y;
        const skAngle = lastSk.type === "contour" ? 0 : (lastSk.angle ?? 0);
        renderFrame(PHASES[1], skPct, skX, skY, skAngle, 10, { r:40, g:28, b:12 },
          skillLevel === "beginner" ? "pencil" : "brush"
        );
        setProgress(skPct);
        await new Promise(r => setTimeout(r, 16));
      }
      renderFrame(PHASES[1], 100, null, null, 0, 0, null);
      await new Promise(r => setTimeout(r, 1000));
} // end skipSketch

     // ── 4. IMPRIMATURA ────────────────────────────────────────
const skipImp = startPhaseRef.current && !["grid","sketch","imprimatura"].includes(startPhaseRef.current);
if (!skipImp) {
setPhase(PHASES[2]);
      setColorMix(colorMixSource.imprimatura);
      phaseStartMs = Date.now();
      speakIfNew("imprimatura");
      const impFrames = 160;
      const brushColor_imp = { r: 192, g: 120, b: 64 };
      for (let f = 1; f <= impFrames; f++) {
        await waitWhilePaused();
        const coveredY = Math.ceil((f / impFrames) * height);
        const stripY   = Math.ceil(((f-1) / impFrames) * height);
        const stripH   = coveredY - stripY + 1;
        paintCtx.fillStyle = "rgba(192,120,64,0.45)";
        paintCtx.fillRect(0, stripY, width, stripH);
        paintCtx.save();
        for (let s = 0; s < 4; s++) {
          const sy = stripY + Math.random() * stripH;
          paintCtx.beginPath();
          paintCtx.moveTo(0, sy);
          paintCtx.quadraticCurveTo(width/2, sy+(Math.random()-.5)*5, width, sy+(Math.random()-.5)*4);
          paintCtx.strokeStyle = Math.random()<.5 ? "rgba(160,80,20,0.05)" : "rgba(210,140,60,0.05)";
          paintCtx.lineWidth = 4 + Math.random() * 8;
          paintCtx.lineCap = "round";
          paintCtx.stroke();
        }
        paintCtx.restore();
        const pct    = Math.round((f / impFrames) * 100);
        const brushX = width * 0.5 + Math.sin(f * 0.3) * width * 0.3;
        const brushY = stripY + stripH / 2;
        renderFrame(PHASES[2], pct, brushX, brushY, Math.PI/2, 22, brushColor_imp);
        setProgress(pct);
        await new Promise(r => setTimeout(r, 0));
      }
      renderFrame(PHASES[2], 100, null, null, 0, 0, null);
      await new Promise(r => setTimeout(r, 1500));
} // end skipImp

      // ── 5. PAINT STROKES
      const rawStrokes   = generateStrokes(width, height);
      const phaseOrder   = ["grisaille", "wetOnWet", "glaze", "scumble", "detail", "pixel"];
      const strokesByType = {};
      for (const s of rawStrokes) {
        if (!strokesByType[s.type]) strokesByType[s.type] = [];
        strokesByType[s.type].push(s);
      }

      const activeStrokeTypes = cfg.strokeTypes;
const earlyPhases = ["grid", "sketch", "imprimatura"];
const skipUntil = startPhaseRef.current ?? null;
let phaseReached = skipUntil === null || earlyPhases.includes(skipUntil);
const strokes = phaseOrder
  .filter(type => activeStrokeTypes.includes(type))
  .flatMap(type => {
    if (!phaseReached) {
      const phId = PHASES[PHASE_INDEX[type]]?.id;
      if (phId === skipUntil) phaseReached = true;
      else return [];
    }
    return groupStrokesByColor(strokesByType[type] ?? [], _pixels, width, height);
  });

      const total     = strokes.length;
      let lastPhId    = "";
      phaseStartMs    = Date.now();

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const end       = Math.min(i + BATCH_SIZE, total);
        const lastS     = strokes[end - 1];
        const phIdx     = PHASE_INDEX[lastS.type] ?? 8;
        const curPhase  = PHASES[phIdx];
        const pct       = Math.round((end / total) * 100);
        const isLastBatch = end >= total;

        for (let j = i; j < end; j++) {
          paintStroke(paintCtx, srcCtx, strokes[j], width, height);
        }

        const brushAng   = lastS.angle ?? 0;
        const bSize      = lastS.size  ?? 6;
        const brushColor = getPixel(lastS.x, lastS.y);
        const showBrush  = !isLastBatch;

        renderFrame(curPhase, pct,
          showBrush ? lastS.x : null,
          showBrush ? lastS.y : null,
          brushAng, bSize * 1.4, brushColor
        );

        if (curPhase.id !== lastPhId) {
          lastPhId     = curPhase.id;
          phaseStartMs = Date.now();
          setPhase(curPhase);
          setColorMix(colorMixSource[curPhase.id] ?? null);
          speakIfNew(curPhase.id);
          await waitWhilePaused();
          await new Promise(r => setTimeout(r, 600));
        }
        setProgress(pct);
        speakIfNew(curPhase.id);
        await waitWhilePaused();
        await new Promise(r => setTimeout(r, 16));
      }

      // ── 6. FINAL FRAME ────────────────────────────────────
      dCtx.drawImage(paintCanvas, 0, 0);
      dCtx.save();
      const finH = Math.round(height * 0.14);
      dCtx.fillStyle = "rgba(0,0,0,0.60)";
      dCtx.fillRect(0, height - finH, width, finH);
      dCtx.fillStyle = "#22c55e";
      dCtx.fillRect(0, height - finH, width, 4);
      const fSz = Math.max(10, Math.round(width * 0.042));
      dCtx.font = `bold ${fSz}px sans-serif`;
      dCtx.fillStyle = "#fff";
      dCtx.textAlign = "center";
      dCtx.textBaseline = "middle";
      dCtx.fillText("✅ Finished! Great work!", width/2, height - finH/2 - 4);
      const f2Sz = Math.max(8, Math.round(width * 0.027));
      dCtx.font = `${f2Sz}px sans-serif`;
      dCtx.fillStyle = "rgba(255,220,80,0.90)";
      dCtx.fillText("Now try it on a real canvas! 🎨", width/2, height - finH/2 + fSz);
      dCtx.textAlign = "left";
      dCtx.restore();
      await new Promise(r => setTimeout(r, 3000));
      flushSpeech();
      recorder.stop();
      await recDone;

    } catch (err) {
      console.error("Timelapse error:", err);
      setStatus("error");
    }
  };

  const download = async () => {
  if (!videoUrl) return;
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `paintflow-${skillLevel}-tutorial.${fileExt}`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 300);
  } catch (err) {
    console.error("Download failed:", err);
    window.open(videoUrl, "_blank");
  }
};

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setStatus("idle"); setProgress(0); setPhase(null); setVideoUrl(null); setStartPhase(null);
    setStartPhase(null); startPhaseRef.current = null;
  };

  // Skill level badge colors for UI
  const skillColors = {
    beginner:     { bar: "#10b981", btn: "bg-emerald-600 hover:bg-emerald-700" },
    intermediate: { bar: "#3b82f6", btn: "bg-blue-600 hover:bg-blue-700" },
    advanced:     { bar: "#f97316", btn: "bg-orange-600 hover:bg-orange-700" },
  };
  const sc = skillColors[skillLevel] ?? skillColors.intermediate;

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Recording canvas */}
      <div className="relative w-full">
        <canvas
          ref={displayRef}
          className={status === "recording" ? "w-full rounded-2xl border border-orange-500/20 shadow-md" : ""}
          style={status !== "recording"
            ? { position: "absolute", left: "-9999px", top: "-9999px" }
            : { imageRendering: "crisp-edges", width: "100%", height: "auto" }}
          aria-hidden={status !== "recording"}
        />
        {status === "recording" && (
          <button
            onClick={togglePause}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5
                       bg-black/60 hover:bg-black/80 backdrop-blur-sm
                       text-white font-semibold text-xs
                       px-3 py-1.5 rounded-full shadow-lg transition-all active:scale-95"
          >
            {isPaused ? "▶️ Resume" : "⏸️ Pause"}
          </button>
        )}
      </div>

      {/* Live caption */}
      {status === "recording" && caption && (
        <div className="w-full bg-gray-900/80 rounded-xl px-4 py-3 border border-white/10">
          <p className="text-sm text-white/90 text-center leading-relaxed">
            🎙️ {caption}
          </p>
        </div>
      )}

      {/* Technique Steps */}
      {status === "recording" && phase && TECHNIQUE_STEPS[phase.id] && (
        <div className="w-full rounded-xl border px-4 py-3 space-y-2"
             style={{ borderColor: phase.color + "40", backgroundColor: phase.color + "12" }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: phase.color }}>
            🖌️ How To — {phase.label}
          </p>
          <ol className="space-y-1.5 list-none">
            {TECHNIQUE_STEPS[phase.id].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                      style={{ backgroundColor: phase.color }}>
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Color Mixing Guide */}
      {status === "recording" && colorMix && (
        <div className={`w-full rounded-xl px-4 py-3 border ${
          skillLevel === "advanced"
            ? "bg-orange-950/80 border-orange-400/20"
            : "bg-amber-950/80 border-amber-400/20"
        }`}>
          <p className={`text-xs font-bold mb-2 uppercase tracking-wide ${
            skillLevel === "advanced" ? "text-orange-400" : "text-amber-400"
          }`}>
            🎨 {colorMix.label}
          </p>
          <div className="flex flex-col gap-3">
            {colorMix.mixes.map((mix, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: mix.a.color }} />
                    <span className="text-xs text-white/80">{mix.a.name}</span>
                  </div>
                  <span className="text-white/40 text-xs font-bold">+</span>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: mix.b.color }} />
                    <span className="text-xs text-white/80">{mix.b.name}</span>
                  </div>
                  <span className="text-white/30 text-xs">({mix.ratio})</span>
                  <span className="text-white/40 text-xs">→</span>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: mix.result.color }} />
                    <span className={`text-xs font-semibold ${skillLevel === "advanced" ? "text-orange-300" : "text-amber-300"}`}>
                      {mix.result.name}
                    </span>
                  </div>
                </div>
                {/* Advanced: show technical note */}
                {skillLevel === "advanced" && mix.note && (
                  <p className="text-[10px] text-white/40 italic pl-1 border-l border-orange-500/20">
                    {mix.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IDLE */}
{(status === "idle" || status === "recording") && (
  <div className="w-full space-y-3">
    <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-white/60">
        ▶ Start from which phase?
      </p>
      <div className="flex flex-wrap gap-2">
        {activePhases.map(p => (
          <button
            key={p.id}
            onClick={() => { if (status !== "recording") { setStartPhase(p.id); startPhaseRef.current = p.id; } }}
className="text-xs px-3 py-1.5 rounded-full border transition-all"
disabled={status === "recording"}
style={{
  borderColor: startPhase === p.id ? p.color : "rgba(255,255,255,0.15)",
  backgroundColor: startPhase === p.id ? p.color + "33" : "transparent",
  color: startPhase === p.id ? p.color : "rgba(255,255,255,0.55)",
  fontWeight: startPhase === p.id ? "700" : "400",
  opacity: status === "recording" ? 0.45 : 1,
  cursor: status === "recording" ? "default" : "pointer",
}}
          >
            {p.label}
          </button>
        ))}
      </div>
      {startPhase && (
        <p className="text-xs text-white/40 italic">
          Starting from: {activePhases.find(p => p.id === startPhase)?.label}
        </p>
      )}
    </div>
    <button
      onClick={generate}
      className={`w-full flex items-center justify-center gap-2
                 ${sc.btn} text-white font-semibold
                 px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95`}
    >
      🎬 Generate {cfg.label} Oil Painting Tutorial
    </button>
  </div>
)}

      {/* RECORDING */}
      {status === "recording" && (
        <div className="w-full space-y-2">
          {/* Progress dots — only show active phases */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {activePhases.map((p, i) => (
              <div key={p.id}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: phase && activePhases.indexOf(phase) >= i ? p.color : "rgba(0,0,0,0.12)",
                  transform: phase?.id === p.id ? "scale(1.6)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {phase ? (
            <div className="flex items-center gap-2 justify-center">
              <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: phase.color }} />
              <p className="text-sm font-bold text-foreground">{phase.label}</p>
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          ) : (
            <p className="text-sm font-body text-orange-400 animate-pulse text-center">
              🖌️ Preparing the canvas…
            </p>
          )}

          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-150"
                 style={{ width: `${progress}%`, backgroundColor: phase?.color ?? sc.bar }} />
          </div>
        </div>
      )}

      {/* DONE */}
      {status === "done" && videoUrl && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-heading font-semibold text-foreground">
              🎬 Oil Painting Tutorial Video
            </h3>
            <span className="text-xs font-body text-white/40">{cfg.label}</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-orange-500/20 shadow-[0_0_30px_hsla(30,80%,50%,0.10)]">
            <video src={videoUrl} controls autoPlay loop className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {activePhases.map(p => (
              <div key={p.id} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={download}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-600
                         hover:bg-green-700 text-white font-semibold px-4 py-2.5
                         rounded-xl shadow transition-all active:scale-95 text-sm">
              ⬇️ Download
            </button>
            <button onClick={reset}
              className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300
                         text-gray-700 font-semibold px-4 py-2.5 rounded-xl
                         shadow transition-all active:scale-95 text-sm">
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {status === "error" && (
        <div className="text-center space-y-2">
          <p className="text-sm text-red-500">❌ Something went wrong. Please try again.</p>
          <button onClick={reset} className="text-sm text-orange-500 underline">Try again</button>
        </div>
      )}
    </div>
  );
}