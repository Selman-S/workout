// Calculate a reasonable default set duration from the rep string
export function getDefaultSetDuration(reps: string): number {
  const lower = reps.toLowerCase();
  if (lower.includes("max saniye")) return 60;
  if (lower === "max") return 45;

  const nums = reps.match(/\d+/g)?.map(Number) || [];
  if (nums.length === 0) return 40;

  const maxRep = Math.max(...nums);
  const perSide = lower.includes("bacak") || lower.includes("kol");

  // ~3.5 sec per rep, doubled for per-side exercises
  let duration = Math.round(maxRep * 3.5);
  if (perSide) duration *= 2;

  return Math.max(25, Math.min(90, duration));
}

// Extract a numeric target rep count from the rep string
export function getDefaultTargetReps(reps: string): number {
  const lower = reps.toLowerCase();
  if (lower.includes("max saniye")) return 0;
  if (lower === "max") return 0;

  const nums = reps.match(/\d+/g)?.map(Number) || [];
  return nums.length > 0 ? Math.max(...nums) : 10;
}

// Format seconds as M:SS
export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}`;
}
