// Gedeelde stijlen en helpers voor de formulier-sheets (shows, tour-ideeën)

export const INPUT =
  "w-full px-3 py-2.5 rounded-lg bg-black/40 ring-1 ring-white/10 text-base text-zinc-100 placeholder:text-zinc-500 " +
  "focus:outline-none focus:ring-2 focus:ring-white/30 transition";
export const LABEL = "block mb-1.5 font-mono text-[13px] uppercase tracking-[0.06em] text-zinc-400";
export const CHIP = "px-3 py-1.5 rounded-full text-sm font-medium ring-1 transition-colors cursor-pointer";
export const chipClass = (on: boolean) =>
  `${CHIP} ${on ? "bg-white/15 text-white ring-white/40" : "text-zinc-400 ring-white/10 hover:text-white"}`;

export const splitList = (s?: string) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);
export const num = (s?: string) => parseFloat((s || "").replace(",", ".")) || 0;

// Landen waar de band het vaakst speelt: als snelkeuze bovenaan
export const QUICK_COUNTRIES = ["NL", "BE", "DE", "FR", "GB", "ES", "IT", "AT", "CH", "CZ", "DK", "PL"];
