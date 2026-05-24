// src/utils/paintingAlgorithm.js
// ═══════════════════════════════════════════════════════════
//  Paintflowai — Classic Painting Tutorial Algorithm
// ═══════════════════════════════════════════════════════════

export const PHASES = [
  {
    id:      "grid",
    label:   "Step 1: Grid Method",
    tagalog: "Gumawa ng grid para tama ang proportions ng iyong drawing. Hatiin ang papel at reference sa parehong bilang ng kahon.",
    tip:     "💡 Tip: Gamitin ang 4x4 o 6x6 grid. Ang bawat kahon = isang maliit na parte ng larawan.",
    color:   "#6366f1",
  },
  {
    id:      "sketch",
    label:   "Step 2: Pencil Sketch",
    tagalog: "Iguhit nang magaan ang mga pangunahing hugis. Sundan ang mga gilid (edges) ng bawat hugis.",
    tip:     "💡 Tip: Mula sa malaking hugis papunta sa maliliit na detalye. Magaan lang ang kamay!",
    color:   "#94a3b8",
  },
  {
    id:      "imprimatura",
    label:   "Step 3: Imprimatura",
    tagalog: "Pahiran ng manipis na brown/orange wash ang buong canvas. Hayaang matuyo bago magpatuloy.",
    tip:     "💡 Tip: I-dilute ang burnt sienna sa turpentine hanggang halos transparent. Ito ang tono ng iyong painting.",
    color:   "#c8804a",
  },
  {
    id:      "grisaille",
    label:   "Step 4: Grisaille (Dead Layer)",
    tagalog: "I-paint ang lahat sa grey/sepia muna. Walang kulay pa — values lang ang focus.",
    tip:     "💡 Tip: Gamitin ang burnt umber + white. Kung mali ang values dito, mali rin ang buong painting.",
    color:   "#7a5c3a",
  },
  {
    id:      "wetOnWet",
    label:   "Step 5: Wet-on-Wet Color",
    tagalog: "Mag-apply ng kulay habang basa pa ang canvas para mag-blend nang natural.",
    tip:     "💡 Tip: Huwag mag-over-mix — hayaan ang kulay na mag-bleed sa isa't isa.",
    color:   "#4a7a9b",
  },
  {
    id:      "glaze",
    label:   "Step 6: Glazing",
    tagalog: "Manipis na transparent na kulay sa ibabaw ng tuyo nang paint para magdagdag ng depth.",
    tip:     "💡 Tip: I-mix ang kulay sa linseed oil para transparent. Hayaang matuyo bawat layer.",
    color:   "#8b6914",
  },
  {
    id:      "scumble",
    label:   "Step 7: Scumbling",
    tagalog: "Dry brush technique sa mga highlight. Kunin ang karamihan ng paint sa brush bago mag-paint.",
    tip:     "💡 Tip: I-wipe ang brush sa papel muna para maging dry. Magaan na strokes.",
    color:   "#c4a882",
  },
  {
    id:      "detail",
    label:   "Step 8: Details & Impasto",
    tagalog: "Mga detalye at makapal na paint sa pinakamaliliwanag na bahagi.",
    tip:     "💡 Tip: Para sa impasto, gumamit ng palette knife. Isa lang na stroke — huwag ulit-ulitin.",
    color:   "#2d5a8e",
  },
  {
    id:      "pixel",
    label:   "Step 9: Final Refinement",
    tagalog: "Huling touches para ma-match ang reference. Tingnan mula sa malayo.",
    tip:     "💡 Tip: Lumayo sa painting (3-4 steps back). Kung maganda mula sa malayo, tapos na!",
    color:   "#1a3a1a",
  },
];

// ── Image loader ───────────────────────────────────────────
export function loadImageToCanvas(imageUrl, maxSize = 720) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      resolve({
        img,
        width:  Math.floor(img.width  * ratio),
        height: Math.floor(img.height * ratio),
      });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

// ── Draw Grid ─────────────────────────────────────────────
export function drawGrid(ctx, width, height, cols = 6, rows = 6, color = "rgba(99,102,241,0.55)") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  const cellW = width  / cols;
  const cellH = height / rows;
  for (let c = 1; c < cols; c++) {
    ctx.beginPath(); ctx.moveTo(c * cellW, 0); ctx.lineTo(c * cellW, height); ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * cellH); ctx.lineTo(width, r * cellH); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(99,102,241,0.85)";
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
  ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.fillStyle    = "rgba(99,102,241,0.70)";
  ctx.font         = `bold ${Math.max(9, Math.round(width * 0.022))}px sans-serif`;
  ctx.textBaseline = "top";
  ctx.textAlign    = "left";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillText(`${String.fromCharCode(65 + c)}${r + 1}`, c * cellW + 3, r * cellH + 2);
    }
  }
  ctx.restore();
}

