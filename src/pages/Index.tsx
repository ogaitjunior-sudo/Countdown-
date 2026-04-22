import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";
import { getEffectComponent } from "@/effects/EffectRenderer";
import { downloadEffectVideo } from "@/effects/videoExport";
import { effects, categoryLabels, type EffectCategory, type EffectDef } from "@/effects/registry";

type FilterKey = EffectCategory | "all" | "favorites";
const filters: FilterKey[] = ["all", "countdown", "bingo", "favorites"];

// ─── Ambient Particle Background ───
const AmbientParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() > 0.5 ? 265 : 185,
    }));
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity})`;
        ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.15})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const Index: React.FC = () => {
  const [activeEffect, setActiveEffect] = useState<number | null>(null);
  const [effectKey, setEffectKey] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("fx-favs") || "[]")); } catch { return new Set(); }
  });
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectEffect = useCallback((id: number) => {
    setActiveEffect(id);
    setEffectKey(k => k + 1);
  }, []);
  const replay = useCallback(() => setEffectKey(k => k + 1), []);
  const clear = useCallback(() => setActiveEffect(null), []);
  const random = useCallback(() => {
    const id = effects[Math.floor(Math.random() * effects.length)].id;
    selectEffect(id);
  }, [selectEffect]);
  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("fx-favs", JSON.stringify([...next]));
      return next;
    });
  }, []);
  const downloadEffect = useCallback(async (effect: EffectDef) => {
    if (exportingId !== null) return;
    setExportingId(effect.id);
    setExportNotice("Gerando video em fundo branco...");
    try {
      const result = await downloadEffectVideo(effect);
      setExportNotice(result.mimeType.includes("mp4") ? "MP4 baixado em fundo branco" : "Video baixado em fundo branco");
    } catch (error) {
      setExportNotice(error instanceof Error ? error.message : "Nao foi possivel baixar o video.");
    } finally {
      setExportingId(null);
      window.setTimeout(() => setExportNotice(null), 4500);
    }
  }, [exportingId]);

  const filtered = effects.filter(e => {
    if (filter === "favorites") return favorites.has(e.id);
    if (filter !== "all" && e.category !== filter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<FilterKey, number> = {
    all: effects.length,
    countdown: effects.filter(e => e.category === "countdown").length,
    bingo: effects.filter(e => e.category === "bingo").length,
    favorites: favorites.size,
  };

  const activeEffectDef = activeEffect ? effects.find(e => e.id === activeEffect) : null;
  const activeName = activeEffectDef?.name ?? null;
  const EffectComponent = activeEffect ? getEffectComponent(activeEffect) : null;

  const categoryColor = (cat: EffectCategory) => {
    if (cat === "bingo") return "bg-accent/20 border-accent/40 text-accent";
    return "bg-secondary/20 border-secondary/40 text-secondary";
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <AmbientParticles />

      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px] bg-primary"
          animate={{ x: [0, 80, -50, 0], y: [0, -60, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "5%", left: "15%" }} />
        <motion.div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px] bg-secondary"
          animate={{ x: [0, -60, 40, 0], y: [0, 50, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "5%", right: "10%" }} />
        <motion.div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.05] blur-[100px] bg-neon-pink"
          animate={{ x: [0, 40, -30, 0], y: [0, -40, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "40%", left: "50%" }} />
      </div>

      {/* ─── FULLSCREEN STAGE ─── */}
      <div
        className="fixed left-0 z-10 flex items-center justify-center transition-[right] duration-300"
        style={{
          top: 56,
          bottom: 52,
          right: panelOpen ? "clamp(0px, calc(100vw - 760px), 360px)" : 0,
        }}
      >
        {/* HUD corners */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-2xl" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-primary/20 rounded-tr-2xl" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-primary/20 rounded-bl-2xl" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-primary/20 rounded-br-2xl" />
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 100% / 0.03) 2px, hsl(0 0% 100% / 0.03) 4px)" }} />

        <AnimatePresence mode="wait">
          {EffectComponent ? (
            <motion.div key={`${activeEffect}-${effectKey}`} className="w-full h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <EffectComponent />
            </motion.div>
          ) : (
            <motion.div key="empty" className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="text-[0px] font-black text-primary glow-text-primary" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="text-5xl">FX</span>
                🎬
              </motion.div>
              <p className="text-xl text-muted-foreground animate-pulse-glow">Select an effect to begin…</p>
              <p className="text-sm text-muted-foreground/50">or press 🎲 Random</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── TOP BAR ─── */}
      <div className="fixed top-0 left-0 right-0 z-30 px-4 md:px-6 py-2.5 flex items-center justify-between gap-3 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4">
          <h1 className="text-base md:text-lg font-bold text-foreground whitespace-nowrap">
            <span className="text-primary glow-text-primary">🎬</span> Gabriel Mendes - Countdown
          </h1>
          {activeName && (
            <motion.span key={activeName} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="hidden sm:inline-block text-sm px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-medium">
              ▶ {activeName}
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => activeEffectDef && downloadEffect(activeEffectDef)}
            disabled={!activeEffectDef || exportingId !== null}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Baixar o efeito selecionado em video com fundo branco"
          >
            <Download className="h-3.5 w-3.5" />
            {exportingId === activeEffect ? "Gerando..." : "MP4 Branco"}
          </button>
          <button onClick={replay} className="px-3 py-1.5 text-xs rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border/50 transition-all hover:border-primary/30">🔄 Replay</button>
          <button onClick={clear} className="px-3 py-1.5 text-xs rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border/50 transition-all hover:border-primary/30">✕ Clear</button>
          <button onClick={random} className="px-3 py-1.5 text-xs rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all glow-primary">🎲 Random</button>
          <button onClick={() => setPanelOpen(p => !p)}
            className="px-3 py-1.5 text-xs rounded-lg bg-muted/50 hover:bg-muted text-foreground border border-border/50 transition-all">
            {panelOpen ? "◀ Hide" : "▶ Effects"}
          </button>
        </div>
      </div>

      {/* ─── SIDE PANEL ─── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-12 right-0 bottom-0 w-[min(360px,100vw)] z-20 bg-background/80 backdrop-blur-2xl border-l border-border/50 overflow-hidden flex flex-col"
          >
            <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
              {/* Search */}
              <input type="text" placeholder="🔍 Search effects…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30" />

              {/* Filters */}
              <div className="flex gap-1.5 flex-wrap">
                {filters.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 text-[11px] rounded-full border transition-all ${
                      filter === f
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-muted/30 text-muted-foreground border-border/50 hover:bg-muted/60"
                    }`}>
                    {categoryLabels[f]} <span className="opacity-60">({counts[f]})</span>
                  </button>
                ))}
              </div>

              {/* Effect list */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
                {filtered.map((e, i) => (
                  <motion.button key={e.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ scale: 1.01, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectEffect(e.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      activeEffect === e.id
                        ? "border-primary/60 bg-primary/15 shadow-lg shadow-primary/10"
                        : "border-border/30 bg-card/30 hover:border-primary/20 hover:bg-card/50"
                    }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${categoryColor(e.category)}`}>
                            {e.category}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">#{e.id}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">{e.name}</p>
                        <p className="text-[11px] text-muted-foreground/70 truncate">{e.description}</p>
                      </div>
                      <button
                        onClick={ev => { ev.stopPropagation(); downloadEffect(e); }}
                        disabled={exportingId !== null}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-accent/25 bg-accent/10 text-accent transition-all hover:bg-accent/20 disabled:opacity-40"
                        title="Baixar MP4 individual com fundo branco"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={ev => { ev.stopPropagation(); toggleFavorite(e.id); }}
                        className="text-base shrink-0 hover:scale-125 transition-transform">
                        {favorites.has(e.id) ? "⭐" : "☆"}
                      </button>
                    </div>
                  </motion.button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-12 opacity-50">Nenhum efeito encontrado</p>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── BOTTOM STATUS ─── */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-1rem)]">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap px-4 py-2 rounded-full bg-background/60 backdrop-blur-xl border border-border/30 text-[11px] text-muted-foreground/60">
          <span>{effects.length} effects</span>
          <span className="w-px h-3 bg-border/50" />
          <span>⭐ {favorites.size} favorites</span>
          {exportNotice && <>
            <span className="w-px h-3 bg-border/50" />
            <span className="text-accent">{exportNotice}</span>
          </>}
          {activeName && <>
            <span className="w-px h-3 bg-border/50" />
            <span className="text-primary">▶ {activeName}</span>
          </>}
        </div>
      </div>
    </div>
  );
};

export default Index;
