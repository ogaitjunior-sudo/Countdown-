import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EffectProps {
  onComplete?: () => void;
}

// ─── Countdown hook ───
function useCountdownSeq(items: string[], interval: number, onDone?: () => void) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (idx < items.length - 1) {
      const t = setTimeout(() => setIdx(idx + 1), interval);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setDone(true); onDone?.(); }, interval);
      return () => clearTimeout(t);
    }
  }, [idx, items.length, interval]);
  return { current: items[idx], idx, done };
}

// ─── Explosion Particles (Canvas) ───
const ParticleCanvas: React.FC<{ color?: string; count?: number; duration?: number; burst?: boolean }> = ({
  color = "#a855f7", count = 60, duration = 2500, burst = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const particles = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? Math.random() * 12 + 3 : Math.random() * 3 + 0.5;
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        alpha: 1,
      };
    });
    let frame: number;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      if (elapsed > duration) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98; p.vy *= 0.98;
        p.alpha = Math.max(0, 1 - elapsed / duration);
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [color, count, duration, burst]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ─── Shockwave Ring ───
const Shockwave: React.FC<{ color?: string }> = ({ color }) => (
  <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      className="rounded-full"
      style={{ border: `3px solid ${color || "hsl(185, 95%, 55%)"}` }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ width: 600, height: 600, opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
  </motion.div>
);

// ─── Screen Flash ───
const ScreenFlash: React.FC<{ color?: string; delay?: number }> = ({ color = "white", delay = 0 }) => (
  <motion.div className="absolute inset-0 pointer-events-none z-50"
    style={{ backgroundColor: color }}
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.9, 0] }}
    transition={{ duration: 0.4, delay }} />
);