// ── Imprimatura — brush stroke wash (no circles) ──────────
export function drawImprimatura(ctx, width, height) {
  // Base coat — semi-transparent para visible pa rin ang sketch sa ilalim
  ctx.fillStyle = "rgba(192, 120, 64, 0.45)";
  ctx.fillRect(0, 0, width, height);

  ctx.save();

  // Horizontal brush-like strokes varying in opacity — looks hand-applied
  const strokeCount = Math.floor(height / 3);
  for (let i = 0; i < strokeCount; i++) {
    const y      = Math.random() * height;
    const x0     = Math.random() * width * 0.3;
    const x1     = width - Math.random() * width * 0.3;
    const thick  = 2 + Math.random() * 8;
    const warm   = Math.random() < 0.5; // warm or cool variation
    const alpha  = 0.025 + Math.random() * 0.055;

    ctx.beginPath();
    ctx.moveTo(x0, y + (Math.random() - 0.5) * 3);
    // Slight curve — like a real brush stroke
    ctx.quadraticCurveTo(
      (x0 + x1) / 2, y + (Math.random() - 0.5) * 6,
      x1, y + (Math.random() - 0.5) * 3
    );
    ctx.strokeStyle = warm
      ? `rgba(160,80,20,${alpha})`   // darker warm tone
      : `rgba(210,140,60,${alpha})`; // lighter warm tone
    ctx.lineWidth = thick;
    ctx.lineCap   = "round";
    ctx.stroke();
  }

  // A few vertical variations for canvas texture
  const vCount = Math.floor(width / 8);
  for (let i = 0; i < vCount; i++) {
    const x     = Math.random() * width;
    const alpha = 0.015 + Math.random() * 0.030;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, height);
    ctx.strokeStyle = `rgba(100,50,10,${alpha})`;
    ctx.lineWidth   = 1 + Math.random() * 2;
    ctx.stroke();
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  SKETCH — Sobel edge detection → light, accurate pencil
// ═══════════════════════════════════════════════════════════

function buildEdgeMap(srcCtx, W, H) {
  const imgData = srcCtx.getImageData(0, 0, W, H);
  const d       = imgData.data;

  const lumArr = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    lumArr[i] = 0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2];
  }

  const mag   = new Float32Array(W * H);
  const angle = new Float32Array(W * H);
  let maxMag  = 0;

  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const tl = lumArr[(y-1)*W+(x-1)], tc = lumArr[(y-1)*W+x], tr = lumArr[(y-1)*W+(x+1)];
      const ml = lumArr[ y   *W+(x-1)],                          mr = lumArr[ y   *W+(x+1)];
      const bl = lumArr[(y+1)*W+(x-1)], bc = lumArr[(y+1)*W+x], br = lumArr[(y+1)*W+(x+1)];

      const gx = -tl - 2*ml - bl + tr + 2*mr + br;
      const gy = -tl - 2*tc - tr + bl + 2*bc + br;

      const m = Math.sqrt(gx*gx + gy*gy);
      mag[y*W+x]   = m;
      angle[y*W+x] = Math.atan2(gy, gx) + Math.PI / 2; // along edge
      if (m > maxMag) maxMag = m;
    }
  }

  if (maxMag > 0) for (let i = 0; i < mag.length; i++) mag[i] /= maxMag;

  return { lumArr, mag, angle };
}

// ═══════════════════════════════════════════════════════════
//  PATCH: Replace generateSketchStrokes + paintSketchStroke
//  in src/utils/paintingAlgorithm.js
//
//  Bago:  Broken/hatch strokes sa edges
//  Ngayon: Continuous contour lines na sumusunod sa tunay na
//           hugis ng subject (bundok outline, mukha, etc.)
// ═══════════════════════════════════════════════════════════

