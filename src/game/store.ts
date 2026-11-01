import { create } from "zustand";
import {
  comboMultiplier,
  critChance,
  droneDuration,
  emptyLevels,
  formatDuration,
  formatMilk,
  getDroneChance,
  getKefirChance,
  hayFromRun,
  kefirDuration,
  production,
  upgradeCost,
  type Levels,
  type UpgradeId,
} from "@/game/balance";
import {
  ACHIEVEMENTS,
  BACON_LINES,
  COMBO_SHOUTS,
  DRONE_LINES,
  EVENT_COPY,
  ILYUSHA_LINES,
  NEWS,
  SANYA_LINES,
  type EventKind,
} from "@/game/content";
import { playBuy, playCrit, playDrone, playKefir, playMilk, playUi, setMuted, unlockAudio } from "@/game/audio";
import { clearSave, emptySave, loadSave, parseSave, writeSave, type SaveData } from "@/game/save";

export type FloatKind = "milk" | "crit" | "kefir" | "drone" | "pig" | "event";

export type FloatText = {
  id: number;
  text: string;
  x: number;
  y: number;
  kind: FloatKind;
  born: number;
};

export type LiveEvent = { kind: EventKind; left: number };

export type PanelId = "none" | "help" | "about" | "prestige" | "wipe" | "start";

type Live = {
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
  started: boolean;
  combo: number;
  idle: number;
  floats: FloatText[];
  speech: string | null;
  speechLeft: number;
  event: LiveEvent | null;
  eventCooldown: number;
  toast: string | null;
  toastLeft: number;
  log: string[];
  newsIndex: number;
  newsLeft: number;
  droneLine: string;
  droneTalk: number;
  shakeToken: number;
  hitToken: number;
  dronePoke: number;
  uiAcc: number;
  cowLine: string | null;
  cowLineLeft: number;
  shout: string | null;
  shoutLeft: number;
  rageLeft: number;
};

export type ViewState = {
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
  started: boolean;
  combo: number;
  floats: FloatText[];
  speech: string | null;
  event: LiveEvent | null;
  toast: string | null;
  log: string[];
  news: string;
  droneLine: string;
  shakeToken: number;
  hitToken: number;
  panel: PanelId;
  cowLine: string | null;
  shout: string | null;
  rageLeft: number;
  clickPower: number;
  mps: number;
  kefirChance: number;
  droneChance: number;
  hayGain: number;
};

function freshLive(): Live {
  const save = emptySave();
  return {
    ...save,
    levels: emptyLevels(),
    achievements: [],
    started: false,
    combo: 0,
    idle: 1,
    floats: [],
    speech: null,
    speechLeft: 0,
    event: null,
    eventCooldown: 14,
    toast: null,
    toastLeft: 0,
    log: ["Саня на месте. Бидон пустой. Это временно."],
    newsIndex: 0,
    newsLeft: 6,
    droneLine: DRONE_LINES[0]!,
    droneTalk: 2,
    shakeToken: 0,
    hitToken: 0,
    dronePoke: 0,
    uiAcc: 0,
    cowLine: null,
    cowLineLeft: 0,
    shout: null,
    shoutLeft: 0,
    rageLeft: 0,
  };
}

const live = freshLive();
let panel: PanelId = "none";
let floatId = 1;
let hydrated = false;
let lastSave = 0;
let pendingToast: string | null = null;

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function snapshot(): ViewState {
  const prod = production(live);
  return {
    milk: live.milk,
    runMilk: live.runMilk,
    lifetimeMilk: live.lifetimeMilk,
    levels: { ...live.levels },
    hay: live.hay,
    prestiges: live.prestiges,
    clicks: live.clicks,
    kefirDrops: live.kefirDrops,
    droneDrops: live.droneDrops,
    bestCombo: live.bestCombo,
    crits: live.crits,
    achievements: live.achievements.slice(),
    kefirLeft: live.kefirLeft,
    droneLeft: live.droneLeft,
    muted: live.muted,
    juice: live.juice,
    started: live.started,
    combo: live.combo,
    floats: live.floats.slice(),
    speech: live.speech,
    event: live.event ? { ...live.event } : null,
    toast: live.toast,
    log: live.log.slice(),
    news: NEWS[live.newsIndex] ?? NEWS[0]!,
    droneLine: live.droneLine,
    shakeToken: live.shakeToken,
    hitToken: live.hitToken,
    cowLine: live.cowLine,
    shout: live.shout,
    rageLeft: live.rageLeft,
    panel,
    clickPower:
      prod.clickPower *
      (live.kefirLeft > 0 ? 1.5 : 1) *
      (live.levels.golden > 0 ? 2 : 1) *
      prod.hayMult,
    mps: prod.total,
    kefirChance: getKefirChance(live.levels),
    droneChance: getDroneChance(live.levels),
    hayGain: hayFromRun(live.runMilk),
  };
}

