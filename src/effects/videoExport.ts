import type { EffectDef } from "./registry";

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 60;

const BINGO_SEQUENCE = ["3", "2", "1", "B", "I", "N", "G", "O", "BINGO"];
const BINGO_LETTERS = ["B", "I", "N", "G", "O"];

const MP4_TYPES = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  'video/mp4;codecs="avc1.42E01E"',
  "video/mp4",
];

const FALLBACK_TYPES = [
  'video/webm;codecs="vp9"',
  'video/webm;codecs="vp8"',
  "video/webm",
];

export interface VideoExportResult {
  fileName: string;
  mimeType: string;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function pickMimeType() {
  const allTypes = [...MP4_TYPES, ...FALLBACK_TYPES];
  return allTypes.find(type => MediaRecorder.isTypeSupported(type)) || "";
}

function fileSafeName(name: string, mimeType: string) {
  const extension = mimeType.includes("mp4") ? "mp4" : "webm";
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "effect"}-white.${extension}`;
}

function stepFor(sequence: string[], elapsed: number, duration: number) {
  const stepMs = duration / sequence.length;
  const idx = Math.min(sequence.length - 1, Math.floor(elapsed / stepMs));
  const local = clamp((elapsed - idx * stepMs) / stepMs);
  return { idx, value: sequence[idx], local };
}

function setFont(ctx: CanvasRenderingContext2D, size: number, weight = 900, family = "Inter, Arial, sans-serif") {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
}

function drawGlowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  glow: string,
  scale = 1,
  rotate = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.scale(scale, scale);
  setFont(ctx, size);
  ctx.shadowColor = glow;
  ctx.shadowBlur = 46;
  ctx.fillStyle = color;
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha = 1, lineWidth = 8) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawParticleBurst(ctx: CanvasRenderingContext2D, effectId: number, progress: number, color: string, count = 90) {
  ctx.save();
  for (let i = 0; i < count; i += 1) {
    const angle = ((i * 137.5 + effectId * 17) * Math.PI) / 180;
    const speed = 120 + ((i * 41) % 260);
    const distance = speed * easeOutCubic(progress);
    const x = WIDTH / 2 + Math.cos(angle) * distance;
    const y = HEIGHT / 2 + Math.sin(angle) * distance;
    const size = 4 + ((i * 13) % 12);
    ctx.globalAlpha = (1 - progress) * (0.35 + ((i * 7) % 55) / 100);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawWhiteStage(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawSubtleGrid(ctx: CanvasRenderingContext2D, color = "#0f172a") {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let x = 0; x < WIDTH; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 90) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCountdownFrame(ctx: CanvasRenderingContext2D, effect: EffectDef, elapsed: number, duration: number) {
  const hasGo = [2, 13, 15, 16, 18, 21, 25].includes(effect.id) || effect.name.toLowerCase().includes("go");
  const sequence = hasGo ? ["3", "2", "1", "GO!"] : ["3", "2", "1"];
  const { idx, value, local } = stepFor(sequence, elapsed, duration);
  const isFinal = value === "GO!";
  const baseHue = (effect.id * 37) % 360;
  const accent = isFinal ? "#16a34a" : `hsl(${baseHue}, 86%, 42%)`;
  const secondary = `hsl(${(baseHue + 135) % 360}, 88%, 44%)`;
  const scale = 0.5 + easeOutBack(clamp(local)) * 0.5;

  drawWhiteStage(ctx);

  if ([5, 6, 16, 18, 22, 35].includes(effect.id)) drawSubtleGrid(ctx, accent);

  if ([3, 11, 15, 19, 20, 23, 25].includes(effect.id) || isFinal) {
    for (let i = 0; i < 5; i += 1) {
      const ringProgress = clamp(local - i * 0.08);
      drawRing(ctx, WIDTH / 2, HEIGHT / 2, 120 + ringProgress * 520 + i * 24, i % 2 ? secondary : accent, (1 - ringProgress) * 0.5, 8);
    }
  }

  if ([3, 9, 15, 25].includes(effect.id) || isFinal) {
    drawParticleBurst(ctx, effect.id + idx, clamp(local), isFinal ? "#22c55e" : "#f97316", isFinal ? 150 : 90);
  }

  if ([21, 36].includes(effect.id)) {
    ctx.save();
    ctx.strokeStyle = "#60a5fa";
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 80; i += 1) {
      const angle = (i / 80) * Math.PI * 2;
      const distance = 120 + ((i * 29 + elapsed / 4) % 620);
      ctx.beginPath();
      ctx.moveTo(WIDTH / 2 + Math.cos(angle) * distance * 0.45, HEIGHT / 2 + Math.sin(angle) * distance * 0.45);
      ctx.lineTo(WIDTH / 2 + Math.cos(angle) * distance, HEIGHT / 2 + Math.sin(angle) * distance);
      ctx.stroke();
    }
    ctx.restore();
  }

  if ([6, 17, 34].includes(effect.id)) {
    drawGlowText(ctx, value, WIDTH / 2 - 22, HEIGHT / 2 + 8, isFinal ? 260 : 380, "#ef4444", "#ef4444", scale);
    drawGlowText(ctx, value, WIDTH / 2 + 22, HEIGHT / 2 - 8, isFinal ? 260 : 380, "#06b6d4", "#06b6d4", scale);
  }

  if ([8, 20].includes(effect.id)) {
    const radius = 260;
    ctx.save();
    ctx.lineWidth = 22;
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(WIDTH / 2, HEIGHT / 2, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * local);
    ctx.stroke();
    ctx.restore();
  }

  const color = [9, 32].includes(effect.id) ? "#ea580c" : [10, 33].includes(effect.id) ? "#0284c7" : accent;
  const y = HEIGHT / 2 + (idx % 2 === 0 ? -18 : 18) * (1 - local);
  drawGlowText(ctx, value, WIDTH / 2, y, isFinal ? 260 : 400, color, color, scale, [14, 19].includes(effect.id) ? (1 - local) * -0.1 : 0);

}

function drawBingoBall(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, radius: number, accent: string, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const gradient = ctx.createRadialGradient(-radius * 0.35, -radius * 0.42, 12, 0, 0, radius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.55, "#f8fafc");
  gradient.addColorStop(1, "#dbeafe");
  ctx.fillStyle = gradient;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 42;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = accent;
  ctx.stroke();
  ctx.shadowBlur = 0;
  setFont(ctx, text === "BINGO" ? radius * 0.38 : radius * 1.05);
  ctx.fillStyle = "#0f172a";
  ctx.fillText(text, 0, 8);
  ctx.restore();
}

function drawBingoCard(ctx: CanvasRenderingContext2D, formedCount: number, final: boolean, accent: string, secondary: string) {
  const x = 560;
  const y = 170;
  const size = 800;
  const cell = size / 5;
  const marks = [0, 6, 12, 18, 24];
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 34;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 28);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  if (!final) {
    setFont(ctx, 78);
    BINGO_LETTERS.forEach((letter, i) => {
      ctx.fillStyle = i === formedCount - 1 ? accent : "#94a3b8";
      ctx.fillText(letter, x + cell * i + cell / 2, y + 76);
    });
  }
  const numbers = ["07", "19", "33", "48", "62", "12", "24", "FREE", "55", "70", "03", "29", "41", "52", "66", "15", "20", "37", "59", "73", "10", "26", "44", "57", "68"];
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const i = row * 5 + col;
      const cx = x + col * cell + cell / 2;
      const cy = y + row * cell + cell / 2 + 80;
      const markIndex = marks.indexOf(i);
      const marked = final || numbers[i] === "FREE" || (markIndex >= 0 && markIndex === formedCount - 1);
      ctx.fillStyle = marked ? `${secondary}22` : "#f8fafc";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.fillRect(x + col * cell + 12, y + row * cell + 112, cell - 24, cell - 24);
      ctx.strokeRect(x + col * cell + 12, y + row * cell + 112, cell - 24, cell - 24);
      setFont(ctx, numbers[i] === "FREE" ? 34 : 46);
      ctx.fillStyle = "#0f172a";
      ctx.fillText(numbers[i], cx, cy + 80);
      if (marked) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy + 80, 48, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  if (final) {
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2);
    ctx.rotate(-0.14);
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 14;
    ctx.fillStyle = "#dc2626";
    ctx.shadowColor = "#dc2626";
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.roundRect(-250, -88, 500, 176, 20);
    ctx.stroke();
    setFont(ctx, 94);
    ctx.fillText("BINGO", 0, 8);
    ctx.restore();
  }
  ctx.restore();
}

function drawBingoSlot(ctx: CanvasRenderingContext2D, formedCount: number, final: boolean, accent: string, secondary: string, local: number) {
  const reelW = 210;
  const reelH = 280;
  const gap = 28;
  const total = reelW * 5 + gap * 4;
  const startX = WIDTH / 2 - total / 2;
  const y = 325;
  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.shadowColor = accent;
  ctx.shadowBlur = 44;
  ctx.beginPath();
  ctx.roundRect(startX - 54, y - 54, total + 108, reelH + 108, 28);
  ctx.fill();
  ctx.shadowBlur = 0;
  if (!final) BINGO_LETTERS.forEach((letter, i) => {
    const x = startX + i * (reelW + gap);
    const active = i === formedCount - 1;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(x, y, reelW, reelH, 16);
    ctx.fill();
    ctx.strokeStyle = active ? accent : "#cbd5e1";
    ctx.lineWidth = 8;
    ctx.stroke();
    setFont(ctx, active ? 150 : 92);
    ctx.fillStyle = active ? "#0f172a" : "#cbd5e1";
    const bounce = active && i === formedCount - 1 ? Math.sin(local * Math.PI) * -24 : 0;
    ctx.fillText(active ? letter : "?", x + reelW / 2, y + reelH / 2 + bounce);
  });
  if (final) {
    drawGlowText(ctx, "BINGO", WIDTH / 2, y + reelH / 2, 190, "#0f172a", accent, 1);
    drawParticleBurst(ctx, 29, local, secondary, 120);
  }
  ctx.restore();
}

function drawMarquee(ctx: CanvasRenderingContext2D, text: string, formedCount: number, final: boolean, accent: string, secondary: string, elapsed: number) {
  const x = 250;
  const y = 230;
  const w = 1420;
  const h = 520;
  ctx.save();
  ctx.fillStyle = "#fff7ed";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 12;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 38;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);
  ctx.fill();
  ctx.stroke();
  const bulbs = 44;
  for (let i = 0; i < bulbs; i += 1) {
    const edgeProgress = i / bulbs;
    const bx = x + 42 + (w - 84) * edgeProgress;
    const top = i % 2 === 0;
    ctx.beginPath();
    ctx.fillStyle = (i + Math.floor(elapsed / 160)) % 2 === 0 ? accent : secondary;
    ctx.shadowColor = ctx.fillStyle as string;
    ctx.shadowBlur = 18;
    ctx.arc(bx, top ? y + 28 : y + h - 28, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  drawGlowText(ctx, final ? "BINGO" : text, WIDTH / 2, y + 330, final ? 160 : 230, "#0f172a", secondary, 1);
  ctx.restore();
}

function drawOrbit(ctx: CanvasRenderingContext2D, text: string, formedCount: number, final: boolean, accent: string, secondary: string, elapsed: number) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  ctx.save();
  for (let i = 0; i < 4; i += 1) drawRing(ctx, cx, cy, 190 + i * 82, i % 2 ? secondary : accent, 0.22, 5);
  if (!final) BINGO_LETTERS.forEach((letter, i) => {
    const angle = (i / BINGO_LETTERS.length) * Math.PI * 2 + elapsed / 850;
    const active = i === formedCount - 1;
    const radius = final ? 90 : 330;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    drawGlowText(ctx, active ? letter : "", x, y, 94, "#0f172a", active ? accent : secondary, 1);
  });
  drawGlowText(ctx, final ? "BINGO" : text, cx, cy, final ? 170 : 260, "#0f172a", accent, 1);
  ctx.restore();
}

function drawScanner(ctx: CanvasRenderingContext2D, text: string, formedCount: number, final: boolean, accent: string, secondary: string, elapsed: number) {
  const x = 280;
  const y = 230;
  const w = 1360;
  const h = 560;
  ctx.save();
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.stroke();
  const scanY = y + ((elapsed / 7) % h);
  const grad = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 70);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.5, `${accent}55`);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(x, scanY - 70, w, 140);
  drawSubtleGrid(ctx, secondary);
  drawGlowText(ctx, final ? "BINGO" : text, WIDTH / 2, y + 350, final ? 160 : 240, "#0f172a", secondary, 1);
  ctx.restore();
}

function drawStamp(ctx: CanvasRenderingContext2D, text: string, formedCount: number, final: boolean, accent: string, secondary: string, local: number) {
  if (final) {
    ctx.save();
    ctx.translate(WIDTH / 2, HEIGHT / 2 + 80);
    ctx.rotate(-0.12);
    const scale = 0.7 + easeOutBack(local) * 0.3;
    ctx.scale(scale, scale);
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 16;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 38;
    ctx.beginPath();
    ctx.roundRect(-360, -122, 720, 244, 26);
    ctx.stroke();
    setFont(ctx, 148);
    ctx.fillText("BINGO", 0, 12);
    ctx.restore();
  } else {
    drawGlowText(ctx, text, WIDTH / 2, HEIGHT / 2, 330, "#0f172a", secondary, 1);
  }
}

function drawDrum(ctx: CanvasRenderingContext2D, text: string, formedCount: number, final: boolean, accent: string, secondary: string, elapsed: number) {
  ctx.save();
  for (let i = 0; i < 18; i += 1) {
    const x = 180 + i * 92;
    const height = 80 + Math.abs(Math.sin(elapsed / 140 + i)) * 260;
    ctx.fillStyle = i % 2 ? secondary : accent;
    ctx.globalAlpha = 0.22;
    ctx.fillRect(x, HEIGHT / 2 - height / 2, 26, height);
  }
  ctx.globalAlpha = 1;
  drawBingoBall(ctx, final ? "BINGO" : text, WIDTH / 2, HEIGHT / 2, final ? 190 : 220, accent, 1);
  ctx.restore();
}

function drawBingoFrame(ctx: CanvasRenderingContext2D, effect: EffectDef, elapsed: number, duration: number) {
  const { idx, value, local } = stepFor(BINGO_SEQUENCE, elapsed, duration);
  const formedCount = idx < 3 ? 0 : Math.min(BINGO_LETTERS.length, idx - 2);
  const final = value === "BINGO";
  const variant = effect.id;
  const accent = ["#facc15", "#22d3ee", "#f59e0b", "#fbbf24", "#ef4444", "#ec4899", "#f97316", "#38bdf8", "#06b6d4", "#f43f5e", "#60a5fa", "#22c55e", "#a855f7", "#94a3b8", "#38bdf8", "#7dd3fc", "#0ea5e9", "#eab308", "#fb7185", "#facc15"][(effect.id - 26) % 20];
  const secondary = ["#22c55e", "#ec4899", "#22c55e", "#ef4444", "#f97316", "#38bdf8", "#ef4444", "#60a5fa", "#f472b6", "#22d3ee", "#93c5fd", "#86efac", "#22d3ee", "#64748b", "#f43f5e", "#c084fc", "#38bdf8", "#60a5fa", "#facc15", "#22c55e"][(effect.id - 26) % 20];

  drawWhiteStage(ctx);

  if ([34, 35, 37, 41].includes(variant)) drawSubtleGrid(ctx, accent);
  if ([36, 38, 42].includes(variant)) drawOrbit(ctx, value, formedCount, final, accent, secondary, elapsed);
  else if ([29].includes(variant)) drawBingoSlot(ctx, formedCount, final, accent, secondary, local);
  else if ([30].includes(variant)) drawBingoCard(ctx, formedCount, final, accent, secondary);
  else if ([27, 31].includes(variant)) drawMarquee(ctx, value, formedCount, final, accent, secondary, elapsed);
  else if ([34, 35, 37, 41].includes(variant)) drawScanner(ctx, value, formedCount, final, accent, secondary, elapsed);
  else if ([39, 40, 43, 45].includes(variant)) drawStamp(ctx, value, formedCount, final, accent, secondary, local);
  else if ([44].includes(variant)) drawDrum(ctx, value, formedCount, final, accent, secondary, elapsed);
  else if ([32, 33].includes(variant)) {
    const y = 300 + easeOutBack(local) * 220;
    drawGlowText(ctx, final ? "BINGO" : value, WIDTH / 2, final ? HEIGHT / 2 : y, final ? 180 : 290, "#0f172a", accent, 1);
  } else {
    drawBingoBall(ctx, final ? "BINGO" : value, WIDTH / 2, HEIGHT / 2, final ? 205 : 230, accent, 0.82 + Math.sin(local * Math.PI) * 0.18);
  }

  if ([28, 31, 45].includes(variant) && final) drawParticleBurst(ctx, effect.id, local, secondary, 150);

}

function drawExportFrame(ctx: CanvasRenderingContext2D, effect: EffectDef, elapsed: number, duration: number) {
  if (effect.category === "bingo") drawBingoFrame(ctx, effect, elapsed, duration);
  else drawCountdownFrame(ctx, effect, elapsed, duration);
}

async function renderToRecorder(ctx: CanvasRenderingContext2D, effect: EffectDef, recorder: MediaRecorder, duration: number) {
  await new Promise<void>(resolve => {
    let start: number | null = null;

    const frame = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      drawExportFrame(ctx, effect, Math.min(elapsed, duration), duration);
      if (elapsed < duration) requestAnimationFrame(frame);
      else resolve();
    };

    recorder.start(250);
    requestAnimationFrame(frame);
  });
}

export async function downloadEffectVideo(effect: EffectDef): Promise<VideoExportResult> {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Este navegador nao suporta gravacao de video.");
  }

  const mimeType = pickMimeType();
  if (!mimeType) {
    throw new Error("Este navegador nao suporta exportacao MP4/WebM via MediaRecorder.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Nao foi possivel criar o canvas de exportacao.");

  const stream = canvas.captureStream(FPS);
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: mimeType.includes("mp4") ? 10_000_000 : 8_000_000,
  });
  recorder.ondataavailable = event => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Falha ao gravar o video."));
  });

  const duration = effect.category === "bingo" ? 7200 : 4600;
  drawExportFrame(ctx, effect, 0, duration);
  await renderToRecorder(ctx, effect, recorder, duration);
  recorder.stop();
  await stopped;
  stream.getTracks().forEach(track => track.stop());

  const fileName = fileSafeName(effect.name, mimeType);
  const blob = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { fileName, mimeType };
}