export function generateSketchStrokes(width, height, srcCtx) {
  const { lumArr, mag, angle } = buildEdgeMap(srcCtx, width, height);

  const strokes = [];

  // ── Pass 1: Very faint paper grain (keep as-is, very sparse) ──
  const texStep = 16;
  for (let y = 0; y < height; y += texStep) {
    for (let x = 0; x < width; x += texStep) {
      if (Math.random() > 0.12) continue;
      const l = lumArr[y * width + x] / 255;
      if (l < 0.45) continue;
      strokes.push({
        x: x + (Math.random() - 0.5) * texStep,
        y: y + (Math.random() - 0.5) * texStep,
        len:    2 + Math.random() * 3,
        angle:  Math.random() * Math.PI,
        alpha:  0.020 + Math.random() * 0.025,
        weight: 0.3,
        type:   "texture",
      });
    }
  }

  // ── Pass 2: Very light shadow hatching (only very dark areas) ──
  const hatchStep = 9;
  for (let y = 0; y < height; y += hatchStep) {
    for (let x = 0; x < width; x += hatchStep) {
      if (Math.random() > 0.30) continue;
      const idx = y * width + x;
      const l   = lumArr[idx] / 255;
      if (l > 0.22) continue;         // only genuinely dark shadows

      const darkness = 1 - l;
      strokes.push({
        x, y,
        len:    3 + Math.random() * 5,
        angle:  Math.PI * 0.22 + (Math.random() - 0.5) * 0.3,
        alpha:  0.06 + darkness * 0.10,   // lighter than before
        weight: 0.35 + darkness * 0.20,
        type:   "hatch",
      });
    }
  }

  // ── Pass 3: CONTOUR TRACING ────────────────────────────────
  // Hindi na individual strokes — sundan ang connected edge pixels
  // at i-draw bilang isang tuluy-tuloy na linya (tulad ng bundok outline)

  const edgeThres  = 0.16;
  const visited    = new Uint8Array(width * height);
  const isEdge     = new Uint8Array(width * height);

  // Mark edge pixels
  for (let i = 0; i < width * height; i++) {
    if (mag[i] >= edgeThres) isEdge[i] = 1;
  }

  // 8-directional neighbor offsets (ordered for edge continuity)
  const dirs8 = [
    [1, 0], [1, 1], [0, 1], [-1, 1],
    [-1, 0], [-1, -1], [0, -1], [1, -1],
  ];

  // Trace each unvisited edge pixel into a connected chain
  for (let sy = 1; sy < height - 1; sy++) {
    for (let sx = 1; sx < width - 1; sx++) {
      const startIdx = sy * width + sx;
      if (!isEdge[startIdx] || visited[startIdx]) continue;

      // Walk the chain from this seed pixel
      const points = [];
      let cx = sx, cy = sy;

      for (let step = 0; step < 600; step++) {
        const cidx = cy * width + cx;
        if (visited[cidx]) break;
        visited[cidx] = 1;
        points.push({ x: cx, y: cy });

        // Pick next neighbor — prefer the one that best continues
        // the current edge direction (smooth, not zigzag)
        const edgeDir = angle[cidx]; // along-edge angle
        let bestNext  = null;
        let bestScore = -Infinity;

        for (const [dx, dy] of dirs8) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 1 || nx >= width - 1 || ny < 1 || ny >= height - 1) continue;
          const nidx = ny * width + nx;
          if (!isEdge[nidx] || visited[nidx]) continue;

          // Score: favor neighbors whose edge angle matches ours (continuity)
          const neighborDir = angle[nidx];
          const angleSim    = Math.cos(edgeDir - neighborDir); // -1..1
          const score       = mag[nidx] * 0.7 + angleSim * 0.3;

          if (score > bestScore) {
            bestScore = score;
            bestNext  = { x: nx, y: ny };
          }
        }

        if (!bestNext) break;
        cx = bestNext.x;
        cy = bestNext.y;
      }

      // Only keep chains long enough to be meaningful lines
      if (points.length < 5) continue;

      // Average edge strength along the chain → drives opacity & weight
      let totalMag = 0;
      for (const p of points) totalMag += mag[p.y * width + p.x];
      const avgMag = totalMag / points.length;

      strokes.push({
        type:   "contour",
        points,
        alpha:  0.35 + avgMag * 0.60,
        weight: 0.55 + avgMag * 1.30,
      });
    }
  }

  // ── Sort: texture → hatch → contour (contour on top) ──
  const order = { texture: 0, hatch: 1, contour: 2 };
  strokes.sort((a, b) => order[a.type] - order[b.type]);

  return strokes;
}