export const useGame = create<ViewState>()(() => snapshot());

function push() {
  useGame.setState(snapshot());
}

function addLog(line: string) {
  live.log = [line, ...live.log].slice(0, 5);
}

function notify(text: string, seconds = 3.2) {
  live.toast = text;
  live.toastLeft = seconds;
}

function speak(line: string) {
  live.speech = line;
  live.speechLeft = 2.3;
}

function spawnFloat(text: string, x: number, y: number, kind: FloatKind) {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  live.floats = [
    ...live.floats,
    { id: floatId++, text, x, y, kind, born: now },
  ].slice(-18);
}

function addMilk(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  live.milk += amount;
  live.runMilk += amount;
  live.lifetimeMilk += amount;
}

function toSave(): SaveData {
  return {
    version: 1,
    milk: live.milk,
    runMilk: live.runMilk,
    lifetimeMilk: live.lifetimeMilk,
    levels: { ...live.levels },
    hay: live.hay,
    prestiges: live.prestiges,
    clicks: live.clicks,
    kefirDrops: live.kefirDrops,
    droneDrops: live.droneDrops,
    bestCombo: live.bestCombo,
    crits: live.crits,
    achievements: live.achievements.slice(),
    kefirLeft: live.kefirLeft,
    droneLeft: live.droneLeft,
    muted: live.muted,
    juice: live.juice,
    savedAt: Date.now(),
  };
}

export function flushSave() {
  if (!hydrated) return;
  lastSave = Date.now();
  writeSave(toSave());
}

function maybeSave() {
  if (!hydrated) return;
  if (Date.now() - lastSave < 4000) return;
  flushSave();
}

function checkAchievements() {
  let fresh: string | null = null;
  for (const item of ACHIEVEMENTS) {
    if (live.achievements.includes(item.id)) continue;
    if (!item.test(live)) continue;
    live.achievements.push(item.id);
    if (!fresh) fresh = item.title;
  }
  if (fresh) {
    notify(`Ачивка: ${fresh}`, 2.8);
    playUi("achieve");
  }
}

function applyLoaded(save: SaveData) {
  live.milk = save.milk;
  live.runMilk = save.runMilk;
  live.lifetimeMilk = save.lifetimeMilk;
  live.levels = save.levels;
  live.hay = save.hay;
  live.prestiges = save.prestiges;
  live.clicks = save.clicks;
  live.kefirDrops = save.kefirDrops;
  live.droneDrops = save.droneDrops;
  live.bestCombo = save.bestCombo;
  live.crits = save.crits;
  live.achievements = save.achievements;
  live.muted = save.muted;
  live.juice = save.juice;
  setMuted(save.muted);
}

function offlineMilk(save: SaveData, away: number): number {
  const capped = Math.min(Math.max(0, away), 4 * 3600);
  if (capped < 15) return 0;
  const step = capped > 2400 ? 10 : 1;
  let gain = 0;
  let kefir = save.kefirLeft;
  let drone = save.droneLeft;
  for (let t = 0; t < capped; t += step) {
    gain += production({ levels: save.levels, hay: save.hay, kefirLeft: kefir, droneLeft: drone }).total * step * 0.5;
    kefir -= step;
    drone -= step;
  }
  return gain;
}

export function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const save = loadSave();
  if (!save) {
    push();
    return;
  }
  const away = save.savedAt > 0 ? (Date.now() - save.savedAt) / 1000 : 0;
  const gain = offlineMilk(save, away);
  applyLoaded(save);
  live.kefirLeft = Math.max(0, save.kefirLeft - Math.min(away, 4 * 3600));
  live.droneLeft = Math.max(0, save.droneLeft - Math.min(away, 4 * 3600));
  if (gain > 1) {
    addMilk(gain);
    pendingToast = `Пока тебя не было ${formatDuration(Math.min(away, 4 * 3600))}, Саня тайком надоила ${formatMilk(gain)}. Дроны, если и были, уже улетели.`;
    addLog("Саня работала без надзора. Бидон это подтверждает.");
  }
  push();
}

export function start() {
  unlockAudio();
  live.started = true;
  if (pendingToast) {
    notify(pendingToast, 6);
    pendingToast = null;
  }
  playUi("start");
  push();
}

