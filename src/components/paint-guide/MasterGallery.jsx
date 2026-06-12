// src/components/paint-guide/MasterGallery.jsx
// "Paint Like a Master" — Option A: Free Preset Feature
// Drop-in component for PaintFlow AI · Atelier Noir design system

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brush, ChevronRight, X, Sparkles, BookOpen, Palette, Layers } from "lucide-react";

/* ── Atelier Noir tokens ── */
const C = {
  canvas:  "#0c0907",
  sienna:  "#c8793a",
  ochre:   "#e8b86d",
  cream:   "#f2e8d9",
  muted:   "#7a6a58",
  border:  "rgba(200,121,58,0.18)",
  card:    "rgba(255,255,255,0.03)",
};

/* ══════════════════════════════════════════
   MASTER ARTIST DATA
   - imageUrl: public domain Wikimedia URLs
   - guide: pre-built step-by-step template
══════════════════════════════════════════ */
const MASTERS = [
  {
    id: "starry-night",
    artist: "Vincent van Gogh",
    painting: "The Starry Night",
    year: "1889",
    era: "Post-Impressionism",
    difficulty: "Intermediate",
    estimatedTime: "8–12 hours",
    accent: "#3b6fa8",
    emoji: "🌌",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    signature: "Swirling, turbulent brushstrokes · Vivid cobalt blues",
    techniques: [
      "Short, curved impasto strokes",
      "Heavy paint application (thick texture)",
      "Swirling motion for sky and stars",
      "Dark silhouette foreground contrast",
    ],
    palette: ["#1a3a6b", "#2e5fa3", "#f5c842", "#f0f0b8", "#1c2e1a", "#2d4a2d"],
    paletteNames: ["Prussian Blue", "Cobalt Blue", "Chrome Yellow", "Pale Yellow", "Viridian Dark", "Sap Green"],
    overview: "Van Gogh painted this from memory while in an asylum in Saint-Rémy. The key is capturing the swirling emotional energy through dynamic, directional brushwork. Don't blend — let the strokes be visible and alive.",
    materials: [
      "Oil paints: Prussian Blue, Cobalt Blue, Chrome Yellow, Titanium White",
      "Palette knife (for heavy impasto texture)",
      "Stiff bristle brushes (flat and round)",
      "Stretched canvas 16×20 inches",
      "Linseed oil",
    ],
    steps: [
      {
        title: "Tonal Underpainting",
        description: "Cover the entire canvas with a thin wash of Prussian Blue mixed with linseed oil. This establishes the cool undertone throughout the painting. Let dry slightly.",
        tip: "Van Gogh often painted wet-on-wet. Keep the underpainting thin so subsequent layers grip well.",
        colors: ["#1a3a6b"],
      },
      {
        title: "Block In the Dark Landscape",
        description: "Using Viridian mixed with Ivory Black, paint the dark rolling hills and the cypress tree in the foreground. Keep edges loose — this is just the dark mass.",
        tip: "The dark silhouettes are almost pure black-green. Don't add light to these areas yet.",
        colors: ["#1c2e1a", "#0a0a0a"],
      },
      {
        title: "Build the Sky — Swirling Motion",
        description: "Mix Cobalt Blue with Ultramarine and Titanium White in varying ratios. Using a stiff flat brush, apply paint in curved, swirling strokes following the composition's circular energy. Work from dark to light.",
        tip: "This is where Van Gogh's style lives — let the strokes be thick, visible, and directional. Don't smooth them out.",
        colors: ["#2e5fa3", "#1a3a6b", "#4a7fc0"],
      },
      {
        title: "Paint the Moon & Stars",
        description: "Load a round brush heavily with Chrome Yellow mixed with Titanium White. Dab short radiating strokes outward from each star center. The moon gets a glowing halo of pale yellow.",
        tip: "For the glowing halos, work while the surrounding blue is still slightly wet so colors softly blend at the edges only.",
        colors: ["#f5c842", "#f0f0b8", "#ffffff"],
      },
      {
        title: "Add Texture with Palette Knife",
        description: "Using a palette knife, scrape on thick ridges of paint across the sky swirls. This creates Van Gogh's signature impasto relief. Press, drag, and lift.",
        tip: "The texture should be so thick you can feel the ridges. This is what makes oil painting magical — it's sculpture.",
        colors: ["#f0f0b8", "#2e5fa3"],
      },
      {
        title: "Final Details & Village Lights",
        description: "Add warm yellow dabs for the village windows glowing below. Refine the cypress tree with upward-pointing strokes. Sign your copy in the lower left.",
        tip: "Step back every few minutes. The painting looks better from a distance — don't overwork close up.",
        colors: ["#f5c842", "#2d4a2d"],
      },
    ],
  },

  {
    id: "water-lilies",
    artist: "Claude Monet",
    painting: "Water Lilies",
    year: "1906",
    era: "Impressionism",
    difficulty: "Beginner",
    estimatedTime: "5–8 hours",
    accent: "#4a9e7f",
    emoji: "🪷",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    signature: "Broken color · Soft edges · Reflected light",
    techniques: [
      "Broken color (separate dabs of pure color)",
      "No hard outlines — everything is edges",
      "Paint light, not objects",
      "Wet-on-wet blending",
    ],
    palette: ["#3a7d5e", "#7bbfa0", "#c8a8d4", "#f0e8c0", "#5b8fbf", "#a3c8a8"],
    paletteNames: ["Viridian", "Emerald", "Soft Lilac", "Cream White", "Cerulean", "Soft Green"],
    overview: "Monet painted his garden pond obsessively for 30 years. The secret is to paint what light does to water — not the lilies themselves. Soft edges, broken brushwork, and reflected sky colors are everything.",
    materials: [
      "Oil paints: Viridian, Cerulean Blue, Rose Madder, Titanium White, Yellow Ochre",
      "Soft bristle brushes (fan brush optional)",
      "Stretched canvas 18×24 inches",
      "Stand oil or liquin for flowing consistency",
    ],
    steps: [
      {
        title: "Lay In the Water Color Field",
        description: "Cover the canvas with a thin, fluid wash of Cerulean Blue mixed with Viridian. This establishes the reflective water surface. Vary the mix — darker in corners, lighter in center where sky reflects.",
        tip: "Monet used no underdrawing. Trust your eyes and start with color directly.",
        colors: ["#5b8fbf", "#3a7d5e"],
      },
      {
        title: "Drop In Reflected Sky",
        description: "While still wet, dab Titanium White with a touch of Cerulean in soft vertical strokes across the upper water area. These are reflections of the sky above. Keep strokes broken and airy.",
        tip: "The secret of impressionism: strokes stay separate. Don't blend into a smooth gradient.",
        colors: ["#f0e8c0", "#c8d8e8"],
      },
      {
        title: "Paint the Lily Pads",
        description: "Using Viridian, Sap Green, and Yellow Ochre, float flat oval shapes on the water surface. Vary the greens — some pads are in shadow (darker), some catch light (add yellow). Keep edges soft.",
        tip: "Lily pads are flat on the water. Paint them thin and horizontal, not raised up.",
        colors: ["#3a7d5e", "#7bbfa0", "#a3c8a8"],
      },
      {
        title: "Bloom the Flowers",
        description: "Dab clusters of Rose Madder, Soft Pink, and White for the lotus flowers. Each flower is just 3–5 loose dabs. They should look like suggestions of flowers, not botanical illustrations.",
        tip: "Less is more with the flowers. A few confident dabs look more real than overworked details.",
        colors: ["#c8a8d4", "#e8b8c8", "#f5e8e8"],
      },
      {
        title: "Unify with Glazing",
        description: "Mix a very thin, transparent wash of Viridian with stand oil. Glaze lightly over the deep shadow areas of the water to unify the colors. Let previous layers show through.",
        tip: "Glazing is the secret to Monet's luminosity. Thin transparent layers over dry paint create optical color mixing.",
        colors: ["#3a7d5e"],
      },
      {
        title: "Add Final Light Touches",
        description: "Add final highlight dabs of pure Titanium White mixed with a tiny Cadmium Yellow on the brightest lily pads and flower centers. These small sparks of light bring the painting to life.",
        tip: "Save the lightest lights for last. One confident highlight stroke does more than ten timid ones.",
        colors: ["#f0e8c0", "#ffffff"],
      },
    ],
  },

  {
    id: "girl-pearl",
    artist: "Johannes Vermeer",
    painting: "Girl with a Pearl Earring",
    year: "1665",
    era: "Dutch Golden Age",
    difficulty: "Advanced",
    estimatedTime: "15–20 hours",
    accent: "#c8a050",
    emoji: "💎",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
    signature: "Sfumato-like softness · Perfect light modeling · Luminous skin",
    techniques: [
      "Ultra-smooth blending (no visible brushstrokes)",
      "Single dominant light source from upper left",
      "Dark background for maximum contrast",
      "Glazing for luminous skin tones",
    ],
    palette: ["#1a1008", "#c8a050", "#e8c890", "#d4845a", "#f0e0c0", "#2a3a4a"],
    paletteNames: ["Ivory Black", "Raw Sienna", "Naples Yellow", "Burnt Sienna", "Flesh Tone", "Indigo Shadow"],
    overview: "Vermeer's masterpiece is about light — specifically, how soft diffused light from the left wraps around a single face against pure darkness. Every detail serves the illusion of light.",
    materials: [
      "Oil paints: Ivory Black, Lead White (or Titanium), Raw Sienna, Burnt Sienna, Ultramarine Blue",
      "Soft sable brushes (sizes 2, 4, 6)",
      "Slow-drying medium (alkyd or stand oil)",
      "Smooth linen canvas or panel 12×16 inches",
      "Odorless mineral spirits for cleaning",
    ],
    steps: [
      {
        title: "Pure Black Background",
        description: "Paint the entire canvas with Ivory Black mixed with Burnt Umber. Make it very dark — almost black-brown. This is Vermeer's famous dark void background that makes everything else glow.",
        tip: "The background never gets highlights. It must stay completely dark to make the figure luminous.",
        colors: ["#1a1008", "#0a0605"],
      },
      {
        title: "Establish the Head Shape",
        description: "Block in the head, neck, and shoulder shapes with Raw Sienna as a mid-tone. Keep everything soft and approximate at this stage. No details yet.",
        tip: "Think of the head as a simple sphere. Light hits the left, shadow wraps to the right.",
        colors: ["#c8a050", "#e8c890"],
      },
      {
        title: "Model the Light & Shadow",
        description: "The light source is upper-left. Build up Naples Yellow and Titanium White on the lit side of the face (forehead, nose tip, cheek). Deepen the shadow side with Burnt Sienna and Ultramarine Blue mixed together.",
        tip: "Vermeer's shadow side is never just darker skin — it has a cool blue-brown quality. Mix Ultramarine into shadows.",
        colors: ["#f0e0c0", "#2a3a4a", "#d4845a"],
      },
      {
        title: "Blend Seamlessly",
        description: "Using a very soft, dry brush, gently blend where light meets shadow. This is the most important skill — the transition should be completely invisible. Work slowly in tiny circles.",
        tip: "Use a clean, completely dry fan brush to blend. The brush must have zero paint on it. This creates Vermeer's signature softness.",
        colors: ["#e8c890", "#c8a050"],
      },
      {
        title: "Paint the Pearl Earring",
        description: "The pearl is a sphere of light. Paint a small oval of Titanium White with a tiny Ivory Black shadow on the right. Add a single bright white highlight dot. A very soft blue-white reflection at bottom.",
        tip: "The entire pearl earring is only about 10 brushstrokes. Its perfection comes from simplicity.",
        colors: ["#ffffff", "#e8e8f0", "#c0c0c8"],
      },
      {
        title: "Eyes, Lips & Final Glazes",
        description: "Paint the eyes last. The whites are not white — they're a warm gray. The iris catches a tiny white highlight. Lips get a soft rose-pink with a subtle highlight. Finally, glaze a thin Raw Sienna over the warmest skin areas.",
        tip: "The wet lips have a tiny specular highlight — one confident white dot. Don't overwork it.",
        colors: ["#c8a050", "#e8b8a8", "#2a1a10"],
      },
    ],
  },

  {
    id: "self-portrait",
    artist: "Rembrandt van Rijn",
    painting: "Self-Portrait (1669)",
    year: "1669",
    era: "Dutch Golden Age",
    difficulty: "Advanced",
    estimatedTime: "12–18 hours",
    accent: "#b87840",
    emoji: "🕯️",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg/800px-Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg",
    signature: "Chiaroscuro · Dramatic shadow · Thick impasto highlights",
    techniques: [
      "Chiaroscuro (extreme light/dark contrast)",
      "Thick impasto for lit areas, thin glazes for shadows",
      "Warm golden undertones throughout",
      "Lost edges in shadows",
    ],
    palette: ["#1a0e05", "#b87840", "#e8c880", "#8b4520", "#3a2810", "#f0d890"],
    paletteNames: ["Warm Black", "Raw Sienna", "Yellow Ochre", "Burnt Sienna", "Umber", "Naples Yellow"],
    overview: "Rembrandt's self-portraits are studies in how darkness reveals character. The technique is impasto on highlights, thin glazes on shadows — building up a surface that has extraordinary depth.",
    materials: [
      "Oil paints: Ivory Black, Raw Sienna, Yellow Ochre, Burnt Sienna, Titanium White",
      "Palette knife for impasto highlights",
      "Stiff hog bristle brushes and soft sable brushes",
      "Linseed oil and damar varnish for glazing medium",
      "Warm toned (sienna) primed canvas 14×18 inches",
    ],
    steps: [
      {
        title: "Warm Toned Ground",
        description: "Prime or paint the canvas with a warm Raw Sienna wash. Rembrandt always worked on a warm-toned ground — this color shows through in the shadows and mid-tones, creating warmth throughout.",
        tip: "Never work on a white canvas for Rembrandt's style. The warm ground is essential to the golden glow.",
        colors: ["#b87840"],
      },
      {
        title: "Establish Dark Masses",
        description: "Using Burnt Umber and Ivory Black, paint all the dark areas: background, shadow side of face, clothing shadows. Keep the paint thin here — these shadows need to be transparent and deep.",
        tip: "In shadow areas, Rembrandt used very thin, transparent glazes. The light areas are where the thick paint goes.",
        colors: ["#1a0e05", "#3a2810"],
      },
      {
        title: "Block In Mid-Tones",
        description: "Mix Raw Sienna with a touch of Titanium White for the mid-tone skin. Cover the transitional areas between light and shadow. The face should now have three zones: dark, mid, and light.",
        tip: "Keep mid-tones matte and lean. Save the rich, oily paint for the final light passes.",
        colors: ["#b87840", "#c89060"],
      },
      {
        title: "Build Up Highlights with Impasto",
        description: "Mix Naples Yellow with Titanium White — a warm, creamy mixture. Apply thick with a palette knife on the forehead, nose, and cheekbone. These impasto ridges catch light physically.",
        tip: "The most lit areas should have paint applied so thickly it forms raised ridges. This is Rembrandt's signature.",
        colors: ["#f0d890", "#e8c880"],
      },
      {
        title: "Glaze the Shadows",
        description: "Mix Burnt Sienna with Burnt Umber and a glazing medium (very oily). Apply thin transparent layers over the shadow areas to deepen them and add warmth. Multiple thin glazes build up rich depth.",
        tip: "Glazing must be done over completely dry paint. Each glaze layer adds depth like a colored filter.",
        colors: ["#8b4520", "#3a2810"],
      },
      {
        title: "Eyes & Final Accents",
        description: "Rembrandt's eyes are never fully lit — they're in soft shadow with just tiny highlights. Paint the eyes last with small, confident strokes. A single white highlight on each eye brings the portrait alive.",
        tip: "The eyes' whites are warm gray-yellow, not white. Only the tiny specular highlight dot is pure white.",
        colors: ["#b87840", "#f0d890", "#ffffff"],
      },
    ],
  },

  {
    id: "great-wave",
    artist: "Katsushika Hokusai",
    painting: "The Great Wave off Kanagawa",
    year: "1831",
    era: "Edo Period",
    difficulty: "Intermediate",
    estimatedTime: "6–10 hours",
    accent: "#2a6ab0",
    emoji: "🌊",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg",
    signature: "Bold outlines · Flat color planes · Dynamic composition",
    techniques: [
      "Strong graphic outlines (painterly version)",
      "Flat areas of color with minimal blending",
      "Dynamic diagonal composition",
      "White foam as negative space",
    ],
    palette: ["#1a3a6b", "#2e6ab8", "#87b8e0", "#f5f0e8", "#1a1a1a", "#a8c8e8"],
    paletteNames: ["Prussian Blue Deep", "Prussian Blue", "Cerulean", "Off White", "Ink Black", "Sky Blue"],
    overview: "Though originally a woodblock print, this translates beautifully to oil with flat color planes and strong graphic outlines. Focus on the dramatic S-curve wave composition and the power of white foam.",
    materials: [
      "Oil paints: Prussian Blue, Cerulean Blue, Titanium White, Ivory Black",
      "Flat bristle brushes for clean edges",
      "Fine liner brush for outlines",
      "Stretched canvas 16×12 inches (landscape)",
      "Masking fluid or tape for clean edges",
    ],
    steps: [
      {
        title: "Sketch the Composition",
        description: "Lightly sketch the wave shapes with a thin Prussian Blue wash. The great wave forms a dramatic claw shape on the left. Mount Fuji sits small and perfect in the center-right background.",
        tip: "The power of this composition is contrast: enormous crashing wave vs. tiny, serene mountain. Exaggerate this.",
        colors: ["#1a3a6b"],
      },
      {
        title: "Paint the Sky & Background",
        description: "Mix Cerulean Blue with white for a pale sky. Paint flat — no gradients. Keep it simple and graphic. The mountain gets a cool blue-gray wash.",
        tip: "Hokusai's backgrounds are almost flat color. Resist the urge to add atmospheric depth.",
        colors: ["#a8c8e8", "#f5f0e8"],
      },
      {
        title: "Block In the Deep Wave Colors",
        description: "Using Prussian Blue straight from the tube, paint the deepest parts of the waves. Then mix in white progressively for the lighter blue areas. Keep distinct flat zones — don't blend between zones.",
        tip: "Think of this as stained glass — each zone of color stays separate and clean.",
        colors: ["#1a3a6b", "#2e6ab8", "#87b8e0"],
      },
      {
        title: "White Foam & Spray",
        description: "Using Titanium White with the very lightest touch of blue, paint the foam caps and spray. The iconic claw-like foam fingers are key. Use a small brush for the droplet spray.",
        tip: "The white foam is the most important element. Let it be bold and graphic — these are the wave's claws.",
        colors: ["#f5f0e8", "#ffffff"],
      },
      {
        title: "Add Strong Outlines",
        description: "Mix Ivory Black with Prussian Blue for a rich near-black. Using a fine brush, add the graphic outlines around the wave edges and the boats. These outlines give the painting its woodblock print quality.",
        tip: "The outlines are thick and confident, not sketchy. One clean stroke is better than three hesitant ones.",
        colors: ["#1a1a1a"],
      },
      {
        title: "Mount Fuji & Final Details",
        description: "Paint Mount Fuji with a clean flat brush — pale blue-gray body, snow-white cap. Add the small boats in the foreground trough. These tiny boats emphasize the wave's enormous scale.",
        tip: "Mount Fuji's cap is crisp and white. The contrast between its serenity and the wave's violence is the whole painting.",
        colors: ["#87b8e0", "#f5f0e8", "#1a1a1a"],
      },
    ],
  },

  {
    id: "persistence-memory",
    artist: "Salvador Dalí",
    painting: "The Persistence of Memory",
    year: "1931",
    era: "Surrealism",
    difficulty: "Intermediate",
    estimatedTime: "8–12 hours",
    accent: "#c8a840",
    emoji: "⏱️",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
    signature: "Photorealistic rendering · Dreamlike scale distortion · Hyperreal light",
    techniques: [
      "Photorealistic smooth painting technique",
      "Strong horizontal light (golden hour)",
      "Impossible scale combinations",
      "Ultra-fine detail on small canvas",
    ],
    palette: ["#c8a840", "#e8d890", "#8b6820", "#4a7fa8", "#d4c090", "#1a1208"],
    paletteNames: ["Golden Ochre", "Sand", "Raw Umber", "Sky Blue", "Warm Sand", "Deep Shadow"],
    overview: "Dalí called his technique 'hand-painted dream photographs.' The style is almost photorealistic — the surrealism comes entirely from the impossible subject matter, not distorted painting. Paint it as if it were real.",
    materials: [
      "Oil paints: Yellow Ochre, Burnt Sienna, Raw Umber, Cerulean Blue, Titanium White",
      "Soft sable brushes (very fine for detail work)",
      "Slow-drying medium for smooth blending",
      "Small canvas 13×9 inches (Dalí painted tiny!)",
      "Magnifying glass for detail work",
    ],
    steps: [
      {
        title: "Paint the Golden Landscape",
        description: "Establish the Catalan coastline with warm Yellow Ochre and Raw Sienna. The cliffs glow in late afternoon light. Use smooth, photorealistic blending — no impressionist brushstrokes here.",
        tip: "Dalí's backgrounds look like photographs. Every brushstroke should be invisible in the final result.",
        colors: ["#c8a840", "#8b6820"],
      },
      {
        title: "The Sea & Sky",
        description: "The sea is a flat, calm Cerulean Blue. The sky above transitions from warm yellow at horizon to deeper blue at top. Keep the atmosphere crystal clear — no haze or softness.",
        tip: "The clarity of the atmosphere is unsettling — everything is in sharp focus, like a dream where everything is hyperreal.",
        colors: ["#4a7fa8", "#e8d890"],
      },
      {
        title: "Paint the Flat Surface (Table/Shelf)",
        description: "The brown rectangular surface that holds the melting watches is Burnt Umber and Raw Sienna. Render it with perfect flat perspective. The cast shadows underneath are crucial.",
        tip: "The table casts hard, clean shadows on the ground. Sunlight in Dalí's world is always sharp and directional.",
        colors: ["#8b6820", "#1a1208"],
      },
      {
        title: "The Melting Watches",
        description: "Paint each watch as a perfectly rendered solid object first, then add the melting drapes. The drape edges should be rendered with extreme smoothness — like metal or leather that has become soft.",
        tip: "The magic: paint them like real metal objects that happen to be soft. The 'real' quality makes the 'impossible' disturbing.",
        colors: ["#d4c090", "#c8a840", "#8b6820"],
      },
      {
        title: "The Central Figure",
        description: "The strange melting figure in the center is painted with warm skin tones and perfect smooth modeling. It's rendered realistically — just the shape is impossible.",
        tip: "This is the most technically demanding element. Take your time with the gradual tonal modeling.",
        colors: ["#d4c090", "#c8a840"],
      },
      {
        title: "Shadows & Final Unity",
        description: "Add all cast shadows as sharp, clean darks. Unify the warm golden light across the entire composition with a final thin Yellow Ochre glaze over the lit areas. Check every edge is crisp.",
        tip: "In surrealism, perfect technical execution creates the unease. If the painting looks sloppy, the magic disappears.",
        colors: ["#1a1208", "#c8a840"],
      },
    ],
  },
];

