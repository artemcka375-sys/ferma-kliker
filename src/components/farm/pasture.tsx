import { useEffect, useRef } from "react";
import { EVENT_COPY } from "@/game/content";
import { clickCow, clickEvent, pokeBacon, pokeDrone, pokePig, useGame } from "@/game/store";
import { Hud } from "@/components/farm/hud";
import { BaconSvg, CowSvg, DroneSvg, PigSvg } from "@/components/farm/mascots";

export function Pasture() {
  const ref = useRef<HTMLDivElement>(null);
  const kefirLeft = useGame((s) => s.kefirLeft);
  const droneLeft = useGame((s) => s.droneLeft);
  const bacon = useGame((s) => s.levels.bacon);
  const ilyusha = useGame((s) => s.levels.ilyusha);
  const speech = useGame((s) => s.speech);
  const event = useGame((s) => s.event);
  const floats = useGame((s) => s.floats);
  const droneLine = useGame((s) => s.droneLine);
  const log = useGame((s) => s.log);
  const shakeToken = useGame((s) => s.shakeToken);
  const hitToken = useGame((s) => s.hitToken);
  const juice = useGame((s) => s.juice);
  const cowLine = useGame((s) => s.cowLine);
  const shout = useGame((s) => s.shout);
  const rageLeft = useGame((s) => s.rageLeft);
  const combo = useGame((s) => s.combo);
  const cowRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shakeToken || !juice) return;
    el.classList.remove("is-shaking");
    void el.offsetWidth;
    el.classList.add("is-shaking");
  }, [shakeToken, juice]);

  useEffect(() => {
    const el = cowRef.current;
    if (!el || !hitToken) return;
    el.classList.remove("is-hit");
    void el.offsetWidth;
    el.classList.add("is-hit");
  }, [hitToken]);

  const mood = [
    "pasture",
    droneLeft > 0 ? "pasture-drone" : "",
    kefirLeft > 0 ? "pasture-kefir" : "",
    rageLeft > 0 ? "pasture-rage" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cowClass = [
    "mascot mascot-cow",
    kefirLeft > 0 ? "cow-rainbow" : "",
    rageLeft > 0 ? "cow-rage" : "",
    combo >= 12 ? "cow-hype" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={mood} ref={ref}>
      <Hud />
      {event ? (
        <button type="button" className="event-banner" onClick={() => clickEvent()}>
          <strong>{EVENT_COPY[event.kind].title}</strong>
          <span>
            {EVENT_COPY[event.kind].hint} · {Math.ceil(event.left)} с
          </span>
        </button>
      ) : null}
      {shout ? <p className="shout">{shout}</p> : null}
      <div className="stage">
        {hitToken > 0 ? (
          <span key={hitToken} className="splats" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        ) : null}
        {droneLeft > 0 ? (
          <button type="button" className="slot drone-slot" onClick={() => pokeDrone()}>
            <DroneSvg className="mascot mascot-drone" />
            <span className="bubble bubble-drone">{droneLine}</span>
          </button>
        ) : null}
        {bacon > 0 ? (
          <button type="button" className="slot bacon-slot" onClick={() => pokeBacon()}>
            <BaconSvg className="mascot mascot-bacon" />
          </button>
        ) : null}
        <button
          ref={cowRef}
          type="button"
          className="cow-btn"
          aria-label="Доить Саню"
          onClick={(e) => {
            const box = ref.current?.getBoundingClientRect();
            const x = box ? e.clientX - box.left : -1;
            const y = box ? e.clientY - box.top : -1;
            clickCow(x, y);
          }}
        >
          <span className="name-tag">Саня</span>
          <CowSvg className={cowClass} />
          {cowLine ? <span className="bubble bubble-cow">{cowLine}</span> : null}
          <span className="cow-hint">{rageLeft > 0 ? "она в ярости, жми" : "жми, или пробел"}</span>
        </button>
        <button type="button" className={ilyusha > 0 ? "slot pig-slot" : "slot pig-slot pig-locked"} onClick={() => pokePig()}>
          <PigSvg className="mascot mascot-pig" />
          {speech && ilyusha > 0 ? <span className="bubble">{speech}</span> : null}
          {ilyusha <= 0 ? <span className="pig-note">ещё не в штате</span> : null}
        </button>
      </div>
      {floats.map((item) => (
        <span
          key={item.id}
          className={`floater floater-${item.kind}`}
          style={item.x < 0 ? { left: "48%", top: "42%" } : { left: item.x, top: item.y }}
        >
          {item.text}
        </span>
      ))}
      <ul className="log" aria-label="Журнал фермы">
        {log.map((line, index) => (
          <li key={`${index}-${line}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