const MatrixRainCanvas: React.FC<{ color?: string; opacity?: number }> = ({ color = "#22c55e", opacity = 0.85 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const fontSize = 18;
    const glyphs = "0123456789BRIVALFX";
    let drops: number[] = [];
    let frame: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const columns = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * (canvas.height / fontSize));
    };

    const animate = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      drops.forEach((drop, i) => {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(glyph, i * fontSize, drop * fontSize);
        if (drop * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [color, opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-70" />;
};

const StarfieldCanvas: React.FC<{ color?: string; count?: number }> = ({ color = "#dbeafe", count = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame: number;
    let stars: Array<{ x: number; y: number; z: number; pz: number }> = [];

    const resetStar = (star: { x: number; y: number; z: number; pz: number }) => {
      star.x = (Math.random() - 0.5) * canvas.width;
      star.y = (Math.random() - 0.5) * canvas.height;
      star.z = canvas.width;
      star.pz = star.z;
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: count }, () => {
        const z = Math.random() * canvas.width;
        return {
          x: (Math.random() - 0.5) * canvas.width,
          y: (Math.random() - 0.5) * canvas.height,
          z,
          pz: z,
        };
      });
    };

    const animate = () => {
      ctx.fillStyle = "rgba(2, 6, 23, 0.28)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      stars.forEach(star => {
        star.pz = star.z;
        star.z -= 10;
        if (star.z < 1) resetStar(star);

        const sx = (star.x / star.z) * canvas.width + canvas.width / 2;
        const sy = (star.y / star.z) * canvas.height + canvas.height / 2;
        const px = (star.x / star.pz) * canvas.width + canvas.width / 2;
        const py = (star.y / star.pz) * canvas.height + canvas.height / 2;
        const size = Math.max(1, (1 - star.z / canvas.width) * 4);

        ctx.globalAlpha = Math.min(1, size / 3);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [color, count]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const ConfettiCanvas: React.FC<{ count?: number }> = ({ count = 140 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const colors = ["#22c55e", "#38bdf8", "#f59e0b", "#ec4899", "#a855f7", "#f43f5e"];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const pieces = Array.from({ length: count }, () => ({
      x: cx + (Math.random() - 0.5) * 180,
      y: cy + 30,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 16 - 6,
      w: Math.random() * 8 + 5,
      h: Math.random() * 18 + 8,
      rotate: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
    }));
    let frame: number;
    const start = Date.now();
    const duration = 2600;

    const animate = () => {
      const elapsed = Date.now() - start;
      if (elapsed > duration) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(piece => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.38;
        piece.vx *= 0.995;
        piece.rotate += piece.spin;
        piece.alpha = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.globalAlpha = piece.alpha;
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotate);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />;
};

const smokeWisps = Array.from({ length: 14 }, (_, i) => ({
  width: 160 + (i % 4) * 50,
  height: 90 + (i % 5) * 24,
  left: 10 + ((i * 17) % 78),
  top: 12 + ((i * 23) % 70),
  delay: (i % 6) * 0.16,
  drift: i % 2 === 0 ? 34 : -34,
}));

const SmokeLayer: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {smokeWisps.map((wisp, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-2xl"
        style={{
          width: wisp.width,
          height: wisp.height,
          left: `${wisp.left}%`,
          top: `${wisp.top}%`,
          background: "radial-gradient(circle, rgba(226,232,240,0.26), rgba(100,116,139,0.08) 42%, rgba(15,23,42,0) 72%)",
        }}
        initial={{ opacity: 0, x: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.75, 0.15], x: wisp.drift, scale: [0.8, 1.25, 1.7] }}
        transition={{ duration: 2.3, delay: wisp.delay, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
    ))}
  </div>
);

// ═══════════════════════════════════════════
// COUNTDOWN EFFECTS
// ═══════════════════════════════════════════

const ClassicCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-primary"
            style={{ textShadow: "0 0 80px hsl(265 80% 60% / 0.8), 0 0 150px hsl(265 80% 60% / 0.3)" }}
            initial={{ scale: 4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const CountdownWithGO: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1", "GO!"], 800);
  return (
    <div className="flex items-center justify-center h-full relative">
      {current === "GO!" && <><Shockwave color="hsl(145,80%,50%)" /><ParticleCanvas color="#22c55e" count={80} duration={1500} /></>}
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-black relative z-10 ${current === "GO!" ? "text-[10rem] md:text-[14rem] text-neon-green" : "text-[12rem] md:text-[16rem] text-primary"}`}
            style={{ textShadow: current === "GO!" ? "0 0 80px hsl(145 80% 50% / 0.9)" : "0 0 60px hsl(265 80% 60% / 0.7)" }}
            initial={{ scale: 4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.2, opacity: 0 }}
            transition={{ duration: 0.35 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExplosionCountdown: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1"], 1300);
  return (
    <div className="flex items-center justify-center h-full relative">
      <ParticleCanvas key={idx} color="#f59e0b" count={80} duration={1100} />
      <Shockwave key={`sw-${idx}`} color="hsl(45,95%,55%)" />
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-accent relative z-10"
            style={{ textShadow: "0 0 60px hsl(45 95% 55% / 0.7)" }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 5, opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const NeonCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-neon-cyan"
            style={{ textShadow: "0 0 40px hsl(185 95% 55% / 0.8), 0 0 80px hsl(185 95% 55% / 0.4), 0 0 120px hsl(185 95% 55% / 0.2)" }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.3, 1, 0.1, 1] }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const DigitalLEDCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className="text-[12rem] md:text-[16rem] font-mono font-black text-neon-red"
            style={{ textShadow: "0 0 50px hsl(0 85% 55% / 0.9), 0 0 100px hsl(0 85% 55% / 0.4)", letterSpacing: "0.1em" }}
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const GlitchCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-foreground relative"
            initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, -8, 8, -5, 0] }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <span className="absolute text-neon-cyan opacity-50" style={{ left: 4, top: -3, clipPath: "inset(20% 0 50% 0)" }}>{current}</span>
            <span className="absolute text-neon-pink opacity-50" style={{ left: -4, top: 3, clipPath: "inset(50% 0 20% 0)" }}>{current}</span>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const PulseCountdown: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1"], 1000);
  const intensity = 1 + (2 - idx) * 0.15;
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-primary"
            style={{ textShadow: "0 0 60px hsl(265 80% 60% / 0.7)" }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, intensity, 1], opacity: 1 }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ duration: 0.6 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const CircularCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  const r = 140, circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.div key={current} className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
            <svg width="320" height="320" className="absolute" style={{ filter: "drop-shadow(0 0 20px hsl(185 95% 55% / 0.5))" }}>
              <circle cx="160" cy="160" r={r} fill="none" stroke="hsl(185, 95%, 55%)" strokeWidth="6"
                strokeDasharray={circ} strokeLinecap="round"
                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}>
                <animate attributeName="stroke-dashoffset" from={circ} to="0" dur="0.9s" fill="freeze" />
              </circle>
            </svg>
            <h1 className="text-[10rem] font-black text-secondary"
              style={{ textShadow: "0 0 50px hsl(185 95% 55% / 0.6)" }}>{current}</h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FireCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black"
            style={{
              background: "linear-gradient(to top, #f59e0b, #ef4444, #fbbf24)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 40px rgba(245,158,11,0.7))",
            }}
            initial={{ scale: 0, opacity: 0, y: 80 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.4 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const IceCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black"
            style={{
              background: "linear-gradient(to bottom, #67e8f9, #3b82f6, #e0f2fe)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 50px rgba(59,130,246,0.6))",
            }}
            initial={{ scale: 2, opacity: 0, filter: "blur(15px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.6 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShockwaveCountdown: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1"], 1200);
  return (
    <div className="flex items-center justify-center h-full relative">
      <Shockwave key={idx} />
      <Shockwave key={`sw2-${idx}`} color="hsl(265, 80%, 60%)" />
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-secondary relative z-10"
            style={{ textShadow: "0 0 60px hsl(185 95% 55% / 0.7)" }}
            initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const CinematicSlowCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 2200);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-muted-foreground/60"
            initial={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
            animate={{ opacity: [0, 0.8, 1, 0.6], scale: [0.7, 1, 1.05, 1], filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.3, filter: "blur(5px)" }}
            transition={{ duration: 2 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpeedCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1", "GO!"], 300);
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-black ${current === "GO!" ? "text-[10rem] md:text-[14rem] text-neon-green" : "text-[12rem] md:text-[16rem] text-foreground"}`}
            style={{ textShadow: current === "GO!" ? "0 0 60px hsl(145 80% 50% / 0.8)" : "none" }}
            initial={{ x: 300, opacity: 0, filter: "blur(15px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0)" }}
            exit={{ x: -300, opacity: 0, filter: "blur(15px)" }}
            transition={{ duration: 0.12 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const MassiveNumberSlam: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1"], 1100);
  return (
    <div className="flex items-center justify-center h-full relative">
      <Shockwave key={idx} />
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[14rem] md:text-[20rem] font-black text-primary relative z-10"
            style={{ textShadow: "0 0 80px hsl(265 80% 60% / 0.8)" }}
            initial={{ y: -500, scale: 3, opacity: 0 }}
            animate={{ y: [null, 20, -10, 0], scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5, ease: "easeIn" }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const UltimateCountdown: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1", "GO!"], 1100);
  const isGo = current === "GO!";
  return (
    <div className="flex items-center justify-center h-full relative">
      <ParticleCanvas key={idx} color={isGo ? "#22c55e" : "#a855f7"} count={80} duration={1000} />
      <Shockwave key={`sw-${idx}`} color={isGo ? "hsl(145,80%,50%)" : "hsl(265,80%,60%)"} />
      {isGo && <ScreenFlash color="hsl(145,80%,50%)" />}
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-black relative z-10 ${isGo ? "text-[10rem] md:text-[14rem] text-neon-green" : "text-[12rem] md:text-[16rem] text-primary"}`}
            style={{ textShadow: isGo ? "0 0 100px hsl(145 80% 50% / 1)" : "0 0 80px hsl(265 80% 60% / 0.8)" }}
            initial={{ scale: 5, opacity: 0, rotate: -15 }}
            animate={{ scale: [5, 0.85, 1], opacity: 1, rotate: 0 }}
            exit={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════
// EFFECT MAP
// ═══════════════════════════════════════════

const LaserGridCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1", "GO!"], 850);
  const isGo = current === "GO!";
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
            style={{ top: `${8 + i * 8}%` }}
            animate={{ opacity: [0.15, 0.8, 0.15], x: ["-8%", "8%", "-8%"] }}
            transition={{ duration: 1.3, delay: i * 0.05, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-400 to-transparent"
            style={{ left: `${6 + i * 10}%` }}
            animate={{ opacity: [0.08, 0.5, 0.08], y: ["-6%", "6%", "-6%"] }}
            transition={{ duration: 1.6, delay: i * 0.07, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      {isGo && <><ScreenFlash color="hsl(12,95%,55%)" /><ParticleCanvas color="#f97316" count={90} duration={1200} /></>}
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-black relative z-10 ${isGo ? "text-[10rem] md:text-[14rem]" : "text-[12rem] md:text-[16rem]"}`}
            style={{
              color: isGo ? "#fb923c" : "#f8fafc",
              textShadow: isGo ? "0 0 90px rgba(249,115,22,0.95)" : "0 0 45px rgba(34,211,238,0.7), 0 0 90px rgba(248,113,113,0.45)",
            }}
            initial={{ opacity: 0, scaleX: 0.25, filter: "brightness(2)" }}
            animate={{ opacity: 1, scaleX: [0.25, 1.18, 1], filter: "brightness(1)" }}
            exit={{ opacity: 0, scaleX: 1.8, filter: "blur(10px)" }}
            transition={{ duration: 0.38, ease: "easeOut" }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChromaticSplitCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 950);
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!done && (
          <motion.div key={current} className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.65, rotate: -3 }}
            animate={{ opacity: 1, scale: [0.65, 1.08, 1], rotate: 0 }}
            exit={{ opacity: 0, scale: 1.4, rotate: 4 }}
            transition={{ duration: 0.45 }}>
            <motion.h1 className="absolute text-[12rem] md:text-[16rem] font-black text-red-500"
              style={{ mixBlendMode: "screen", textShadow: "0 0 45px rgba(239,68,68,0.65)" }}
              animate={{ x: [-18, 12, -6], y: [8, -5, 0] }}
              transition={{ duration: 0.32 }}>
              {current}
            </motion.h1>
            <motion.h1 className="absolute text-[12rem] md:text-[16rem] font-black text-cyan-300"
              style={{ mixBlendMode: "screen", textShadow: "0 0 45px rgba(34,211,238,0.65)" }}
              animate={{ x: [18, -12, 5], y: [-8, 5, 0] }}
              transition={{ duration: 0.32 }}>
              {current}
            </motion.h1>
            <motion.h1 className="text-[12rem] md:text-[16rem] font-black text-white relative z-10"
              style={{ textShadow: "0 0 55px rgba(255,255,255,0.45)" }}>
              {current}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MatrixRainCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1", "RUN"], 900);
  const isRun = current === "RUN";
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden bg-emerald-950/10">
      <MatrixRainCanvas color={isRun ? "#86efac" : "#22c55e"} opacity={isRun ? 1 : 0.75} />
      {isRun && <Shockwave color="hsl(145,80%,50%)" />}
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-mono font-black relative z-10 ${isRun ? "text-[8rem] md:text-[12rem]" : "text-[12rem] md:text-[16rem]"}`}
            style={{ color: "#bbf7d0", textShadow: "0 0 35px rgba(34,197,94,0.95), 0 0 90px rgba(34,197,94,0.45)" }}
            initial={{ opacity: 0, y: -70, filter: "blur(10px)" }}
            animate={{ opacity: [0, 1, 0.75, 1], y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 70, filter: "blur(8px)" }}
            transition={{ duration: 0.45 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const VortexCountdown: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`${idx}-${i}`}
            className="absolute rounded-full border"
            style={{
              width: 180 + i * 56,
              height: 180 + i * 56,
              borderColor: i % 2 === 0 ? "rgba(168,85,247,0.42)" : "rgba(34,211,238,0.34)",
              boxShadow: i % 2 === 0 ? "0 0 24px rgba(168,85,247,0.28)" : "0 0 24px rgba(34,211,238,0.24)",
            }}
            initial={{ opacity: 0, scale: 1.35, rotate: i * 18 }}
            animate={{ opacity: [0, 0.8, 0], scale: [1.35, 0.72, 1.05], rotate: i * 18 + 240 }}
            transition={{ duration: 0.9, delay: i * 0.04, ease: "easeInOut" }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-primary relative z-10"
            style={{ textShadow: "0 0 70px hsl(265 80% 60% / 0.8), 0 0 120px rgba(34,211,238,0.3)" }}
            initial={{ scale: 0.2, opacity: 0, rotate: -180 }}
            animate={{ scale: [0.2, 1.15, 1], opacity: 1, rotate: 0 }}
            exit={{ scale: 0.1, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.55, ease: "easeOut" }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const RippleCountdown: React.FC<EffectProps> = () => {
  const { current, idx, done } = useCountdownSeq(["3", "2", "1"], 1050);
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`${idx}-${i}`}
            className="absolute rounded-full border-2 border-cyan-300"
            initial={{ width: 40, height: 40, opacity: 0.75 }}
            animate={{ width: 260 + i * 90, height: 260 + i * 90, opacity: 0 }}
            transition={{ duration: 1, delay: i * 0.12, ease: "easeOut" }}
            style={{ boxShadow: "0 0 28px rgba(34,211,238,0.3)" }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black text-cyan-100 relative z-10"
            style={{ textShadow: "0 0 65px rgba(34,211,238,0.85)" }}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: [0.8, 1.04, 1], filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.25, filter: "blur(10px)" }}
            transition={{ duration: 0.45 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const StarfieldWarpCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1", "WARP"], 750);
  const isWarp = current === "WARP";
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden bg-slate-950">
      <StarfieldCanvas color={isWarp ? "#fde68a" : "#bfdbfe"} count={isWarp ? 260 : 180} />
      {isWarp && <ScreenFlash color="hsl(45,95%,65%)" />}
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-black relative z-10 ${isWarp ? "text-[7rem] md:text-[11rem]" : "text-[12rem] md:text-[16rem]"}`}
            style={{ color: isWarp ? "#fde68a" : "#e0f2fe", textShadow: isWarp ? "0 0 100px rgba(253,230,138,0.95)" : "0 0 75px rgba(147,197,253,0.75)" }}
            initial={{ opacity: 0, scale: 2.5, filter: "blur(18px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.1, filter: "blur(16px)" }}
            transition={{ duration: 0.35 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const HologramCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(125,211,252,0.22) 9px, transparent 11px)" }} />
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black relative"
            style={{
              color: "transparent",
              WebkitTextStroke: "3px rgba(125,211,252,0.95)",
              textShadow: "0 0 38px rgba(125,211,252,0.75), 0 0 90px rgba(14,165,233,0.35)",
            }}
            initial={{ opacity: 0, y: 35, skewX: -12 }}
            animate={{ opacity: [0, 1, 0.55, 1], y: 0, skewX: [12, -5, 0] }}
            exit={{ opacity: 0, y: -35, skewX: 12 }}
            transition={{ duration: 0.52 }}>
            <span className="absolute inset-0 text-sky-300 opacity-35" style={{ clipPath: "inset(0 0 58% 0)" }}>{current}</span>
            <span className="absolute inset-0 text-fuchsia-300 opacity-25" style={{ clipPath: "inset(58% 0 0 0)", transform: "translateX(-8px)" }}>{current}</span>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const PrismCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1000);
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-50">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-1 w-[70vw] origin-left"
            style={{
              rotate: `${i * 24 - 72}deg`,
              background: `linear-gradient(90deg, transparent, hsla(${i * 48}, 95%, 62%, 0.55), transparent)`,
            }}
            animate={{ scaleX: [0.25, 1, 0.35], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1, delay: i * 0.06, repeat: Infinity, repeatDelay: 0.35 }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className="text-[12rem] md:text-[16rem] font-black bg-clip-text text-transparent relative z-10"
            style={{
              backgroundImage: "linear-gradient(110deg, #f43f5e, #f59e0b, #fef08a, #22c55e, #38bdf8, #a855f7, #f43f5e)",
              backgroundSize: "240% 100%",
              filter: "drop-shadow(0 0 55px rgba(255,255,255,0.28))",
            }}
            initial={{ opacity: 0, scale: 0.6, rotateY: -70 }}
            animate={{ opacity: 1, scale: [0.6, 1.08, 1], rotateY: 0, backgroundPosition: ["0% 50%", "100% 50%"] }}
            exit={{ opacity: 0, scale: 1.35, rotateY: 70 }}
            transition={{ duration: 0.65 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const SmokeRevealCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1"], 1150);
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden bg-slate-950/20">
      <SmokeLayer />
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current} className="text-[12rem] md:text-[16rem] font-black relative z-10"
            style={{
              background: "linear-gradient(to bottom, #f8fafc, #94a3b8, #334155)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 55px rgba(226,232,240,0.45))",
            }}
            initial={{ opacity: 0, scale: 1.35, filter: "blur(24px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.85, filter: "blur(18px)" }}
            transition={{ duration: 0.75 }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfettiLaunchCountdown: React.FC<EffectProps> = () => {
  const { current, done } = useCountdownSeq(["3", "2", "1", "GO!"], 800);
  const isGo = current === "GO!";
  return (
    <div className="flex items-center justify-center h-full relative overflow-hidden">
      {isGo && <><ConfettiCanvas /><ScreenFlash color="hsl(50,95%,60%)" /></>}
      <AnimatePresence mode="wait">
        {!done && (
          <motion.h1 key={current}
            className={`font-black relative z-30 ${isGo ? "text-[10rem] md:text-[14rem]" : "text-[12rem] md:text-[16rem]"}`}
            style={{
              color: isGo ? "#fef08a" : "#ffffff",
              textShadow: isGo ? "0 0 80px rgba(250,204,21,0.95), 0 0 120px rgba(34,197,94,0.5)" : "0 0 55px rgba(168,85,247,0.65)",
            }}
            initial={{ opacity: 0, scale: 0.1, y: 80 }}
            animate={{ opacity: 1, scale: [0.1, 1.22, 1], y: 0 }}
            exit={{ opacity: 0, scale: 1.8, y: -80 }}
            transition={{ duration: 0.42, ease: "easeOut" }}>
            {current}
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
};

type BingoVariant =
  | "classic" | "neon" | "confetti" | "jackpot" | "led"
  | "carnival" | "fire" | "ice" | "glitch" | "laser"
  | "starfield" | "matrix" | "vortex" | "smoke" | "prism"
  | "hologram" | "ripple" | "thunder" | "drumroll" | "ultimate";

interface BingoVisualConfig {
  accent: string;
  secondary: string;
  interval: number;
  stageClassName?: string;
  fontClassName?: string;
  textStyle: React.CSSProperties;
  finalStyle?: React.CSSProperties;
}

const BINGO_SEQUENCE = ["3", "2", "1", "B", "I", "N", "G", "O", "BINGO"];
const BINGO_LETTERS = ["B", "I", "N", "G", "O"];

const bingoVisuals: Record<BingoVariant, BingoVisualConfig> = {
  classic: {
    accent: "#facc15",
    secondary: "#22c55e",
    interval: 650,
    textStyle: { color: "#f8fafc", textShadow: "0 0 70px rgba(250,204,21,0.6)" },
    finalStyle: { color: "#facc15", textShadow: "0 0 90px rgba(250,204,21,0.95), 0 0 150px rgba(34,197,94,0.35)" },
  },
  neon: {
    accent: "#22d3ee",
    secondary: "#ec4899",
    interval: 620,
    textStyle: { color: "#a5f3fc", textShadow: "0 0 45px rgba(34,211,238,0.95), 0 0 100px rgba(236,72,153,0.35)" },
    finalStyle: { color: "#f0f9ff", textShadow: "0 0 75px rgba(34,211,238,1), 0 0 140px rgba(236,72,153,0.55)" },
  },
  confetti: {
    accent: "#f59e0b",
    secondary: "#22c55e",
    interval: 600,
    textStyle: { color: "#ffffff", textShadow: "0 0 60px rgba(168,85,247,0.65)" },
    finalStyle: { color: "#fef08a", textShadow: "0 0 95px rgba(250,204,21,1), 0 0 140px rgba(34,197,94,0.45)" },
  },
  jackpot: {
    accent: "#fbbf24",
    secondary: "#ef4444",
    interval: 700,
    textStyle: { color: "#fde68a", textShadow: "0 0 55px rgba(251,191,36,0.8)" },
    finalStyle: { color: "#fef3c7", textShadow: "0 0 90px rgba(251,191,36,1), 0 0 130px rgba(239,68,68,0.45)" },
  },
  led: {
    accent: "#ef4444",
    secondary: "#f97316",
    interval: 620,
    fontClassName: "font-mono",
    textStyle: { color: "#f87171", textShadow: "0 0 45px rgba(239,68,68,0.95)", letterSpacing: "0.08em" },
    finalStyle: { color: "#fb7185", textShadow: "0 0 85px rgba(244,63,94,1), 0 0 130px rgba(249,115,22,0.45)" },
  },
  carnival: {
    accent: "#ec4899",
    secondary: "#38bdf8",
    interval: 620,
    textStyle: { color: "#fdf2f8", textShadow: "0 0 65px rgba(236,72,153,0.85), 0 0 100px rgba(56,189,248,0.35)" },
    finalStyle: { color: "#ffffff", textShadow: "0 0 80px rgba(236,72,153,1), 0 0 130px rgba(250,204,21,0.55)" },
  },
  fire: {
    accent: "#f97316",
    secondary: "#ef4444",
    interval: 620,
    textStyle: {
      background: "linear-gradient(to top, #f59e0b, #ef4444, #fef3c7)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 0 50px rgba(249,115,22,0.75))",
    },
    finalStyle: { filter: "drop-shadow(0 0 90px rgba(239,68,68,0.9))" },
  },
  ice: {
    accent: "#67e8f9",
    secondary: "#60a5fa",
    interval: 660,
    textStyle: {
      background: "linear-gradient(to bottom, #ecfeff, #67e8f9, #60a5fa)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 0 55px rgba(96,165,250,0.75))",
    },
    finalStyle: { filter: "drop-shadow(0 0 95px rgba(103,232,249,0.9))" },
  },
  glitch: {
    accent: "#22d3ee",
    secondary: "#f472b6",
    interval: 560,
    fontClassName: "font-mono",
    textStyle: { color: "#f8fafc", textShadow: "0 0 35px rgba(248,250,252,0.45)" },
    finalStyle: { color: "#ffffff", textShadow: "0 0 80px rgba(34,211,238,0.9), 0 0 110px rgba(244,114,182,0.55)" },
  },
  laser: {
    accent: "#f43f5e",
    secondary: "#22d3ee",
    interval: 580,
    textStyle: { color: "#f8fafc", textShadow: "0 0 50px rgba(34,211,238,0.75), 0 0 90px rgba(244,63,94,0.4)" },
    finalStyle: { color: "#fecdd3", textShadow: "0 0 90px rgba(244,63,94,0.95), 0 0 120px rgba(34,211,238,0.5)" },
  },
  starfield: {
    accent: "#fde68a",
    secondary: "#93c5fd",
    interval: 560,
    stageClassName: "bg-slate-950",
    textStyle: { color: "#dbeafe", textShadow: "0 0 70px rgba(147,197,253,0.85)" },
    finalStyle: { color: "#fde68a", textShadow: "0 0 100px rgba(253,230,138,0.95), 0 0 130px rgba(147,197,253,0.45)" },
  },
  matrix: {
    accent: "#22c55e",
    secondary: "#86efac",
    interval: 560,
    fontClassName: "font-mono",
    textStyle: { color: "#bbf7d0", textShadow: "0 0 45px rgba(34,197,94,0.95), 0 0 90px rgba(34,197,94,0.45)" },
    finalStyle: { color: "#dcfce7", textShadow: "0 0 95px rgba(134,239,172,1), 0 0 150px rgba(34,197,94,0.55)" },
  },
  vortex: {
    accent: "#a855f7",
    secondary: "#22d3ee",
    interval: 610,
    textStyle: { color: "#e9d5ff", textShadow: "0 0 70px rgba(168,85,247,0.85), 0 0 100px rgba(34,211,238,0.35)" },
    finalStyle: { color: "#f5f3ff", textShadow: "0 0 105px rgba(168,85,247,0.95), 0 0 150px rgba(34,211,238,0.45)" },
  },
  smoke: {
    accent: "#cbd5e1",
    secondary: "#94a3b8",
    interval: 680,
    textStyle: {
      background: "linear-gradient(to bottom, #f8fafc, #cbd5e1, #64748b)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 0 55px rgba(226,232,240,0.55))",
    },
    finalStyle: { filter: "drop-shadow(0 0 95px rgba(226,232,240,0.75))" },
  },
  prism: {
    accent: "#38bdf8",
    secondary: "#f43f5e",
    interval: 620,
    textStyle: {
      background: "linear-gradient(110deg, #f43f5e, #f59e0b, #fef08a, #22c55e, #38bdf8, #a855f7)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 0 55px rgba(255,255,255,0.32))",
    },
    finalStyle: { filter: "drop-shadow(0 0 95px rgba(255,255,255,0.45))" },
  },
  hologram: {
    accent: "#7dd3fc",
    secondary: "#c084fc",
    interval: 640,
    textStyle: {
      color: "transparent",
      WebkitTextStroke: "3px rgba(125,211,252,0.95)",
      textShadow: "0 0 45px rgba(125,211,252,0.85), 0 0 90px rgba(192,132,252,0.35)",
    },
    finalStyle: { WebkitTextStroke: "3px rgba(240,249,255,0.98)", textShadow: "0 0 90px rgba(125,211,252,1), 0 0 130px rgba(192,132,252,0.55)" },
  },
  ripple: {
    accent: "#38bdf8",
    secondary: "#0ea5e9",
    interval: 650,
    textStyle: { color: "#e0f2fe", textShadow: "0 0 70px rgba(56,189,248,0.85)" },
    finalStyle: { color: "#f0f9ff", textShadow: "0 0 105px rgba(56,189,248,0.95), 0 0 150px rgba(14,165,233,0.45)" },
  },
  thunder: {
    accent: "#fef08a",
    secondary: "#60a5fa",
    interval: 560,
    textStyle: { color: "#eff6ff", textShadow: "0 0 60px rgba(96,165,250,0.85)" },
    finalStyle: { color: "#fef08a", textShadow: "0 0 100px rgba(254,240,138,1), 0 0 140px rgba(96,165,250,0.55)" },
  },
  drumroll: {
    accent: "#fb7185",
    secondary: "#facc15",
    interval: 520,
    textStyle: { color: "#fff1f2", textShadow: "0 0 60px rgba(251,113,133,0.85)" },
    finalStyle: { color: "#fef3c7", textShadow: "0 0 95px rgba(251,113,133,0.95), 0 0 140px rgba(250,204,21,0.55)" },
  },
  ultimate: {
    accent: "#facc15",
    secondary: "#22c55e",
    interval: 560,
    textStyle: { color: "#ffffff", textShadow: "0 0 70px rgba(168,85,247,0.85), 0 0 120px rgba(34,211,238,0.45)" },
    finalStyle: { color: "#fef08a", textShadow: "0 0 110px rgba(250,204,21,1), 0 0 160px rgba(34,197,94,0.65)" },
  },
};

function useBingoSeq(interval: number) {
  const { current, idx, done } = useCountdownSeq(BINGO_SEQUENCE, interval);
  const formedCount = idx < 3 ? 0 : Math.min(BINGO_LETTERS.length, idx - 2);
  return {
    current,
    idx,
    done,
    formedCount,
    isFinal: current === "BINGO",
    isCountdown: idx < 3,
  };
}

const BingoStageLights: React.FC<{ accent: string; secondary: string }> = ({ accent, secondary }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute left-1/2 top-1/2 h-2 w-[70vw] origin-left"
        style={{
          rotate: `${i * 22.5 - 80}deg`,
          background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? accent : secondary}66, transparent)`,
        }}
        animate={{ opacity: [0.05, 0.7, 0.05], scaleX: [0.45, 1, 0.45] }}
        transition={{ duration: 1.4, delay: i * 0.07, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const BingoLaserGrid: React.FC<{ accent: string; secondary: string }> = ({ accent, secondary }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 11 }).map((_, i) => (
      <motion.div
        key={`h-${i}`}
        className="absolute left-0 right-0 h-px"
        style={{ top: `${10 + i * 8}%`, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        animate={{ opacity: [0.12, 0.7, 0.12], x: ["-7%", "7%", "-7%"] }}
        transition={{ duration: 1.3, delay: i * 0.04, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
    {Array.from({ length: 9 }).map((_, i) => (
      <motion.div
        key={`v-${i}`}
        className="absolute top-0 bottom-0 w-px"
        style={{ left: `${10 + i * 10}%`, background: `linear-gradient(180deg, transparent, ${secondary}, transparent)` }}
        animate={{ opacity: [0.08, 0.5, 0.08], y: ["-5%", "5%", "-5%"] }}
        transition={{ duration: 1.5, delay: i * 0.05, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const BingoRings: React.FC<{ idx: number; accent: string; secondary: string; spin?: boolean }> = ({
  idx,
  accent,
  secondary,
  spin,
}) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {Array.from({ length: 7 }).map((_, i) => (
      <motion.div
        key={`${idx}-${i}`}
        className="absolute rounded-full border"
        style={{
          width: 160 + i * 58,
          height: 160 + i * 58,
          borderColor: i % 2 === 0 ? `${accent}82` : `${secondary}66`,
          boxShadow: `0 0 26px ${i % 2 === 0 ? accent : secondary}44`,
        }}
        initial={{ opacity: 0, scale: spin ? 1.35 : 0.35, rotate: i * 18 }}
        animate={{ opacity: [0, 0.75, 0], scale: spin ? [1.35, 0.72, 1.05] : [0.35, 1.45], rotate: spin ? i * 18 + 260 : i * 12 }}
        transition={{ duration: 0.95, delay: i * 0.06, ease: "easeOut" }}
      />
    ))}
  </div>
);

const BingoDrumBars: React.FC<{ accent: string; secondary: string }> = ({ accent, secondary }) => (
  <div className="absolute inset-x-8 top-1/2 z-0 flex -translate-y-1/2 justify-between pointer-events-none">
    {Array.from({ length: 14 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-2 rounded-full"
        style={{ backgroundColor: i % 2 === 0 ? accent : secondary, boxShadow: `0 0 22px ${i % 2 === 0 ? accent : secondary}` }}
        animate={{ height: [45, 130, 65, 170, 45], opacity: [0.25, 0.85, 0.45, 0.95, 0.25] }}
        transition={{ duration: 0.8, delay: i * 0.035, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const BingoThunder: React.FC<{ idx: number; accent: string; isFinal: boolean }> = ({ idx, accent, isFinal }) => (
  <div className="absolute inset-0 pointer-events-none">
    {isFinal && <ScreenFlash color="hsl(52,95%,65%)" />}
    {Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={`${idx}-${i}`}
        className="absolute h-1 origin-left"
        style={{
          left: `${12 + i * 18}%`,
          top: `${18 + ((i * 17) % 48)}%`,
          width: `${18 + i * 6}%`,
          rotate: `${i % 2 === 0 ? 28 : -34}deg`,
          background: `linear-gradient(90deg, transparent, ${accent}, white, transparent)`,
          boxShadow: `0 0 28px ${accent}`,
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 1, 0], scaleX: [0, 1, 0.3] }}
        transition={{ duration: 0.35, delay: i * 0.08 }}
      />
    ))}
  </div>
);

const renderBingoLayer = (variant: BingoVariant, idx: number, isFinal: boolean, config: BingoVisualConfig) => {
  switch (variant) {
    case "classic":
      return <Shockwave key={`classic-${idx}`} color={config.accent} />;
    case "neon":
      return <><BingoRings idx={idx} accent={config.accent} secondary={config.secondary} /><BingoLaserGrid accent={config.secondary} secondary={config.accent} /></>;
    case "confetti":
      return <>{isFinal && <><ConfettiCanvas count={170} /><ScreenFlash color="hsl(50,95%,60%)" /></>}<ParticleCanvas key={idx} color={config.accent} count={35} duration={700} burst={false} /></>;
    case "jackpot":
      return <><BingoStageLights accent={config.accent} secondary={config.secondary} />{isFinal && <ParticleCanvas color={config.accent} count={120} duration={1500} />}</>;
    case "led":
      return <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${config.accent} 1px, transparent 1px)`, backgroundSize: "18px 18px" }} />;
    case "carnival":
      return <><BingoStageLights accent={config.accent} secondary={config.secondary} />{isFinal && <ConfettiCanvas count={110} />}</>;
    case "fire":
      return <><ParticleCanvas key={idx} color={config.accent} count={70} duration={900} />{isFinal && <ScreenFlash color="hsl(18,95%,55%)" />}</>;
    case "ice":
      return <><BingoRings idx={idx} accent={config.accent} secondary={config.secondary} />{isFinal && <ScreenFlash color="hsl(190,95%,80%)" />}</>;
    case "glitch":
      return <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(34,211,238,0.3) 6px, transparent 8px)" }} />;
    case "laser":
      return <BingoLaserGrid accent={config.accent} secondary={config.secondary} />;
    case "starfield":
      return <><StarfieldCanvas color={isFinal ? config.accent : config.secondary} count={isFinal ? 280 : 180} />{isFinal && <ScreenFlash color="hsl(45,95%,70%)" />}</>;
    case "matrix":
      return <MatrixRainCanvas color={isFinal ? config.secondary : config.accent} opacity={isFinal ? 1 : 0.75} />;
    case "vortex":
      return <BingoRings idx={idx} accent={config.accent} secondary={config.secondary} spin />;
    case "smoke":
      return <SmokeLayer />;
    case "prism":
      return <BingoStageLights accent={config.accent} secondary={config.secondary} />;
    case "hologram":
      return <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(125,211,252,0.24) 9px, transparent 11px)" }} />;
    case "ripple":
      return <BingoRings idx={idx} accent={config.accent} secondary={config.secondary} />;
    case "thunder":
      return <BingoThunder idx={idx} accent={config.accent} isFinal={isFinal} />;
    case "drumroll":
      return <BingoDrumBars accent={config.accent} secondary={config.secondary} />;
    case "ultimate":
      return <><BingoStageLights accent={config.accent} secondary={config.secondary} /><BingoRings idx={idx} accent={config.accent} secondary={config.secondary} spin /><ParticleCanvas key={idx} color={isFinal ? config.secondary : config.accent} count={isFinal ? 120 : 60} duration={1000} />{isFinal && <><ConfettiCanvas count={190} /><ScreenFlash color="hsl(50,95%,60%)" /></>}</>;
    default:
      return null;
  }
};

const renderBingoTextOverlays = (variant: BingoVariant, display: string, className: string) => {
  if (variant === "glitch") {
    return (
      <>
        <motion.h1 className={`${className} absolute text-cyan-300 opacity-50`} style={{ clipPath: "inset(0 0 55% 0)" }}
          animate={{ x: [-10, 8, -4, 0], y: [4, -3, 0] }} transition={{ duration: 0.26 }}>
          {display}
        </motion.h1>
        <motion.h1 className={`${className} absolute text-pink-400 opacity-45`} style={{ clipPath: "inset(55% 0 0 0)" }}
          animate={{ x: [10, -8, 4, 0], y: [-4, 3, 0] }} transition={{ duration: 0.26 }}>
          {display}
        </motion.h1>
      </>
    );
  }

  if (variant === "hologram") {
    return (
      <>
        <span className={`${className} absolute text-sky-300 opacity-30`} style={{ clipPath: "inset(0 0 58% 0)" }}>{display}</span>
        <span className={`${className} absolute text-fuchsia-300 opacity-25`} style={{ clipPath: "inset(58% 0 0 0)", transform: "translateX(-8px)" }}>{display}</span>
      </>
    );
  }

  return null;
};

interface BingoMainProps {
  variant: BingoVariant;
  current: string;
  idx: number;
  formedCount: number;
  isFinal: boolean;
  isCountdown: boolean;
  display: string;
  config: BingoVisualConfig;
  textClassName: string;
  textStyle: React.CSSProperties;
}

const BingoBallMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  display,
  config,
}) => (
  <div className="relative z-30 flex h-full w-full flex-col items-center justify-center gap-6 px-4 pb-2 md:gap-8">
    <motion.div
      key={`ball-${idx}`}
      className={`relative flex items-center justify-center rounded-full border-4 bg-white font-black text-slate-950 shadow-2xl ${isFinal ? "h-48 w-48 text-5xl md:h-72 md:w-72 md:text-7xl" : "h-40 w-40 text-8xl md:h-64 md:w-64 md:text-[10rem]"}`}
      style={{
        borderColor: config.accent,
        boxShadow: `0 0 70px ${config.accent}99, inset 0 -28px 45px rgba(15,23,42,0.2)`,
        background: `radial-gradient(circle at 32% 25%, #ffffff, #f8fafc 42%, ${config.accent}22 70%, #cbd5e1)`,
      }}
      initial={{ opacity: 0, y: -220, rotate: -280, scale: 0.4 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: [0.4, 1.12, 1] }}
      exit={{ opacity: 0, y: 180, rotate: 180 }}
      transition={{ duration: 0.55, ease: "easeOut" }}>
      <span className={isFinal ? "text-4xl md:text-6xl" : ""}>{isFinal ? "BINGO" : current}</span>
      <div className="absolute inset-4 rounded-full border border-slate-900/10" />
    </motion.div>
    {isFinal && <ConfettiCanvas count={140} />}
  </div>
);

const bingoCardCells = [
  "07", "19", "33", "48", "62",
  "12", "24", "FREE", "55", "70",
  "03", "29", "41", "52", "66",
  "15", "20", "37", "59", "73",
  "10", "26", "44", "57", "68",
];
const bingoCardMarks = [0, 6, 12, 18, 24];

const BingoCardMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  isCountdown,
  config,
}) => (
  <div className="relative z-30 grid h-full w-full place-items-center px-4 py-6">
    <motion.div
      key={`card-shell-${idx}`}
      className="relative w-[min(78vw,500px)] rounded-lg border border-white/20 bg-slate-950/80 p-4 shadow-2xl"
      style={{ boxShadow: `0 0 70px ${config.accent}55` }}
      initial={{ opacity: 0, rotateX: 55, y: 80 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.45 }}>
      <div className={`grid grid-cols-5 gap-2 pb-3 ${isFinal ? "opacity-0" : ""}`}>
        {BINGO_LETTERS.map((letter, i) => {
          const active = i === formedCount - 1;
          return (
            <div key={letter} className="rounded-md py-2 text-center text-2xl font-black md:text-4xl"
              style={{ color: active ? config.accent : "rgba(148,163,184,0.45)", textShadow: active ? `0 0 22px ${config.accent}` : "none" }}>
              {letter}
            </div>
          );
        })}
      </div>
      <div className={`grid grid-cols-5 gap-2 ${isFinal ? "opacity-20" : ""}`}>
        {bingoCardCells.map((cell, i) => {
          const markIndex = bingoCardMarks.indexOf(i);
          const marked = cell === "FREE" || isFinal || (markIndex >= 0 && markIndex === formedCount - 1);
          return (
            <motion.div
              key={`${cell}-${i}`}
              className="relative grid aspect-square place-items-center rounded-md border text-sm font-black md:text-xl"
              style={{
                borderColor: marked ? config.accent : "rgba(148,163,184,0.2)",
                color: marked ? "#f8fafc" : "rgba(203,213,225,0.64)",
                background: marked ? `${config.accent}33` : "rgba(15,23,42,0.72)",
              }}
              animate={{ scale: marked && markIndex === formedCount - 1 ? [1, 1.14, 1] : 1 }}
              transition={{ duration: 0.28 }}>
              {cell}
              {marked && <span className="absolute h-8 w-8 rounded-full border-4 border-current opacity-80 md:h-12 md:w-12" />}
            </motion.div>
          );
        })}
      </div>
      {!isFinal && <motion.div
        key={`caller-${idx}`}
        className="absolute right-2 top-2 grid h-16 w-16 place-items-center rounded-full border-4 bg-white text-3xl font-black text-slate-950 md:h-24 md:w-24 md:text-5xl"
        style={{ borderColor: config.secondary, boxShadow: `0 0 40px ${config.secondary}88` }}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: [0, 1.14, 1], rotate: 0 }}
        transition={{ duration: 0.36 }}>
        {current}
      </motion.div>}
      {isFinal && (
        <motion.div className="absolute inset-0 grid place-items-center rounded-lg bg-slate-950/30"
          initial={{ opacity: 0, scale: 1.6, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ duration: 0.45 }}>
          <span className="rounded-lg border-4 px-6 py-2 text-5xl font-black md:text-8xl"
            style={{ borderColor: config.accent, color: config.accent, textShadow: `0 0 42px ${config.accent}` }}>
            BINGO
          </span>
        </motion.div>
      )}
      {!isFinal && isCountdown && <div className="absolute -bottom-8 left-1/2 h-2 w-32 -translate-x-1/2 rounded-full" style={{ backgroundColor: config.accent, boxShadow: `0 0 24px ${config.accent}` }} />}
    </motion.div>
  </div>
);

const BingoSlotMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  isCountdown,
  config,
}) => (
  <div className="relative z-30 flex h-full w-full flex-col items-center justify-center gap-6 px-4 md:gap-8">
    <div className="relative rounded-lg border border-yellow-300/50 bg-slate-950/85 p-4 shadow-2xl md:p-6"
      style={{ boxShadow: `0 0 80px ${config.accent}66, inset 0 0 30px rgba(251,191,36,0.16)` }}>
      <div className="absolute -inset-3 rounded-xl border border-yellow-200/20" />
      <div className={`flex gap-2 md:gap-4 ${isFinal ? "opacity-0" : ""}`}>
        {BINGO_LETTERS.map((letter, i) => {
          const active = i === formedCount - 1;
          return (
            <motion.div
              key={letter}
              className="grid h-24 w-16 place-items-center overflow-hidden rounded-md border bg-gradient-to-b from-slate-800 to-slate-950 text-5xl font-black md:h-36 md:w-24 md:text-7xl"
              style={{ borderColor: active ? config.accent : "rgba(148,163,184,0.25)", color: active ? config.accent : "rgba(148,163,184,0.28)" }}
              animate={{ y: active && i === formedCount - 1 ? [-90, 8, 0] : 0, rotateX: active ? [90, 0] : 0 }}
              transition={{ duration: 0.45 }}>
              {active ? letter : "?"}
            </motion.div>
          );
        })}
      </div>
      {!isFinal && <motion.div
        key={`slot-call-${idx}`}
        className="mx-auto mt-5 grid h-16 w-28 place-items-center rounded-md border text-4xl font-black md:h-20 md:w-36 md:text-6xl"
        style={{ borderColor: config.secondary, color: "#fff7ed", backgroundColor: `${config.secondary}22`, textShadow: `0 0 28px ${config.secondary}` }}
        initial={{ opacity: 0, y: isCountdown ? -40 : 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}>
        {current}
      </motion.div>}
      {isFinal && (
        <motion.div
          className="absolute inset-0 grid place-items-center text-[5rem] font-black leading-none text-yellow-200 md:text-[9rem]"
          style={{ textShadow: `0 0 70px ${config.accent}, 0 0 120px ${config.secondary}` }}
          initial={{ opacity: 0, scale: 0.35 }}
          animate={{ opacity: 1, scale: [0.35, 1.12, 1] }}
          transition={{ duration: 0.45 }}>
          BINGO
        </motion.div>
      )}
    </div>
    {isFinal && <ParticleCanvas color={config.accent} count={130} duration={1600} />}
  </div>
);

const BingoMarqueeMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  isCountdown,
  config,
}) => (
  <div className="relative z-30 flex h-full w-full flex-col items-center justify-center px-4">
    <motion.div
      className="relative w-[min(86vw,760px)] rounded-lg border-4 px-5 py-8 md:px-8 md:py-12"
      style={{ borderColor: config.accent, background: "linear-gradient(180deg, rgba(76,29,149,0.7), rgba(15,23,42,0.92))", boxShadow: `0 0 90px ${config.accent}77` }}
      initial={{ opacity: 0, scale: 0.75, rotateZ: -3 }}
      animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
      transition={{ duration: 0.45 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-3 w-3 rounded-full md:h-4 md:w-4"
          style={{
            left: i < 10 ? `${6 + i * 9.8}%` : i < 20 ? i === 10 ? "3%" : i === 19 ? "95%" : undefined : `${6 + (i - 20) * 9.8}%`,
            top: i < 10 ? "-0.55rem" : i < 20 ? `${4 + (i - 10) * 9.8}%` : undefined,
            bottom: i >= 20 ? "-0.55rem" : undefined,
            right: i >= 10 && i < 20 && i % 2 === 1 ? "-0.55rem" : undefined,
            backgroundColor: i % 2 === 0 ? config.accent : config.secondary,
            boxShadow: `0 0 20px ${i % 2 === 0 ? config.accent : config.secondary}`,
          }}
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.85, delay: i * 0.035, repeat: Infinity }}
        />
      ))}
      <motion.div
        key={`marquee-${idx}`}
        className="grid min-h-40 place-items-center text-7xl font-black md:min-h-56 md:text-9xl"
        style={{ color: isFinal ? config.accent : "#ffffff", textShadow: `0 0 55px ${isFinal ? config.accent : config.secondary}` }}
        initial={{ opacity: 0, y: isCountdown ? -70 : 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}>
        {isFinal ? "BINGO" : current}
      </motion.div>
    </motion.div>
  </div>
);

const BingoDropMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  isCountdown,
  config,
  textStyle,
}) => (
  <div className="relative z-30 flex h-full w-full flex-col items-center justify-center gap-6 px-4 md:gap-10">
    <motion.h1
      key={`drop-${idx}`}
      className={`${isFinal ? "text-[4.8rem] md:text-[9rem]" : "text-[9rem] md:text-[13rem]"} font-black leading-none`}
      style={textStyle}
      initial={{ opacity: 0, y: isCountdown ? -90 : 90, scale: isFinal ? 0.6 : 1.35 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.42 }}>
      {isFinal ? "BINGO" : current}
    </motion.h1>
  </div>
);

const BingoOrbitMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  display,
  config,
  textStyle,
}) => (
  <div className="relative z-30 grid h-full w-full place-items-center overflow-visible px-4">
    <motion.div
      key={`orbit-${idx}`}
      className="relative grid h-[min(70vw,64vh,500px)] w-[min(70vw,64vh,500px)] place-items-center rounded-full border"
      style={{ borderColor: `${config.accent}66`, boxShadow: `0 0 80px ${config.accent}55, inset 0 0 60px ${config.secondary}22` }}
      initial={{ opacity: 0, scale: 0.65, rotate: -90 }}
      animate={{ opacity: 1, scale: 1, rotate: isFinal ? 360 : 0 }}
      transition={{ duration: isFinal ? 0.8 : 0.45 }}>
      {!isFinal && BINGO_LETTERS.map((letter, i) => {
        const angle = (Math.PI * 2 * i) / BINGO_LETTERS.length - Math.PI / 2;
        const x = Math.cos(angle) * 175;
        const y = Math.sin(angle) * 175;
        const active = i === formedCount - 1;
        return (
          <motion.div
            key={letter}
            className="absolute grid h-14 w-14 place-items-center rounded-full border text-3xl font-black md:h-20 md:w-20 md:text-5xl"
            style={{ borderColor: active ? config.accent : `${config.secondary}66`, color: active ? "#ffffff" : "rgba(203,213,225,0.4)", backgroundColor: active ? `${config.accent}33` : "rgba(15,23,42,0.72)", boxShadow: active ? `0 0 34px ${config.accent}` : `0 0 18px ${config.secondary}44` }}
            animate={{ x: isFinal ? 0 : x, y: isFinal ? 0 : y, scale: active ? [1, 1.14, 1] : 0.9, rotate: isFinal ? [0, 30, 0] : 0 }}
            transition={{ duration: isFinal ? 0.65 : 0.35, delay: isFinal ? i * 0.05 : 0 }}>
            {active ? letter : ""}
          </motion.div>
        );
      })}
      <motion.h1
        className={`${isFinal ? "text-[4.5rem] md:text-[8rem]" : "text-[8rem] md:text-[12rem]"} font-black leading-none`}
        style={textStyle}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: [0.4, 1.1, 1] }}
        transition={{ duration: 0.45 }}>
        {isFinal ? "BINGO" : display}
      </motion.h1>
      {!isFinal && <div className="absolute bottom-8 text-4xl font-black" style={{ color: config.accent }}>{current}</div>}
    </motion.div>
  </div>
);

const BingoScannerMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  variant,
  config,
  textStyle,
  textClassName,
}) => (
  <div className="relative z-30 grid h-full w-full place-items-center px-4">
    <motion.div
      key={`scanner-${idx}`}
      className="relative w-[min(88vw,760px)] overflow-hidden rounded-lg border bg-slate-950/80 p-5 md:p-8"
      style={{ borderColor: config.accent, boxShadow: `0 0 75px ${config.accent}55` }}
      initial={{ opacity: 0, skewX: -8, scaleX: 0.65 }}
      animate={{ opacity: 1, skewX: 0, scaleX: 1 }}
      transition={{ duration: 0.38 }}>
      <motion.div className="absolute inset-x-0 top-0 h-24"
        style={{ background: `linear-gradient(180deg, transparent, ${config.accent}44, transparent)` }}
        animate={{ y: ["-30%", "330%"] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} />
      <div className="relative z-10 grid min-h-64 place-items-center">
        {renderBingoTextOverlays(variant, isFinal ? "BINGO" : current, textClassName)}
        <h1 className={`${isFinal ? "text-[4.5rem] md:text-[8rem]" : "text-[8rem] md:text-[12rem]"} ${variant === "matrix" ? "font-mono" : ""} font-black leading-none`} style={textStyle}>
          {isFinal ? "BINGO" : current}
        </h1>
      </div>
    </motion.div>
  </div>
);

const BingoStampMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  isCountdown,
  config,
  textStyle,
}) => (
  <div className="relative z-30 grid h-full w-full place-items-center px-4">
    <div className="flex flex-col items-center gap-10">
      <motion.div
        key={`stamp-${idx}`}
        className="relative grid place-items-center"
        initial={{ opacity: 0, scale: isFinal ? 2.2 : 0.65, rotate: isFinal ? -24 : 0 }}
        animate={{ opacity: 1, scale: isFinal ? [2.2, 0.88, 1] : 1, rotate: isFinal ? [-24, -9, -12] : 0 }}
        transition={{ duration: isFinal ? 0.52 : 0.36, ease: "easeOut" }}>
        {isFinal ? (
          <div className="rounded-lg border-8 px-7 py-3 text-[4.8rem] font-black leading-none md:px-12 md:text-[9rem]"
            style={{ borderColor: config.accent, color: config.accent, textShadow: `0 0 55px ${config.accent}`, boxShadow: `0 0 55px ${config.accent}55` }}>
            BINGO
          </div>
        ) : (
          <h1 className={`${isCountdown ? "text-[11rem] md:text-[15rem]" : "text-[9rem] md:text-[13rem]"} font-black leading-none`} style={textStyle}>{current}</h1>
        )}
      </motion.div>
    </div>
  </div>
);

