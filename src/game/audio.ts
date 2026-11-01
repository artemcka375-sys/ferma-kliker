let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(next: boolean) {
  muted = next;
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!ctx) ctx = new Ctx();
  if (ctx.state === "suspended") void ctx.resume();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
  if (muted || !ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function playMilk() {
  const wobble = 0.92 + Math.random() * 0.16;
  tone(210 * wobble, 0.07, "sine", 0.05);
  tone(140 * wobble, 0.09, "triangle", 0.03, 0.02);
}

export function playCrit() {
  tone(440, 0.08, "square", 0.04);
  tone(660, 0.12, "square", 0.04, 0.06);
}

export function playBuy() {
  tone(520, 0.07, "triangle", 0.05);
  tone(780, 0.1, "triangle", 0.04, 0.07);
}

export function playKefir() {
  tone(392, 0.1, "sine", 0.05);
  tone(494, 0.12, "sine", 0.05, 0.08);
  tone(587, 0.16, "sine", 0.05, 0.16);
}

export function playDrone() {
  tone(90, 0.22, "sawtooth", 0.03);
  tone(140, 0.18, "square", 0.02, 0.05);
}

export function playUi(kind: "tap" | "achieve" | "prestige" | "start") {
  if (kind === "tap") tone(640, 0.05, "sine", 0.03);
  if (kind === "start") {
    tone(330, 0.08, "triangle", 0.04);
    tone(494, 0.12, "triangle", 0.04, 0.08);
  }
  if (kind === "achieve") {
    tone(523, 0.08, "triangle", 0.04);
    tone(659, 0.1, "triangle", 0.04, 0.07);
    tone(784, 0.14, "triangle", 0.04, 0.14);
  }
  if (kind === "prestige") {
    tone(220, 0.12, "sine", 0.04);
    tone(330, 0.16, "sine", 0.04, 0.1);
  }
}
