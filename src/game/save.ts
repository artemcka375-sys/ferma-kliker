import { emptyLevels, UPGRADE_IDS, UPGRADES, type Levels, type UpgradeId } from "@/game/balance";

export const SAVE_KEY = "ferma-kliker-v1";
const BACKUP_KEY = "ferma-kliker-v1-bak";

export type SaveData = {
  version: 1;
  milk: number;
  runMilk: number;
  lifetimeMilk: number;
  levels: Levels;
  hay: number;
  prestiges: number;
  clicks: number;
  kefirDrops: number;
  droneDrops: number;
  bestCombo: number;
  crits: number;
  achievements: string[];
  kefirLeft: number;
  droneLeft: number;
  muted: boolean;
  juice: boolean;
  savedAt: number;
};

export function emptySave(): SaveData {
  return {
    version: 1,
    milk: 0,
    runMilk: 0,
    lifetimeMilk: 0,
    levels: emptyLevels(),
    hay: 0,
    prestiges: 0,
    clicks: 0,
    kefirDrops: 0,
    droneDrops: 0,
    bestCombo: 0,
    crits: 0,
    achievements: [],
    kefirLeft: 0,
    droneLeft: 0,
    muted: false,
    juice: true,
    savedAt: 0,
  };
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function levelsOf(raw: unknown): Levels {
  const levels = emptyLevels();
  if (!raw || typeof raw !== "object") return levels;
  const rec = raw as Record<string, unknown>;
  for (const id of UPGRADE_IDS) {
    const value = num(rec[id], 0);
    if (value <= 0) continue;
    const max = UPGRADES[id as UpgradeId].max;
    levels[id] = Math.floor(max ? Math.min(max, value) : value);
  }
  return levels;
}

export function parseSave(raw: unknown): SaveData {
  if (!raw || typeof raw !== "object") throw new Error("bad save");
  const rec = raw as Record<string, unknown>;
  const base = emptySave();
  const achievements = Array.isArray(rec.achievements)
    ? rec.achievements.filter((id): id is string => typeof id === "string").slice(0, 64)
    : [];
  return {
    ...base,
    version: 1,
    milk: Math.max(0, num(rec.milk)),
    runMilk: Math.max(0, num(rec.runMilk)),
    lifetimeMilk: Math.max(0, num(rec.lifetimeMilk)),
    levels: levelsOf(rec.levels),
    hay: Math.max(0, Math.floor(num(rec.hay))),
    prestiges: Math.max(0, Math.floor(num(rec.prestiges))),
    clicks: Math.max(0, Math.floor(num(rec.clicks))),
    kefirDrops: Math.max(0, Math.floor(num(rec.kefirDrops))),
    droneDrops: Math.max(0, Math.floor(num(rec.droneDrops))),
    bestCombo: Math.max(0, Math.floor(num(rec.bestCombo))),
    crits: Math.max(0, Math.floor(num(rec.crits))),
    achievements,
    kefirLeft: Math.max(0, num(rec.kefirLeft)),
    droneLeft: Math.max(0, num(rec.droneLeft)),
    muted: rec.muted === true,
    juice: rec.juice !== false,
    savedAt: Math.max(0, num(rec.savedAt)),
  };
}

export function loadSave(): SaveData | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return parseSave(JSON.parse(raw));
  } catch {
    try {
      const bak = localStorage.getItem(BACKUP_KEY);
      if (!bak) return null;
      return parseSave(JSON.parse(bak));
    } catch {
      return null;
    }
  }
}

export function writeSave(save: SaveData) {
  if (typeof localStorage === "undefined") return;
  try {
    const prev = localStorage.getItem(SAVE_KEY);
    if (prev) localStorage.setItem(BACKUP_KEY, prev);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, version: 1, savedAt: Date.now() }));
  } catch {
    /* private mode / quota — keep playing in memory */
  }
}

export function clearSave() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(BACKUP_KEY);
  } catch {
    /* ignore */
  }
}