export function setPanel(next: PanelId) {
  panel = next;
  if (next !== "none") playUi("tap");
  push();
}

export function closePanel() {
  if (panel === "none") return;
  panel = "none";
  push();
}

export function toggleMute() {
  live.muted = !live.muted;
  setMuted(live.muted);
  if (!live.muted) {
    unlockAudio();
    playUi("tap");
  }
  push();
  flushSave();
}

export function toggleJuice() {
  live.juice = !live.juice;
  push();
  flushSave();
}

function maybeShout() {
  const hit = COMBO_SHOUTS.find((item) => item.at === live.combo);
  if (!hit) return;
  live.shout = hit.text;
  live.shoutLeft = 1.7;
  if (live.combo >= 50) live.rageLeft = Math.max(live.rageLeft, 8);
  addLog(hit.text + ". Саня это слышала и не против.");
}

export function clickCow(x = -1, y = -1) {
  if (!live.started) return;
  live.clicks += 1;
  if (live.idle < 0.85) live.combo += 1;
  else live.combo = 1;
  live.idle = 0;
  if (live.combo > live.bestCombo) live.bestCombo = live.combo;
  maybeShout();

  const prod = production(live);
  let amount =
    prod.clickPower *
    (live.kefirLeft > 0 ? 1.5 : 1) *
    (live.levels.golden > 0 ? 2 : 1) *
    prod.hayMult *
    comboMultiplier(live.combo, live.levels.chicken);
  if (live.rageLeft > 0) amount *= 2;
  const crit = Math.random() < critChance(live.levels);
  if (crit) {
    amount *= 4;
    live.crits += 1;
    live.cowLine = "Зина жарит крит прямо на мне!";
    live.cowLineLeft = 1.8;
    playCrit();
  } else {
    if (live.clicks % 8 === 0) {
      live.cowLine = pick(SANYA_LINES);
      live.cowLineLeft = 1.8;
    }
    playMilk();
  }
  addMilk(amount);
  spawnFloat(`${crit ? "КРИТ " : ""}+${formatMilk(amount)}`, x, y, crit ? "crit" : "milk");
  live.hitToken += 1;
  if (live.juice) live.shakeToken += 1;

  if (Math.random() < getKefirChance(live.levels)) activateKefir(x, y);
  if (Math.random() < getDroneChance(live.levels)) activateDrone(x, y);
  if (live.levels.ilyusha > 0 && Math.random() < 0.1) speak(pick(ILYUSHA_LINES));
  checkAchievements();
  push();
  maybeSave();
}

function activateKefir(x: number, y: number) {
  const fresh = live.kefirLeft <= 0;
  live.kefirLeft = kefirDuration(live.levels);
  if (fresh) live.kefirDrops += 1;
  spawnFloat("КЕФИР +50%", x, y - 28, "kefir");
  notify(`Кефир! +50% на ${Math.round(live.kefirLeft)} с. Саня слегка радужная.`, 3.4);
  addLog("Выпал кефир. Бухгалтерия Клава это не одобряет, но пьёт.");
  if (live.levels.ilyusha > 0) speak("КЕФИР! Я же говорил!");
  playKefir();
}

function activateDrone(x: number, y: number) {
  const fresh = live.droneLeft <= 0;
  live.droneLeft = droneDuration(live.levels);
  if (fresh) live.droneDrops += 1;
  live.droneLine = pick(DRONE_LINES);
  spawnFloat(`ДРОНЫ +${formatMilk(5000)}/с`, x, y - 36, "drone");
  notify(`Дроны прилетели! +${formatMilk(5000)}/с на ${Math.round(live.droneLeft)} с.`, 3.6);
  addLog("Над фермой зависли дроны. Пахнет беконом и прогрессом.");
  if (live.levels.ilyusha > 0) speak("Дроны! Прячьте бекон! Или нет, не прячьте!");
  playDrone();
}

export function buy(id: UpgradeId) {
  if (!live.started) return;
  const level = live.levels[id];
  const price = upgradeCost(id, level);
  if (!Number.isFinite(price) || live.milk < price) return;
  live.milk -= price;
  live.levels = { ...live.levels, [id]: level + 1 };
  playBuy();
  addLog(`Куплено: ${label(id)}.`);
  if (id === "ilyusha") speak("Ура! Я в штате! Хрю-контракт подписан.");
  if (id === "bacon") {
    spawnFloat("БЕКОН +0,05% к дронам", -1, -1, "event");
    notify("Бекон на ферме. Дроны уже нюхают воздух.");
  }
  if (id === "golden") notify("Вымя стало золотым. Смотреть можно, доить осторожно.");
  if (id === "goat") notify("Галя в штате. Первый иск — на туман, второй — на тебя, если мало жмёшь.");
  if (id === "samovar") notify("Самовар Коли закипел. Чай отказался быть чаем.");
  checkAchievements();
  push();
  flushSave();
}