const BingoDrumMain: React.FC<BingoMainProps> = ({
  current,
  idx,
  formedCount,
  isFinal,
  config,
  textStyle,
}) => (
  <div className="relative z-30 flex h-full w-full flex-col items-center justify-center gap-6 px-4 md:gap-8">
    <BingoDrumBars accent={config.accent} secondary={config.secondary} />
    <motion.div
      key={`drum-main-${idx}`}
      className="relative grid h-48 w-48 place-items-center rounded-full border-8 bg-slate-950/85 text-center md:h-72 md:w-72"
      style={{ borderColor: config.accent, boxShadow: `0 0 80px ${config.accent}66` }}
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: 1, scale: [0.2, 1.15, 0.96, 1] }}
      transition={{ duration: 0.5 }}>
      <h1 className={`${isFinal ? "text-5xl md:text-7xl" : "text-8xl md:text-[10rem]"} font-black leading-none`} style={textStyle}>
        {isFinal ? "BINGO" : current}
      </h1>
    </motion.div>
  </div>
);

const renderBingoMain = (props: BingoMainProps) => {
  switch (props.variant) {
    case "classic":
    case "confetti":
      return <BingoBallMain {...props} />;
    case "jackpot":
      return <BingoSlotMain {...props} />;
    case "led":
      return <BingoCardMain {...props} />;
    case "carnival":
    case "neon":
      return <BingoMarqueeMain {...props} />;
    case "fire":
    case "ice":
      return <BingoDropMain {...props} />;
    case "starfield":
    case "vortex":
    case "ripple":
      return <BingoOrbitMain {...props} />;
    case "glitch":
    case "laser":
    case "matrix":
    case "hologram":
      return <BingoScannerMain {...props} />;
    case "drumroll":
      return <BingoDrumMain {...props} />;
    case "smoke":
    case "prism":
    case "thunder":
    case "ultimate":
      return <BingoStampMain {...props} />;
    default:
      return null;
  }
};