/* ══ Divider ══ */
const Divider = ({ style }) => (
  <div style={{
    height: 1,
    background: `linear-gradient(90deg, transparent, ${C.sienna}55, transparent)`,
    ...style,
  }} />
);

/* ══ Color Swatch Row ══ */
const PaletteRow = ({ colors, names }) => (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
    {colors.map((hex, i) => (
      <div key={i} style={{ textAlign: "center" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: hex,
          border: `1px solid rgba(255,255,255,0.12)`,
          boxShadow: `0 2px 8px ${hex}55`,
        }} />
        {names && (
          <p style={{
            fontSize: 8, color: C.muted, marginTop: 3,
            maxWidth: 44, lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{names[i]}</p>
        )}
      </div>
    ))}
  </div>
);

/* ══ Difficulty Badge ══ */
const DiffBadge = ({ level }) => {
  const map = {
    Beginner:     { color: "#5fa86d", emoji: "🌱" },
    Intermediate: { color: C.sienna,  emoji: "🎨" },
    Advanced:     { color: "#c84a3a", emoji: "🔥" },
  };
  const { color, emoji } = map[level] || map.Intermediate;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 600,
      background: `${color}20`, border: `1px solid ${color}50`, color,
    }}>
      {emoji} {level}
    </span>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function MasterGallery({ onSelectMaster }) {
  const [selected, setSelected] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [view, setView] = useState("gallery"); // "gallery" | "detail"

  const handleSelect = (master) => {
    setSelected(master);
    setActiveStep(0);
    setView("detail");
  };

  const handleUseAsReference = () => {
    if (!selected || !onSelectMaster) return;
    // Build a guide object matching the existing GuideDisplay shape
    const guide = {
      title: `Copy of "${selected.painting}"`,
      subject_description: `A faithful copy study of ${selected.artist}'s ${selected.painting} (${selected.year})`,
      dominant_colors: selected.palette,
      overview: selected.overview,
      medium: "oil_paint",
      difficulty: selected.difficulty,
      estimated_time: selected.estimatedTime,
      materials: selected.materials,
      steps: selected.steps,
      masterMeta: {
        artist: selected.artist,
        painting: selected.painting,
        year: selected.year,
        era: selected.era,
      },
    };
    onSelectMaster(guide, selected.imageUrl);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: C.cream }}>

      <AnimatePresence mode="wait">

        {/* ════ GALLERY VIEW ════ */}
        {view === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "6px 16px", borderRadius: 99,
                  border: `1px solid ${C.sienna}40`,
                  background: `${C.sienna}10`,
                  color: C.ochre, fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                <BookOpen size={12} color={C.sienna} />
                Master Copy Studies · 6 Masterworks
              </motion.div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 700, lineHeight: 1.1,
                color: C.cream, margin: "0 0 12px",
                letterSpacing: "-0.01em",
              }}>
                Paint Like a{" "}
                <span style={{ color: C.sienna, fontStyle: "italic" }}>Master</span>
              </h2>
              <p style={{ fontSize: 14, color: C.muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                Choose a famous masterpiece and follow a step-by-step technique guide
                to create your own copy. The greatest artists learned by copying.
              </p>
            </div>

            <Divider style={{ marginBottom: 32 }} />

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}>
              {MASTERS.map((master, i) => (
                <motion.div
                  key={master.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => handleSelect(master)}
                  style={{
                    borderRadius: 16,
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    backdropFilter: "blur(12px)",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${master.accent}60`;
                    e.currentTarget.style.boxShadow = `0 8px 32px ${master.accent}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Painting image */}
                  <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                    <img
                      src={master.imageUrl}
                      alt={master.painting}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block",
                        transition: "transform 0.4s ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, transparent 40%, rgba(12,9,7,0.9) 100%)",
                    }} />
                    {/* Era badge */}
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      padding: "3px 9px", borderRadius: 99,
                      background: "rgba(12,9,7,0.75)",
                      backdropFilter: "blur(8px)",
                      border: `1px solid rgba(255,255,255,0.1)`,
                      fontSize: 9, color: C.muted, letterSpacing: "0.08em",
                      textTransform: "uppercase", fontWeight: 600,
                    }}>
                      {master.era}
                    </div>
                    {/* Emoji */}
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      fontSize: 20,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                    }}>
                      {master.emoji}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px 16px" }}>
                    <p style={{
                      fontSize: 11, color: master.accent, fontWeight: 600,
                      letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4,
                    }}>
                      {master.artist} · {master.year}
                    </p>
                    <h3 style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18, fontWeight: 700, color: C.cream,
                      margin: "0 0 8px", lineHeight: 1.2,
                    }}>
                      {master.painting}
                    </h3>
                    <p style={{
                      fontSize: 11, color: C.muted, fontStyle: "italic",
                      margin: "0 0 12px", lineHeight: 1.5,
                    }}>
                      "{master.signature}"
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <DiffBadge level={master.difficulty} />
                        <span style={{ fontSize: 10, color: C.muted }}>
                          ⏱ {master.estimatedTime}
                        </span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontSize: 11, color: master.accent, fontWeight: 600,
                      }}>
                        View guide <ChevronRight size={13} />
                      </div>
                    </div>

                    {/* Mini palette */}
                    <div style={{ marginTop: 12, display: "flex", gap: 4 }}>
                      {master.palette.slice(0, 5).map((hex, i) => (
                        <div key={i} style={{
                          width: 16, height: 16, borderRadius: 4,
                          background: hex,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════ DETAIL VIEW ════ */}
        {view === "detail" && selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
          >
            {/* Back button */}
            <button
              onClick={() => setView("gallery")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "none", border: `1px solid ${C.border}`,
                color: C.muted, fontSize: 12, cursor: "pointer",
                padding: "6px 14px", borderRadius: 99, marginBottom: 24,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.cream; e.currentTarget.style.borderColor = `${C.sienna}55`; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
            >
              ← All Masters
            </button>

            {/* Hero */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${C.border}`,
              background: C.card, backdropFilter: "blur(12px)",
              marginBottom: 16,
            }}>
              {/* Image + overlay */}
              <div style={{ position: "relative", height: 260 }}>
                <img
                  src={selected.imageUrl}
                  alt={selected.painting}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, rgba(12,9,7,0.1) 0%, rgba(12,9,7,0.85) 100%)",
                }} />
                <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99,
                      background: "rgba(12,9,7,0.6)", backdropFilter: "blur(8px)",
                      border: `1px solid rgba(255,255,255,0.12)`,
                      fontSize: 9, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>{selected.era}</span>
                    <DiffBadge level={selected.difficulty} />
                    <span style={{ fontSize: 11, color: C.muted }}>⏱ {selected.estimatedTime}</span>
                  </div>
                  <p style={{
                    fontSize: 12, color: `${selected.accent}cc`, fontWeight: 600,
                    letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4,
                  }}>
                    {selected.artist} · {selected.year}
                  </p>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(22px, 4vw, 36px)",
                    fontWeight: 700, color: C.cream, margin: 0, lineHeight: 1.1,
                  }}>
                    {selected.painting}
                  </h2>
                </div>
              </div>

              {/* Overview */}
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, margin: "0 0 20px" }}>
                  {selected.overview}
                </p>

                {/* Techniques */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 11, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: C.sienna, marginBottom: 10,
                  }}>
                    Signature Techniques
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selected.techniques.map((t, i) => (
                      <span key={i} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 8,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${C.border}`,
                        fontSize: 11, color: C.muted,
                      }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.sienna, flexShrink: 0 }} />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Palette */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 11, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: C.sienna, marginBottom: 10,
                  }}>
                    <Palette size={11} style={{ display: "inline", marginRight: 6 }} />
                    Color Palette
                  </p>
                  <PaletteRow colors={selected.palette} names={selected.paletteNames} />
                </div>

                <Divider style={{ marginBottom: 20 }} />

                {/* Materials */}
                <div>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 11, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: C.sienna, marginBottom: 10,
                  }}>
                    Materials Needed
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {selected.materials.map((mat, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        padding: "7px 12px", borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${C.border}`,
                        fontSize: 12, color: C.muted, lineHeight: 1.5,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: C.sienna, flexShrink: 0, marginTop: 5,
                        }} />
                        {mat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: `1px solid ${C.border}`,
              background: C.card, backdropFilter: "blur(12px)",
              marginBottom: 16,
            }}>
              <div style={{ padding: "20px 24px 16px" }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 11, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.sienna, marginBottom: 4,
                }}>
                  <Layers size={11} style={{ display: "inline", marginRight: 6 }} />
                  Step-by-Step Guide · {selected.steps.length} Steps
                </p>
              </div>

              <Divider />

              <div style={{ padding: "0 24px 24px" }}>
                {selected.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveStep(activeStep === i ? -1 : i)}
                    style={{
                      marginTop: 12,
                      borderRadius: 12,
                      border: `1px solid ${activeStep === i ? `${selected.accent}50` : C.border}`,
                      background: activeStep === i ? `${selected.accent}08` : "rgba(255,255,255,0.02)",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Step header */}
                    <div style={{
                      padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: activeStep === i
                          ? `linear-gradient(135deg, ${selected.accent}, ${selected.accent}88)`
                          : `${selected.accent}20`,
                        border: `1px solid ${selected.accent}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                        color: activeStep === i ? "#0c0907" : selected.accent,
                        transition: "all 0.2s",
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600,
                          color: activeStep === i ? C.cream : C.muted,
                          margin: 0, transition: "color 0.2s",
                        }}>
                          {step.title}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {step.colors.slice(0, 3).map((hex, ci) => (
                          <div key={ci} style={{
                            width: 14, height: 14, borderRadius: 3,
                            background: hex, border: "1px solid rgba(255,255,255,0.1)",
                          }} />
                        ))}
                      </div>
                      <motion.div
                        animate={{ rotate: activeStep === i ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={14} color={C.muted} />
                      </motion.div>
                    </div>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {activeStep === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{
                            padding: "0 16px 16px",
                            borderTop: `1px solid ${selected.accent}20`,
                            paddingTop: 14,
                          }}>
                            <p style={{
                              fontSize: 13, color: C.muted, lineHeight: 1.75,
                              margin: "0 0 12px",
                            }}>
                              {step.description}
                            </p>
                            {step.tip && (
                              <div style={{
                                display: "flex", gap: 8,
                                padding: "10px 12px", borderRadius: 8,
                                background: `${selected.accent}12`,
                                border: `1px solid ${selected.accent}30`,
                              }}>
                                <Sparkles size={13} color={selected.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: 12, color: `${C.cream}99`, lineHeight: 1.6, margin: 0 }}>
                                  <span style={{ color: selected.accent, fontWeight: 600 }}>Tip: </span>
                                  {step.tip}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUseAsReference}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "16px 24px", borderRadius: 14,
                background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre})`,
                border: "none",
                color: "#0c0907",
                fontSize: 15, fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: `0 4px 28px ${C.sienna}50`,
                letterSpacing: "0.01em",
              }}
            >
              <Brush size={16} color="#0c0907" strokeWidth={2.5} />
              Start Painting "{selected.painting}"
              <ChevronRight size={15} color="#0c0907" />
            </motion.button>

            <p style={{
              textAlign: "center", marginTop: 10,
              fontSize: 11, color: `${C.muted}77`,
            }}>
              This will load the guide into your painting session
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
