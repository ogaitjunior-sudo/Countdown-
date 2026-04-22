export type EffectCategory = "countdown" | "bingo";

export interface EffectDef {
  id: number;
  name: string;
  category: EffectCategory;
  description: string;
}

export const effects: EffectDef[] = [
  { id: 1, name: "Classic Countdown", category: "countdown", description: "3→2→1 with scale and glow" },
  { id: 2, name: "Countdown with GO", category: "countdown", description: "3→2→1→GO with burst" },
  { id: 3, name: "Explosion Countdown", category: "countdown", description: "Numbers explode into particles" },
  { id: 4, name: "Neon Countdown", category: "countdown", description: "Neon tubing numbers" },
  { id: 5, name: "Digital LED Countdown", category: "countdown", description: "LED scoreboard style" },
  { id: 6, name: "Glitch Countdown", category: "countdown", description: "Digital glitch distortion" },
  { id: 7, name: "Pulse Countdown", category: "countdown", description: "Increasing tension pulses" },
  { id: 8, name: "Circular Countdown", category: "countdown", description: "Ring progress around numbers" },
  { id: 9, name: "Fire Countdown", category: "countdown", description: "Fiery glow and energy trails" },
  { id: 10, name: "Ice Countdown", category: "countdown", description: "Cold blue crystalline glow" },
  { id: 11, name: "Shockwave Countdown", category: "countdown", description: "Circular shockwave on each number" },
  { id: 12, name: "Cinematic Slow Countdown", category: "countdown", description: "Slow dramatic transitions" },
  { id: 13, name: "Speed Countdown", category: "countdown", description: "Ultra-fast motion blur" },
  { id: 14, name: "Massive Number Slam", category: "countdown", description: "Numbers slam with impact shake" },
  { id: 15, name: "Ultimate Countdown", category: "countdown", description: "Maximum combined effects" },
  { id: 16, name: "Laser Grid Countdown", category: "countdown", description: "Scanning laser grid and hot edges" },
  { id: 17, name: "Chromatic Split Countdown", category: "countdown", description: "RGB split with elastic snap" },
  { id: 18, name: "Matrix Rain Countdown", category: "countdown", description: "Falling code backdrop and green glow" },
  { id: 19, name: "Vortex Countdown", category: "countdown", description: "Spinning rings pull into the number" },
  { id: 20, name: "Ripple Countdown", category: "countdown", description: "Water-like rings pulse outward" },
  { id: 21, name: "Starfield Warp Countdown", category: "countdown", description: "Stars streak toward hyperspeed" },
  { id: 22, name: "Hologram Countdown", category: "countdown", description: "Projected scanlines and flicker" },
  { id: 23, name: "Prism Countdown", category: "countdown", description: "Rainbow glass refraction" },
  { id: 24, name: "Smoke Reveal Countdown", category: "countdown", description: "Numbers emerge through drifting smoke" },
  { id: 25, name: "Confetti Launch Countdown", category: "countdown", description: "GO moment with colorful celebration" },
  { id: 26, name: "Bingo Ball Call", category: "bingo", description: "Rolling white bingo ball reveals each call" },
  { id: 27, name: "Neon Marquee Bingo", category: "bingo", description: "Bulb sign and neon letters form BINGO" },
  { id: 28, name: "Confetti Ball Bingo", category: "bingo", description: "Bingo ball reveal with celebration burst" },
  { id: 29, name: "Slot Jackpot Bingo", category: "bingo", description: "Five slot reels lock into B-I-N-G-O" },
  { id: 30, name: "Bingo Card Mark", category: "bingo", description: "A full bingo card marks the winning line" },
  { id: 31, name: "Carnival Marquee Bingo", category: "bingo", description: "Showtime bulbs and a stage sign reveal" },
  { id: 32, name: "Fire Drop Bingo", category: "bingo", description: "Hot letters drop into their slots" },
  { id: 33, name: "Ice Drop Bingo", category: "bingo", description: "Frozen letters fall into place" },
  { id: 34, name: "Glitch Scanner Bingo", category: "bingo", description: "Digital scanner locks each letter" },
  { id: 35, name: "Laser Scanner Bingo", category: "bingo", description: "Laser panel scans B-I-N-G-O into place" },
  { id: 36, name: "Star Orbit Bingo", category: "bingo", description: "Letters orbit before snapping to BINGO" },
  { id: 37, name: "Matrix Scanner Bingo", category: "bingo", description: "Code rain and terminal-style letter lock" },
  { id: 38, name: "Vortex Orbit Bingo", category: "bingo", description: "Spinning orbit collapses into the word" },
  { id: 39, name: "Smoke Stamp Bingo", category: "bingo", description: "Smoke clears into a stamped BINGO" },
  { id: 40, name: "Prism Stamp Bingo", category: "bingo", description: "Rainbow beams finish with a stamp" },
  { id: 41, name: "Hologram Scanner Bingo", category: "bingo", description: "Projected scanlines assemble the word" },
  { id: 42, name: "Ripple Orbit Bingo", category: "bingo", description: "Water rings pull letters into orbit" },
  { id: 43, name: "Thunder Stamp Bingo", category: "bingo", description: "Electric strikes stamp the final word" },
  { id: 44, name: "Drumroll Bingo", category: "bingo", description: "Percussion bars bounce into the final call" },
  { id: 45, name: "Ultimate Stamp Bingo", category: "bingo", description: "Lights, rings, particles and a final stamp" },
];

export const categoryLabels: Record<EffectCategory | "all" | "favorites", string> = {
  all: "All Effects",
  countdown: "Countdown",
  bingo: "Bingos",
  favorites: "⭐ Favorites",
};