const BingoEffect: React.FC<{ variant: BingoVariant }> = ({ variant }) => {
  const config = bingoVisuals[variant];
  const { current, idx, done, formedCount, isFinal, isCountdown } = useBingoSeq(config.interval);
  const display = isFinal ? "BINGO" : current;
  const textClassName = `${isFinal ? "text-[4.5rem] md:text-[8rem] xl:text-[10rem]" : "text-[10rem] md:text-[15rem]"} ${config.fontClassName || ""} font-black leading-none`;
  const textStyle = { ...config.textStyle, ...(isFinal ? config.finalStyle : {}) };
  const main = renderBingoMain({ variant, current, idx, formedCount, isFinal, isCountdown, display, config, textClassName, textStyle });

  return (
    <div className={`flex h-full items-center justify-center overflow-hidden relative ${config.stageClassName || ""}`}>
      {renderBingoLayer(variant, idx, isFinal, config)}
      <AnimatePresence mode="wait">{!done && main}</AnimatePresence>
    </div>
  );
};

const ClassicBingoBuild: React.FC<EffectProps> = () => <BingoEffect variant="classic" />;
const NeonBingo: React.FC<EffectProps> = () => <BingoEffect variant="neon" />;
const ConfettiBingo: React.FC<EffectProps> = () => <BingoEffect variant="confetti" />;
const JackpotBingo: React.FC<EffectProps> = () => <BingoEffect variant="jackpot" />;
const LEDBingoBoard: React.FC<EffectProps> = () => <BingoEffect variant="led" />;
const CarnivalBingo: React.FC<EffectProps> = () => <BingoEffect variant="carnival" />;
const FireBingo: React.FC<EffectProps> = () => <BingoEffect variant="fire" />;
const IceBingo: React.FC<EffectProps> = () => <BingoEffect variant="ice" />;
const GlitchBingo: React.FC<EffectProps> = () => <BingoEffect variant="glitch" />;
const LaserBingoGrid: React.FC<EffectProps> = () => <BingoEffect variant="laser" />;
const StarfieldBingo: React.FC<EffectProps> = () => <BingoEffect variant="starfield" />;
const MatrixBingo: React.FC<EffectProps> = () => <BingoEffect variant="matrix" />;
const VortexBingo: React.FC<EffectProps> = () => <BingoEffect variant="vortex" />;
const SmokeBingoReveal: React.FC<EffectProps> = () => <BingoEffect variant="smoke" />;
const PrismBingo: React.FC<EffectProps> = () => <BingoEffect variant="prism" />;
const HologramBingo: React.FC<EffectProps> = () => <BingoEffect variant="hologram" />;
const RippleBingo: React.FC<EffectProps> = () => <BingoEffect variant="ripple" />;
const ThunderBingo: React.FC<EffectProps> = () => <BingoEffect variant="thunder" />;
const DrumrollBingo: React.FC<EffectProps> = () => <BingoEffect variant="drumroll" />;
const UltimateBingo: React.FC<EffectProps> = () => <BingoEffect variant="ultimate" />;

