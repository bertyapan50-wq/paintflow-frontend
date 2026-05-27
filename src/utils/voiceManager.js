// ═══════════════════════════════════════════════════════════
//  VOICE MANAGER — Microsoft Edge TTS via backend proxy
//  Audio routed through AudioContext → MediaStreamDestination
//  so it gets recorded together with the canvas stream.
// ═══════════════════════════════════════════════════════════
import API_URL from "../lib/api";
let _audioCtx = null;
let _destNode = null;
let _queue    = [];
let _isSpeaking  = false;
let _isMuted     = false;
let _lastEnqueued = "";

// ── 1. INIT ───────────────────────────────────────────────
export function initVoice() {
  if (_audioCtx) return Promise.resolve();
  _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  _destNode = _audioCtx.createMediaStreamDestination();
  return Promise.resolve();
}

// ── 2. GET AUDIO STREAM for MediaRecorder ────────────────
export function getAudioStream() {
  return _destNode?.stream ?? null;
}

// ── 3. FETCH TTS from backend ─────────────────────────────
async function fetchTTS(text) {
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 200));
    remaining = remaining.slice(200);
  }

  const buffers = [];
  for (const chunk of chunks) {
    try {
      const res = await fetch(
        `${API_URL}/api/tts?text=${encodeURIComponent(chunk)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      buffers.push(buf);
    } catch (e) {
      console.warn("TTS fetch failed:", e);
    }
  }
  return buffers;
}

// ── 4. PLAY BUFFER through AudioContext ───────────────────
function playBuffer(arrayBuffer) {
  return new Promise((resolve) => {
    if (!_audioCtx || !_destNode) { resolve(); return; }

    _audioCtx.decodeAudioData(
      arrayBuffer,
      (decoded) => {
        const source = _audioCtx.createBufferSource();
        source.buffer = decoded;
        source.connect(_audioCtx.destination); // speakers
        source.connect(_destNode);             // recording
        source.onended = resolve;
        source.start(0);
      },
      (err) => {
        console.warn("decodeAudioData error:", err);
        resolve();
      }
    );
  });
}

// ── 5. QUEUE PROCESSOR ────────────────────────────────────
async function _processQueue() {
  if (_isMuted || _isSpeaking || !_queue.length) return;

  const item = _queue.shift();
  if (!item) return;

  _isSpeaking = true;
  if (item.onStart) item.onStart(item.text);

  try {
    const buffers = await fetchTTS(item.text);
    for (const buf of buffers) {
      if (_isMuted) break;
      await playBuffer(buf);
      await new Promise((r) => setTimeout(r, 80));
    }
  } catch (e) {
    console.warn("TTS queue error:", e);
  }

  _isSpeaking = false;
  await new Promise((r) => setTimeout(r, 200));
  _processQueue();
}

// ── 6. PUBLIC API ─────────────────────────────────────────
export function enqueueCaption(text, onStart) {
  if (!text || text === _lastEnqueued) return;
  _lastEnqueued = text;
  _queue.push({ text, onStart });
  _processQueue();
}

export function flushSpeech() {
  _queue.length = 0;
  _lastEnqueued = "";
  _isSpeaking   = false;
}

export function pauseSpeech() {
  _isMuted = true;
}

export function resumeSpeech() {
  _isMuted = false;
  _processQueue();
}

export function getActiveCaptionIndex(phaseStartMs, captionDurationMs) {
  const elapsed = Date.now() - phaseStartMs;
  return Math.floor(elapsed / captionDurationMs);
}

// Wait for all speech to finish before stopping the recorder
export function waitForSpeechEnd() {
  return new Promise((resolve) => {
    const check = () => {
      if (!_isSpeaking && _queue.length === 0) {
        resolve();
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  });
}