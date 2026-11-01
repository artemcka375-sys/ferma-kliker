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

  const mood = droneLeft > 0 ? "pasture pasture-drone" : kefirLeft > 0 ? "pasture pasture-kefir" : "pasture";

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
      <div className="stage">
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
          <CowSvg className={kefirLeft > 0 ? "mascot mascot-cow cow-rainbow" : "mascot mascot-cow"} />
          <span className="cow-hint">жми, или пробел</span>
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
