export const UPGRADE_IDS = [
  "gloves",
  "electro",
  "milker",
  "lyova",
  "denis",
  "manager",
  "auto",
  "golden",
  "ilyusha",
  "pan",
  "tractor",
  "radio",
  "altar",
  "chicken",
  "bacon",
] as const;

export type UpgradeId = (typeof UPGRADE_IDS)[number];
export type ShopTab = "click" | "auto" | "rare" | "ultra";

export type UpgradeDef = {
  name: string;
  blurb: string;
  tab: ShopTab;
  base: number;
  growth: number;
  max?: number;
};

export const UPGRADES: Record<UpgradeId, UpgradeDef> = {
  gloves: {
    name: "Новые перчатки",
    blurb: "Бабушка сказала: без них руки пахнут Саней.",
    tab: "click",
    base: 15,
    growth: 1.5,
  },
  electro: {
    name: "Электродоилка",
    blurb: "Жужжит, как соседский холодильник в три ночи.",
    tab: "click",
    base: 100,
    growth: 1.5,
  },
  pan: {
    name: "Сковорода бабки Зины",
    blurb: "Крит x4. Зина жарит удачу, не спрашивая Саню.",
    tab: "click",
    base: 180,
    growth: 1.42,
    max: 25,
  },
  milker: {
    name: "Нанять доярку",
    blurb: "Честно стоит у бидона и делает вид, что поёт.",
    tab: "auto",
    base: 50,
    growth: 1.3,
  },
  manager: {
    name: "Менеджер фермы",
    blurb: "Переименовал ведро в «воронку ценности».",
    tab: "auto",
    base: 500,
    growth: 1.3,
  },
  lyova: {
    name: "Доилка Лёвы",
    blurb: "Лёва чинил велосипед. Получилась доилка. Никто не спорит.",
    tab: "auto",
    base: 300,
    growth: 1.3,
  },
  denis: {
    name: "Молокоотсос Дениса",
    blurb: "Денис не объясняет, как оно работает. И правильно.",
    tab: "auto",
    base: 1500,
    growth: 1.3,
  },
  auto: {
    name: "Авто-кликер",
    blurb: "Сам тыкает Саню. Саня в шоке, но по контракту молчит.",
    tab: "auto",
    base: 800,
    growth: 1.4,
  },
  tractor: {
    name: "Трактор дяди Васи",
    blurb: "Василий орёт «поехали», даже когда стоит.",
    tab: "auto",
    base: 4000,
    growth: 1.32,
  },
  golden: {
    name: "Золотое вымя",
    blurb: "x2 ко всему производству. Блестит неприлично.",
    tab: "rare",
    base: 5000,
    growth: 1,
    max: 1,
  },
  ilyusha: {
    name: "Илюша Говрюша",
    blurb: "+0,5% к кефиру. Хрюкает стратегически, в штат.",
    tab: "rare",
    base: 2000,
    growth: 1,
    max: 1,
  },
  chicken: {
    name: "Курица-бухгалтер Клава",
    blurb: "Комбо толстеет. Дебет с молоком у неё сходится.",
    tab: "rare",
    base: 3500,
    growth: 1.4,
    max: 20,
  },
  altar: {
    name: "Алтарь ряженки",
    blurb: "Кефир длится дольше и падает чуть чаще. Пахнет свято.",
    tab: "rare",
    base: 9000,
    growth: 1.45,
    max: 6,
  },
  radio: {
    name: "Рация «Алло, дрон»",
    blurb: "Дроны висят над фермой дольше. Связь через бекон.",
    tab: "ultra",
    base: 18000,
    growth: 1.5,
    max: 6,
  },
  bacon: {
    name: "Бекон",
    blurb: "+0,05% к шансу дронов за штуку. Дроны падки на завтрак.",
    tab: "ultra",
    base: 700000,
    growth: 1.5,
  },
};

export const BASE_KEFIR_CHANCE = 0.0023;
export const ILYUSHA_KEFIR = 0.005;
export const ALTAR_KEFIR = 0.0004;
export const BASE_DRONE_CHANCE = 0.00007;
export const BACON_DRONE = 0.0005;
export const DRONE_FLAT = 5000;
export const KEFIR_MULT = 1.5;
export const KEFIR_BASE_SEC = 30;
export const DRONE_BASE_SEC = 120;
export const PRESTIGE_UNIT = 100_000;
export const HAY_BONUS = 0.1;

export type Levels = Record<UpgradeId, number>;

export function emptyLevels(): Levels {
  return Object.fromEntries(UPGRADE_IDS.map((id) => [id, 0])) as Levels;
}