function label(id: UpgradeId): string {
  const names: Record<UpgradeId, string> = {
    gloves: "перчатки",
    electro: "электродоилка",
    milker: "доярка",
    lyova: "доилка Лёвы",
    denis: "агрегат Дениса",
    manager: "менеджер",
    auto: "авто-кликер",
    golden: "золотое вымя",
    ilyusha: "Илюша",
    pan: "сковорода Зины",
    tractor: "трактор Васи",
    radio: "рация",
    altar: "алтарь ряженки",
    chicken: "Клава",
    bacon: "бекон",
    goat: "Галя",
    samovar: "самовар Коли",
  };
  return names[id];
}

export function pokePig() {
  if (!live.started) return;
  if (live.levels.ilyusha <= 0) {
    notify("Илюша в магазине, вкладка «Редкое». Берёт 2 000 и делает вид, что это скидка.");
    return;
  }
  speak(pick(ILYUSHA_LINES));
  playUi("tap");
  push();
}

export function pokeBacon() {
  if (!live.started || live.levels.bacon <= 0) return;
  notify(pick(BACON_LINES), 2.6);
  playUi("tap");
  push();
}

export function pokeDrone() {
  if (!live.started || live.droneLeft <= 0) return;
  if (live.dronePoke > 0) {
    live.droneLine = pick(DRONE_LINES);
    push();
    return;
  }
  live.dronePoke = 0.8;
  const bonus = production(live).clickPower * 8 * (1 + live.hay * 0.1);
  addMilk(bonus);
  spawnFloat(`+${formatMilk(bonus)}`, -1, -1, "drone");
  live.droneLine = pick(DRONE_LINES);
  playUi("tap");
  push();
}

export function clickEvent() {
  if (!live.started || !live.event) return;
  const kind = live.event.kind;
  const prod = production(live);
  if (kind === "ufo") addMilk(prod.total * 20 + prod.clickPower * 40);
  if (kind === "tractor") addMilk(prod.clickPower * 80 + 250);
  if (kind === "bottle") activateKefir(-1, -1);
  if (kind === "chicken") {
    addMilk(prod.clickPower * 35 + 120);
    live.combo += 5;
    if (live.combo > live.bestCombo) live.bestCombo = live.combo;
    maybeShout();
  }
  if (kind === "goat") addMilk(prod.clickPower * 60 + prod.total * 12);
  if (kind === "samovar") {
    addMilk(prod.clickPower * 45 + 400);
    live.kefirLeft = Math.max(live.kefirLeft, 12);
  }
  if (kind === "fridge") {
    addMilk(prod.total * 15 + 800);
    live.combo += 3;
    if (live.combo > live.bestCombo) live.bestCombo = live.combo;
    maybeShout();
  }
  notify(EVENT_COPY[kind].hit, 2.8);
  addLog(EVENT_COPY[kind].hit);
  spawnFloat("ПОЙМАЛ", -1, -1, "event");
  live.event = null;
  live.eventCooldown = 18 + Math.random() * 16;
  playUi("achieve");
  checkAchievements();
  push();
}

function spawnEvent() {
  const kinds: EventKind[] = ["ufo", "tractor", "bottle", "chicken", "goat", "samovar", "fridge"];
  const kind = pick(kinds);
  live.event = { kind, left: 7 };
  live.eventCooldown = 24;
}

let lastWall = 0;

