import { formatChance, formatMilk } from "@/game/balance";
import { useGame } from "@/game/store";

function Chip({ label, value, hot = false }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className={hot ? "chip chip-hot" : "chip"}>
      <span className="chip-label">{label}</span>
      <span className="chip-value">{value}</span>
    </div>
  );
}

function secs(n: number) {
  if (n >= 10) return `${Math.ceil(n)} с`;
  return `${n.toFixed(1).replace(".", ",")} с`;
}

export function Hud() {
  const milk = useGame((s) => s.milk);
  const clickPower = useGame((s) => s.clickPower);
  const mps = useGame((s) => s.mps);
  const combo = useGame((s) => s.combo);
  const kefirLeft = useGame((s) => s.kefirLeft);
  const droneLeft = useGame((s) => s.droneLeft);
  const kefirChance = useGame((s) => s.kefirChance);
  const droneChance = useGame((s) => s.droneChance);
  const bacon = useGame((s) => s.levels.bacon);
  const hay = useGame((s) => s.hay);

  return (
    <div className="hud" aria-label="Статистика фермы">
      <Chip label="Молоко" value={formatMilk(milk)} hot />
      <Chip label="Клик" value={formatMilk(clickPower)} />
      <Chip label="В секунду" value={formatMilk(mps)} />
      {combo > 1 ? <Chip label="Комбо" value={`x${combo}`} hot /> : null}
      {kefirLeft > 0 ? <Chip label="Кефир" value={secs(kefirLeft)} hot /> : null}
      {droneLeft > 0 ? <Chip label="Дроны" value={secs(droneLeft)} hot /> : null}
      <Chip label="Шанс кефира" value={formatChance(kefirChance)} />
      <Chip label="Шанс дронов" value={formatChance(droneChance)} />
      <Chip label="Бекон" value={String(bacon)} />
      {hay > 0 ? <Chip label="Сено" value={`+${Math.round(hay * 10)}%`} /> : null}
    </div>
  );
}