export function upgradeCost(id: UpgradeId, level: number): number {
  const def = UPGRADES[id];
  if (def.max !== undefined && level >= def.max) return Number.POSITIVE_INFINITY;
  return Math.floor(def.base * Math.pow(def.growth, level));
}

export function getKefirChance(levels: Levels): number {
  return BASE_KEFIR_CHANCE + (levels.ilyusha > 0 ? ILYUSHA_KEFIR : 0) + levels.altar * ALTAR_KEFIR;
}

export function getDroneChance(levels: Levels): number {
  return BASE_DRONE_CHANCE + levels.bacon * BACON_DRONE;
}

export function kefirDuration(levels: Levels): number {
  return KEFIR_BASE_SEC + levels.altar * 6;
}

export function droneDuration(levels: Levels): number {
  return DRONE_BASE_SEC + levels.radio * 20;
}

export function hayFromRun(runMilk: number): number {
  if (runMilk < PRESTIGE_UNIT) return 0;
  return Math.floor(Math.sqrt(runMilk / PRESTIGE_UNIT));
}

export type ProdState = {
  levels: Levels;
  hay: number;
  kefirLeft: number;
  droneLeft: number;
};

export type Production = {
  clickPower: number;
  passive: number;
  auto: number;
  total: number;
  hayMult: number;
};

export function production(state: ProdState): Production {
  const { levels } = state;
  const clickPower = 1 + levels.gloves + levels.electro * 5;
  const hayMult = 1 + state.hay * HAY_BONUS;
  const kefir = state.kefirLeft > 0;
  const golden = levels.golden > 0;
  let passive =
    levels.milker * 1 +
    levels.manager * 10 +
    levels.lyova * 15 +
    levels.denis * 50 +
    levels.tractor * 120;
  if (kefir) passive *= KEFIR_MULT;
  if (golden) passive *= 2;
  passive *= hayMult;
  if (state.droneLeft > 0) passive += DRONE_FLAT * hayMult;
  let auto = levels.auto * clickPower;
  if (kefir) auto *= KEFIR_MULT;
  if (golden) auto *= 2;
  auto *= hayMult;
  return { clickPower, passive, auto, total: passive + auto, hayMult };
}

export function critChance(levels: Levels): number {
  return Math.min(0.45, levels.pan * 0.02);
}

export function comboMultiplier(combo: number, chicken: number): number {
  const steps = Math.min(Math.max(combo, 1), 120);
  return 1 + (steps - 1) * (0.012 + chicken * 0.003);
}

export function upgradeHint(id: UpgradeId, level: number): string {
  const next = level + 1;
  switch (id) {
    case "gloves":
      return `+${next} к силе клика`;
    case "electro":
      return `+${next * 5} к силе клика`;
    case "pan":
      return `шанс крита ${Math.round(critChance({ ...emptyLevels(), pan: next }) * 100)}%`;
    case "milker":
      return `+${next} молока/с`;
    case "manager":
      return `+${next * 10} молока/с`;
    case "lyova":
      return `+${next * 15} молока/с`;
    case "denis":
      return `+${next * 50} молока/с`;
    case "auto":
      return `${next} автоклик/с`;
    case "tractor":
      return `+${next * 120} молока/с`;
    case "golden":
      return "x2 производство";
    case "ilyusha":
      return "кефир 0,73%";
    case "chicken":
      return "комбо жирнее";
    case "altar":
      return `кефир ${kefirDuration({ ...emptyLevels(), altar: next })} с`;
    case "radio":
      return `дроны ${droneDuration({ ...emptyLevels(), radio: next })} с`;
    case "bacon":
      return `дроны ${formatChance(getDroneChance({ ...emptyLevels(), bacon: next }))}`;
    default:
      return "";
  }
}

export function formatMilk(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const sign = n < 0 ? "−" : "";
  const value = Math.abs(n);
  if (value < 10000) return sign + Math.floor(value).toLocaleString("ru-RU");
  const units = ["", " тыс.", " млн", " млрд", " трлн", " квдр"];
  let unit = 0;
  let scaled = value;
  while (scaled >= 1000 && unit < units.length - 1) {
    scaled /= 1000;
    unit += 1;
  }
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return sign + scaled.toFixed(digits).replace(".", ",") + units[unit];
}

export function formatChance(p: number): string {
  const pct = p * 100;
  const trimmed = pct
    .toFixed(3)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
  return trimmed.replace(".", ",") + "%";
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  if (s < 90) return `${s} с`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} ч ${rem} мин` : `${h} ч`;
}