const effectComponents: Record<number, React.FC<EffectProps>> = {
  1: ClassicCountdown, 2: CountdownWithGO, 3: ExplosionCountdown, 4: NeonCountdown,
  5: DigitalLEDCountdown, 6: GlitchCountdown, 7: PulseCountdown, 8: CircularCountdown,
  9: FireCountdown, 10: IceCountdown, 11: ShockwaveCountdown, 12: CinematicSlowCountdown,
  13: SpeedCountdown, 14: MassiveNumberSlam, 15: UltimateCountdown,
  16: LaserGridCountdown, 17: ChromaticSplitCountdown, 18: MatrixRainCountdown,
  19: VortexCountdown, 20: RippleCountdown, 21: StarfieldWarpCountdown,
  22: HologramCountdown, 23: PrismCountdown, 24: SmokeRevealCountdown,
  25: ConfettiLaunchCountdown,
  26: ClassicBingoBuild, 27: NeonBingo, 28: ConfettiBingo, 29: JackpotBingo,
  30: LEDBingoBoard, 31: CarnivalBingo, 32: FireBingo, 33: IceBingo,
  34: GlitchBingo, 35: LaserBingoGrid, 36: StarfieldBingo, 37: MatrixBingo,
  38: VortexBingo, 39: SmokeBingoReveal, 40: PrismBingo, 41: HologramBingo,
  42: RippleBingo, 43: ThunderBingo, 44: DrumrollBingo, 45: UltimateBingo,
};

export const getEffectComponent = (id: number): React.FC<EffectProps> | null => effectComponents[id] ?? null;
