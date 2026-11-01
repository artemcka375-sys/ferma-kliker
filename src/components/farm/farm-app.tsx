import { useEffect, useRef } from "react";
import { CircleHelp, Minus, Volume2, VolumeX, X } from "lucide-react";
import { ACHIEVEMENTS } from "@/game/content";
import { formatMilk } from "@/game/balance";
import {
  closePanel,
  exportSave,
  flushSave,
  frame,
  hydrate,
  importSave,
  joke,
  setPanel,
  start,
  toggleJuice,
  toggleMute,
  useGame,
  wipeFarm,
  prestige,
  clickCow,
} from "@/game/store";
import { CowSvg } from "@/components/farm/mascots";
import { Pasture } from "@/components/farm/pasture";
import { Shop } from "@/components/farm/shop";

function useLoop() {
  useEffect(() => {
    hydrate();
    let raf = 0;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onHide = () => {
      if (document.visibilityState === "hidden") flushSave();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      flushSave();
    };
  }, []);
}

function useHotkeys() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.code === "Space") {
        event.preventDefault();
        if (!useGame.getState().started) start();
        else clickCow();
      } else if (event.key === "m" || event.key === "M" || event.key === "ь" || event.key === "Ь") {
        toggleMute();
      } else if (event.key === "Escape") {
        closePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function DeskIcons() {
  return (
    <nav className="desk-icons" aria-label="Рабочий стол">
      <button type="button" onClick={() => joke("Мой бидон. Свободно: ноль. Занято: молоко и совесть Клавы.")}>
        <span className="desk-glyph">Б</span>
        Мой бидон
      </button>
      <button type="button" onClick={() => joke("Корзина Клавы. Туда падают отчёты, которые не сошлись. То есть все.")}>
        <span className="desk-glyph">К</span>
        Корзина
      </button>
      <button type="button" onClick={() => setPanel("about")}>
        <span className="desk-glyph">С</span>
        save.json
      </button>
      <button type="button" onClick={() => joke("Бекон.zip. Распаковывать только при дронах. Илюша против, бекон за.")}>
        <span className="desk-glyph">З</span>
        Бекон.zip
      </button>
    </nav>
  );
}

function TitleBar() {
  const muted = useGame((s) => s.muted);
  const started = useGame((s) => s.started);
  return (
    <header className="titlebar">
      <CowSvg className="title-cow" />
      <div className="title-copy">
        <strong className="font-display">Ферма Кликер</strong>
        <span>sanya.exe</span>
      </div>
      <div className="title-actions">
        <button type="button" className="win-btn" aria-label="Справка" onClick={() => setPanel("help")}>
          <CircleHelp size={18} />
        </button>
        <button
          type="button"
          className="win-btn"
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          onClick={() => toggleMute()}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          type="button"
          className="win-btn"
          aria-label="Свернуть"
          disabled={!started}
          onClick={() => joke("В трей не лезет: Саня слишком принципиальная.")}
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          className="win-btn win-close"
          aria-label="Закрыть"
          onClick={() => joke("Alt+F4 не работает. Саня в доле с операционной системой.")}
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}

function BootScreen() {
  const clicks = useGame((s) => s.clicks);
  const milk = useGame((s) => s.milk);
  const returning = clicks > 0 || milk > 0;
  return (
    <div className="boot">
      <p className="boot-kicker font-display">ФЕРМА-ДОС 3.14</p>
      <ul className="boot-list">
        <li>Вымя проверено</li>
        <li>Илюша на связи, уже торгуется</li>
        <li>Дроны в ангаре, ждут бекон</li>
        <li>Клава свела вчерашний кефир в минус</li>
        <li>Галя уже судится с туманом</li>
      </ul>
      <p className="boot-lead">
        {returning
          ? `Нашлась старая дойка: ${formatMilk(milk)} молока в бидоне.`
          : "Новая ферма. Саня уже смотрит и делает вид, что это ты опоздал."}
      </p>
      <button type="button" className="go" onClick={() => start()}>
        {returning ? "Продолжить дойку" : "Надеть перчатки"}
      </button>
      <p className="boot-note">Пробел запускает. Это программа: рабочий стол, окно sanya.exe и сохранение.</p>
    </div>
  );
}

function TaskBar() {
  const news = useGame((s) => s.news);
  const milk = useGame((s) => s.milk);
  const panel = useGame((s) => s.panel);
  return (
    <footer className="taskbar">
      <button
        type="button"
        className={panel === "start" ? "start-btn start-on" : "start-btn"}
        onClick={() => setPanel(panel === "start" ? "none" : "start")}
      >
        Пуск
      </button>
      <p className="ticker">{news}</p>
      <span className="task-milk">{formatMilk(milk)}</span>
    </footer>
  );
}

function Toast() {
  const toast = useGame((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      {toast}
    </div>
  );
}

function Panels() {
  const panel = useGame((s) => s.panel);
  const fileRef = useRef<HTMLInputElement>(null);
  const achievements = useGame((s) => s.achievements);
  const clicks = useGame((s) => s.clicks);
  const bestCombo = useGame((s) => s.bestCombo);
  const lifetime = useGame((s) => s.lifetimeMilk);
  const prestiges = useGame((s) => s.prestiges);
  const hay = useGame((s) => s.hay);
  const hayGain = useGame((s) => s.hayGain);
  const juice = useGame((s) => s.juice);
  if (panel === "none") return null;

  return (
    <div className="overlay" role="presentation" onClick={() => closePanel()}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {panel === "start" ? (
          <>
            <h2 className="font-display">Пуск</h2>
            <div className="menu-col">
              <button type="button" onClick={() => setPanel("help")}>
                Справка и ачивки
              </button>
              <button type="button" onClick={() => setPanel("about")}>
                О программе
              </button>
              <button type="button" onClick={() => setPanel("prestige")}>
                Отправить Саню в отпуск
              </button>
              <button type="button" onClick={() => setPanel("wipe")}>
                Новая ферма
              </button>
            </div>
          </>
        ) : null}

        {panel === "help" ? (
          <>
            <h2 className="font-display">Как доить</h2>
            <ul className="help-list">
              <li>Жми Саню или пробел. Быстрые клики копят комбо.</li>
              <li>Кефир — редкий, +50% на полминуты. Илюша поднимает шанс.</li>
              <li>Бекон манит дронов. Они льют +5 000 молока в секунду.</li>
              <li>С неба падают НЛО, трактор, бутыль, Клава, Галя, самовар и холодильник.</li>
              <li>Комбо 50 включает ярость Сани: клики x2, пока она орёт.</li>
              <li>100 000 молока за забег — и Саню можно отправить в отпуск за сено.</li>
              <li>Клавиша M — звук. Esc — закрыть это окно.</li>
            </ul>
            <p className="help-stats">
              Кликов {formatMilk(clicks)} · рекорд комбо {bestCombo} · за всё время {formatMilk(lifetime)} ·
              отпусков {prestiges} · сено +{Math.round(hay * 10)}%
            </p>
            <button type="button" className="textish" onClick={() => toggleJuice()}>
              Тряска экрана: {juice ? "включена" : "выключена"}
            </button>
            <ul className="ach-list">
              {ACHIEVEMENTS.map((item) => {
                const got = achievements.includes(item.id);
                return (
                  <li key={item.id} className={got ? "ach ach-got" : "ach"}>
                    <strong>{item.title}</strong>
                    <span>{got ? item.desc : "ещё впереди"}</span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {panel === "about" ? (
          <>
            <h2 className="font-display">О программе</h2>
            <p>
              Ферма Кликер, сборка sanya.exe. Доишь Саню, нанимаешь Илюшу Говрюшу, кормишь дронов беконом и
              слушаешь, как Клава ругает кефир.
            </p>
            <p>Прогресс сам пишется в браузер. Файл сохранения можно унести на флешку — ну, или на рабочий стол.</p>
            <div className="menu-col">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([exportSave()], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "ferma-kliker-save.json";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Скачать сохранение
              </button>
              <button type="button" onClick={() => fileRef.current?.click()}>
                Загрузить сохранение
              </button>
              <input
                ref={fileRef}
                className="file-input"
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void file.text().then((text) => importSave(text));
                  event.target.value = "";
                }}
              />
            </div>
          </>
        ) : null}

        {panel === "prestige" ? (
          <>
            <h2 className="font-display">Отпуск</h2>
            <p>
              Саня уезжает, бидон и улучшения обнуляются. Сено остаётся навсегда: каждое даёт +10% ко всему
              молоку, включая клики и дронов.
            </p>
            <p>
              {hayGain > 0
                ? `Сейчас привезёт ${hayGain} сена. Уже есть +${Math.round(hay * 10)}%.`
                : "Нужно 100 000 молока за этот забег. Саня ещё даже чемодан не достала."}
            </p>
            <div className="menu-col">
              <button type="button" disabled={hayGain < 1} onClick={() => prestige()}>
                Отпустить Саню
              </button>
              <button type="button" onClick={() => closePanel()}>
                Пусть остаётся
              </button>
            </div>
          </>
        ) : null}

        {panel === "wipe" ? (
          <>
            <h2 className="font-display">Новая ферма</h2>
            <p>Молоко, сено и магазин сгорят. Ачивки Клава прячет у себя в перьях — они останутся.</p>
            <div className="menu-col">
              <button type="button" className="danger" onClick={() => wipeFarm()}>
                Снести бидоны
              </button>
              <button type="button" onClick={() => closePanel()}>
                Ой, нет
              </button>
            </div>
          </>
        ) : null}

        <button type="button" className="dialog-x" onClick={() => closePanel()} aria-label="Закрыть">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export function FarmApp() {
  useLoop();
  useHotkeys();
  const started = useGame((s) => s.started);

  return (
    <div className="desktop">
      <DeskIcons />
      <section className="window" aria-label="Ферма Кликер">
        <TitleBar />
        {started ? (
          <div className="game-body">
            <Pasture />
            <Shop />
          </div>
        ) : (
          <BootScreen />
        )}
        {started ? <TaskBar /> : null}
      </section>
      <Toast />
      <Panels />
    </div>
  );
}
