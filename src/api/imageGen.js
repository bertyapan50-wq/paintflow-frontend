// src/api/imageGen.js
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

// ── Text-to-image ─────────────────────────────────────────
export async function generateStepImage(prompt) {
  const response = await fetch(`${BACKEND}/api/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Image gen failed (${response.status}): ${err.error}`);
  }

  const data = await response.json();
  return data.image; // base64 data URL
}

// ── Img2Img (strength-based prompt weighting) ────────────
// strength: 0.38 (early sketch) → 0.80 (full detail)
export async function generateStepImageImg2Img(prompt, imageBase64, strength = 0.75, seed) {
  const response = await fetch(`${BACKEND}/api/generate-image-img2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, strength, seed }),
    // Note: imageBase64 not sent — HF free tier has no img2img endpoint
    // We use strength to hint the prompt about what stage we're in
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Img2img failed (${response.status}): ${err.error}`);
  }

  const data = await response.json();
  return data.image;
}

// ── Health check ──────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await fetch(`${BACKEND}/health`);
    return res.ok;
  } catch {
    return false;
  }
}