export function frame() {
  if (!hydrated || !live.started) return;
  const nowMs = Date.now();
  if (!lastWall) {
    lastWall = nowMs;
    return;
  }
  const simDt = Math.min(Math.max(0, (nowMs - lastWall) / 1000), 4 * 3600);
  lastWall = nowMs;
  const pay = simDt > 20 ? 0.5 : 1;
  const prod = production(live);
  if (prod.total > 0) addMilk(prod.total * simDt * pay);

  if (live.kefirLeft > 0) {
    live.kefirLeft = Math.max(0, live.kefirLeft - simDt);
    if (live.kefirLeft === 0) addLog("Кефир кончился. Саня снова обычного цвета.");
  }
  if (live.droneLeft > 0) {
    live.droneLeft = Math.max(0, live.droneLeft - simDt);
    if (live.droneLeft === 0) {
      addLog("Дроны улетели искать ещё бекон.");
    } else if (live.droneTalk > 0) {
      live.droneTalk -= simDt;
    } else {
      live.droneTalk = 2.6;
      live.droneLine = pick(DRONE_LINES);
    }
  }
  if (live.dronePoke > 0) live.dronePoke = Math.max(0, live.dronePoke - simDt);

  if (live.rageLeft > 0) {
    live.rageLeft = Math.max(0, live.rageLeft - simDt);
    if (live.rageLeft === 0) addLog("Саня выдохнула. Ярость ушла в бидон.");
  }
  if (live.cowLineLeft > 0) {
    live.cowLineLeft -= simDt;
    if (live.cowLineLeft <= 0) live.cowLine = null;
  }
  if (live.shoutLeft > 0) {
    live.shoutLeft -= simDt;
    if (live.shoutLeft <= 0) live.shout = null;
  }

  live.idle += simDt;
  if (live.idle >= 0.9 && live.combo !== 0) live.combo = 0;

  if (live.speechLeft > 0) {
    live.speechLeft -= simDt;
    if (live.speechLeft <= 0) live.speech = null;
  }
  if (live.toastLeft > 0) {
    live.toastLeft -= simDt;
    if (live.toastLeft <= 0) live.toast = null;
  }

  const now = performance.now();
  if (live.floats.length) live.floats = live.floats.filter((item) => now - item.born < 950);

  if (live.event) {
    live.event.left -= simDt;
    if (live.event.left <= 0) {
      addLog(EVENT_COPY[live.event.kind].expire);
      live.event = null;
      live.eventCooldown = 16 + Math.random() * 14;
    }
  } else {
    live.eventCooldown -= simDt;
    if (live.eventCooldown <= 0) spawnEvent();
  }

  if (live.newsLeft > 0) live.newsLeft -= simDt;
  else {
    live.newsLeft = 7.5;
    live.newsIndex = (live.newsIndex + 1) % NEWS.length;
  }

  live.uiAcc += Math.min(simDt, 0.25);
  if (live.uiAcc >= 0.1) {
    live.uiAcc = 0;
    push();
    maybeSave();
  }
}

export function prestige() {
  const gain = hayFromRun(live.runMilk);
  if (gain < 1) {
    notify("Рано. Сане нужно хотя бы 100 000 молока за этот забег.");
    push();
    return;
  }
  live.hay += gain;
  live.prestiges += 1;
  live.milk = 0;
  live.runMilk = 0;
  live.levels = emptyLevels();
  live.kefirLeft = 0;
  live.droneLeft = 0;
  live.combo = 0;
  live.rageLeft = 0;
  live.shout = null;
  live.cowLine = null;
  live.event = null;
  live.eventCooldown = 18;
  addLog(`Отпуск №${live.prestiges}. Сена привезли: +${gain}.`);
  notify(`Саня уехала в отпуск и привезла ${gain} сена. Всё молоко +${Math.round(live.hay * 10)}%.`, 4.2);
  panel = "none";
  checkAchievements();
  playUi("prestige");
  push();
  flushSave();
}

export function wipeFarm() {
  const achievements = live.achievements.slice();
  const muted = live.muted;
  const juice = live.juice;
  const next = freshLive();
  Object.assign(live, next);
  live.achievements = achievements;
  live.muted = muted;
  live.juice = juice;
  live.started = true;
  live.log = ["Новая ферма. Саня делает вид, что вы не знакомы."];
  panel = "none";
  pendingToast = null;
  setMuted(muted);
  clearSave();
  notify("Бидоны снесены. Ачивки остались — Клава не дала их стереть.");
  push();
  flushSave();
}

export function exportSave(): string {
  return JSON.stringify(toSave(), null, 2);
}

export function importSave(text: string) {
  try {
    const save = parseSave(JSON.parse(text));
    applyLoaded(save);
    live.kefirLeft = save.kefirLeft;
    live.droneLeft = save.droneLeft;
    live.started = true;
    live.combo = 0;
    live.event = null;
    panel = "none";
    addLog("Сохранение вставлено в бидон.");
    notify("Сохранение загружено. Саня узнала тебя по рукам.");
    push();
    flushSave();
  } catch {
    notify("Это не сохранение. Это записка от Клавы, и она не сходится.");
    push();
  }
}

export function joke(text: string) {
  notify(text, 2.6);
  push();
}