export function paintSketchStroke(ctx, stroke) {
  if (stroke.type === "contour") {
    const { points, alpha, weight } = stroke;
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = `rgba(20,12,4,${Math.min(1.0, alpha)})`;
    ctx.lineWidth   = weight;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const mx = (points[i].x + points[i + 1].x) / 2;
      const my = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const { x, y, len, angle, alpha, weight } = stroke;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const wobble = (Math.random() - 0.5) * 0.9;
  ctx.beginPath();
  ctx.moveTo(-len / 2, 0);
  ctx.quadraticCurveTo(0, wobble, len / 2, (Math.random() - 0.5) * 0.6);
  ctx.strokeStyle = `rgba(20,12,4,${Math.min(1.0, alpha * 1.5)})`;
  ctx.lineWidth   = weight;
  ctx.lineCap     = "round";
  ctx.stroke();
  ctx.restore();
}

// ── Helpers ────────────────────────────────────────────────
function sampleColor(offCtx, cx, cy, radius, W, H) {
  const r  = Math.max(1, Math.floor(radius * 0.5));
  const x0 = Math.max(0, Math.floor(cx - r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const w  = Math.min(W - x0, r * 2 + 1);
  const h  = Math.min(H - y0, r * 2 + 1);
  if (w <= 0 || h <= 0) {
    const d = offCtx.getImageData(Math.max(0,Math.min(Math.floor(cx),W-1)), Math.max(0,Math.min(Math.floor(cy),H-1)), 1, 1).data;
    return { r: d[0], g: d[1], b: d[2] };
  }
  const px = offCtx.getImageData(x0, y0, w, h).data;
  let rs=0,gs=0,bs=0; const n = w*h;
  for (let i=0;i<n;i++) { rs+=px[i*4]; gs+=px[i*4+1]; bs+=px[i*4+2]; }
  return { r: Math.round(rs/n), g: Math.round(gs/n), b: Math.round(bs/n) };
}

function sampleCanvas(ctx, cx, cy, W, H) {
  const x = Math.max(0, Math.min(Math.floor(cx), W-1));
  const y = Math.max(0, Math.min(Math.floor(cy), H-1));
  const d = ctx.getImageData(x, y, 1, 1).data;
  return { r: d[0], g: d[1], b: d[2], a: d[3] };
}

function edgeAngle(offCtx, cx, cy, W, H) {
  const x = Math.max(1, Math.min(Math.floor(cx), W-2));
  const y = Math.max(1, Math.min(Math.floor(cy), H-2));
  const L = (px,py) => { const d=offCtx.getImageData(px,py,1,1).data; return 0.299*d[0]+0.587*d[1]+0.114*d[2]; };
  return Math.atan2(L(x+1,y)-L(x-1,y), -(L(x,y+1)-L(x,y-1)));
}

const clamp = v => Math.min(255, Math.max(0, Math.round(v)));
const lum   = c => 0.299*c.r + 0.587*c.g + 0.114*c.b;

function mixColor(a, b, t) {
  return { r: clamp(a.r+(b.r-a.r)*t), g: clamp(a.g+(b.g-a.g)*t), b: clamp(a.b+(b.b-a.b)*t) };
}

function classicTemp(c) {
  const l = lum(c);
  if (l < 100) return { r:clamp(c.r+18), g:clamp(c.g+4),  b:clamp(c.b-14) };
  if (l > 180) return { r:clamp(c.r-8),  g:clamp(c.g+2),  b:clamp(c.b+16) };
  return c;
}

function toGrisaille(c) {
  const g = lum(c);
  return { r:clamp(g*0.85+30), g:clamp(g*0.80+18), b:clamp(g*0.70+5) };
}

// ── Stroke generator ───────────────────────────────────────
export function generateStrokes(width, height) {
  const strokes = [];
  const push = (x, y, size, angle, type) => strokes.push({ x, y, size, angle, type });

  const g = 14;
  for (let y=0;y<height+g;y+=g) for (let x=0;x<width+g;x+=g)
    push(x+(Math.random()-.5)*g, y+(Math.random()-.5)*g, 16+Math.random()*8, Math.random()*Math.PI, "grisaille");

  const w = 11;
  for (let y=0;y<height+w;y+=w) for (let x=0;x<width+w;x+=w)
    push(x+(Math.random()-.5)*w, y+(Math.random()-.5)*w, 12+Math.random()*6, Math.random()*Math.PI*.5, "wetOnWet");

  const gl = 8;
  for (let y=0;y<height+gl;y+=gl) for (let x=0;x<width+gl;x+=gl)
    push(x+(Math.random()-.5)*3, y+(Math.random()-.5)*3, 7+Math.random()*3, null, "glaze");

  const sc = 7;
  for (let y=0;y<height+sc;y+=sc) for (let x=0;x<width+sc;x+=sc)
    push(x+(Math.random()-.5)*4, y+(Math.random()-.5)*4, 5+Math.random()*3, Math.random()*Math.PI, "scumble");

  const fi = 7;  // ← 4→7: ~3x less strokes
for (let y=0;y<height+fi;y+=fi) for (let x=0;x<width+fi;x+=fi)
  push(x+(Math.random()-.5)*2, y+(Math.random()-.5)*2, 4+Math.random()*2, null, "detail");

const st = 6;  // ← 3→6: ~4x less strokes
for (let y=0;y<height;y+=st) for (let x=0;x<width;x+=st)
  push(x+(Math.random()-.5)*2, y+(Math.random()-.5)*2, st, 0, "pixel");

  return strokes;
}

// ── Paint one stroke ───────────────────────────────────────
export function paintStroke(ctx, offCtx, stroke, W, H) {
  const { x, y, size, type } = stroke;
  let { angle } = stroke;
  const cx = Math.max(0, Math.min(x, W-1));
  const cy = Math.max(0, Math.min(y, H-1));

  if (type === "pixel") {
  const src = sampleColor(offCtx, cx, cy, size, W, H);
  const cur = sampleCanvas(ctx, cx, cy, W, H);

  // Laktawan kung malapit na ang kulay — hindi na kailangan ng correction
  const diff = Math.abs(src.r - cur.r) + Math.abs(src.g - cur.g) + Math.abs(src.b - cur.b);
  if (diff < 28) return; // ← ~60% ng strokes ay ma-skip

  // Malambot na blend patungo sa reference — hindi binubura ang painting
  const t = Math.min(0.60, diff / 280);
  const c = {
    r: Math.round(cur.r + (src.r - cur.r) * t),
    g: Math.round(cur.g + (src.g - cur.g) * t),
    b: Math.round(cur.b + (src.b - cur.b) * t),
  };
  ctx.save();
  ctx.translate(x, y);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
  gr.addColorStop(0,   `rgba(${c.r},${c.g},${c.b},0.55)`);
  gr.addColorStop(0.6, `rgba(${c.r},${c.g},${c.b},0.28)`);
  gr.addColorStop(1,   `rgba(${c.r},${c.g},${c.b},0)`);
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = gr;
  ctx.fill();
  ctx.restore();
  return;
}

  if (angle === null) {
    angle = edgeAngle(offCtx, cx, cy, W, H) + (Math.random()-.5)*.45;
  }

  const src = sampleColor(offCtx, cx, cy, size*.7, W, H);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  if (type === "grisaille") {
    const g = toGrisaille(src);
    const gr = ctx.createRadialGradient(0,0,0,0,0,size);
    gr.addColorStop(0,    `rgba(${g.r},${g.g},${g.b},0.55)`);
    gr.addColorStop(0.65, `rgba(${g.r},${g.g},${g.b},0.38)`);
    gr.addColorStop(1,    `rgba(${g.r},${g.g},${g.b},0)`);
    ctx.beginPath(); ctx.ellipse(0,0,size*1.8,size*.5,0,0,Math.PI*2);
    ctx.fillStyle = gr; ctx.fill();
    const dk = toGrisaille({r:src.r*.6,g:src.g*.6,b:src.b*.6});
    ctx.beginPath(); ctx.ellipse(0,size*.15,size*1.5,size*.22,0,0,Math.PI*2);
    ctx.fillStyle = `rgba(${dk.r},${dk.g},${dk.b},0.18)`; ctx.fill();
  }

  else if (type === "wetOnWet") {
    const cv  = sampleCanvas(ctx, cx, cy, W, H);
    const wet = cv.a > 10 ? 0.45 : 0.75;
    const bl  = mixColor(cv, classicTemp(src), wet);
    const gr  = ctx.createRadialGradient(0,0,0,0,0,size*1.3);
    gr.addColorStop(0,    `rgba(${bl.r},${bl.g},${bl.b},0.50)`);
    gr.addColorStop(0.55, `rgba(${bl.r},${bl.g},${bl.b},0.35)`);
    gr.addColorStop(0.80, `rgba(${bl.r},${bl.g},${bl.b},0.15)`);
    gr.addColorStop(1,    `rgba(${bl.r},${bl.g},${bl.b},0)`);
    ctx.beginPath(); ctx.ellipse(0,0,size*2,size*.55,0,0,Math.PI*2);
    ctx.fillStyle = gr; ctx.fill();
    if (Math.random() < 0.35) {
      const bd = size*(1.2+Math.random()*.6), bs = size*(0.3+Math.random()*.25);
      const bg = ctx.createRadialGradient(bd,0,0,bd,0,bs);
      bg.addColorStop(0, `rgba(${bl.r},${bl.g},${bl.b},0.22)`);
      bg.addColorStop(1, `rgba(${bl.r},${bl.g},${bl.b},0)`);
      ctx.beginPath(); ctx.arc(bd,0,bs,0,Math.PI*2);
      ctx.fillStyle = bg; ctx.fill();
    }
  }

  else if (type === "glaze") {
    const c = classicTemp(src);
    const gr = ctx.createRadialGradient(0,0,0,0,0,size);
    gr.addColorStop(0,    `rgba(${c.r},${c.g},${c.b},0.10)`);
    gr.addColorStop(0.42, `rgba(${c.r},${c.g},${c.b},0.28)`);
    gr.addColorStop(0.75, `rgba(${c.r},${c.g},${c.b},0.20)`);
    gr.addColorStop(1,    `rgba(${c.r},${c.g},${c.b},0)`);
    ctx.beginPath(); ctx.ellipse(0,0,size*1.7,size*.52,0,0,Math.PI*2);
    ctx.fillStyle = gr; ctx.fill();
  }

  else if (type === "scumble") {
    // Skip very dark areas — dry brush only on mid-tones and highlights
    if (lum(src) < 55) { ctx.restore(); return; }

    // Slightly lighter + warmer version of the source color
    const lc = {
      r: clamp(src.r + 18 + Math.random() * 22),
      g: clamp(src.g + 14 + Math.random() * 16),
      b: clamp(src.b +  8 + Math.random() * 10),
    };

    // 3–5 soft rounded dabs per stroke position
    const dabCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < dabCount; i++) {
      // Offset each dab slightly — gives broken, irregular texture
      const ox    = (Math.random() - 0.5) * size * 1.2;
      const oy    = (Math.random() - 0.5) * size * 1.2;
      const r     = size * (0.55 + Math.random() * 0.55); // round dab radius
      const alpha = 0.06 + Math.random() * 0.10; // very low alpha = dry brush feel

      // Radial gradient so dab fades at edges — no hard ellipse border
      const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
      gr.addColorStop(0,    `rgba(${lc.r},${lc.g},${lc.b},${alpha})`);
      gr.addColorStop(0.50, `rgba(${lc.r},${lc.g},${lc.b},${alpha * 0.55})`);
      gr.addColorStop(1,    `rgba(${lc.r},${lc.g},${lc.b},0)`);

      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();
    }

    // One very faint larger bloom on strong highlights
    if (lum(src) > 160) {
      const bloomR = size * 1.8;
      const bloomA = 0.04 + Math.random() * 0.05;
      const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, bloomR);
      bg.addColorStop(0,   `rgba(${lc.r},${lc.g},${lc.b},${bloomA})`);
      bg.addColorStop(1,   `rgba(${lc.r},${lc.g},${lc.b},0)`);
      ctx.beginPath();
      ctx.arc(0, 0, bloomR, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();
    }
  }

  else if (type === "detail") {
  const l = lum(src);
  if (l > 55 && l < 188) { ctx.restore(); return; } 
    if (lum(src) > 200) {
      const ic = { r:clamp(src.r+30), g:clamp(src.g+28), b:clamp(src.b+22) };
      ctx.beginPath(); ctx.ellipse(0,0,size*1.3,size*.55,0,0,Math.PI*2);
      ctx.fillStyle = `rgba(${ic.r},${ic.g},${ic.b},0.80)`; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,0,size*.7,size*.3,0,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,0.15)`; ctx.fill();
    } else {
      const c = classicTemp(src);
      const gr = ctx.createRadialGradient(0,0,0,0,0,size);
      gr.addColorStop(0,    `rgba(${c.r},${c.g},${c.b},0.65)`);
      gr.addColorStop(0.60, `rgba(${c.r},${c.g},${c.b},0.45)`);
      gr.addColorStop(1,    `rgba(${c.r},${c.g},${c.b},0)`);
      ctx.beginPath(); ctx.ellipse(0,0,size*1.4,size*.55,0,0,Math.PI*2);
      ctx.fillStyle = gr; ctx.fill();
    }
  }

  ctx.restore();
}