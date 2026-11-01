import { useState } from "react";
import {
  Beef,
  Bot,
  Briefcase,
  CookingPot,
  Crown,
  Egg,
  Fan,
  Flame,
  Hand,
  PiggyBank,
  Radio,
  Tractor,
  UserRound,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { formatMilk, upgradeCost, upgradeHint, UPGRADES, UPGRADE_IDS, type ShopTab, type UpgradeId } from "@/game/balance";
import { buy, setPanel, useGame } from "@/game/store";

const ICONS: Record<UpgradeId, LucideIcon> = {
  gloves: Hand,
  electro: Zap,
  pan: CookingPot,
  milker: UserRound,
  manager: Briefcase,
  lyova: Wrench,
  denis: Fan,
  auto: Bot,
  tractor: Tractor,
  golden: Crown,
  ilyusha: PiggyBank,
  chicken: Egg,
  altar: Flame,
  radio: Radio,
  bacon: Beef,
};

const TABS: { id: "all" | ShopTab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "click", label: "Клик" },
  { id: "auto", label: "Авто" },
  { id: "rare", label: "Редкое" },
  { id: "ultra", label: "Ультра" },
];

export function Shop() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const milk = useGame((s) => s.milk);
  const levels = useGame((s) => s.levels);
  const hayGain = useGame((s) => s.hayGain);
  const runMilk = useGame((s) => s.runMilk);

  return (
    <aside className="shop" aria-label="Магазин">
      <div className="shop-head">
        <h2 className="font-display">Магазин</h2>
        <p>Саня не против. Саня в доле.</p>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "tab tab-on" : "tab"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="shop-list">
        {UPGRADE_IDS.map((id) => {
          const def = UPGRADES[id];
          if (tab !== "all" && def.tab !== tab) return null;
          const level = levels[id];
          if (def.max === 1 && level >= 1) return null;
          const cost = upgradeCost(id, level);
          const maxed = !Number.isFinite(cost);
          const afford = !maxed && milk >= cost;
          const Icon = ICONS[id];
          return (
            <button
              key={id}
              type="button"
              className={afford ? `card card-${def.tab}` : `card card-${def.tab} card-off`}
              disabled={!afford}
              onClick={() => buy(id)}
            >
              <span className="card-icon" aria-hidden="true">
                <Icon size={26} strokeWidth={2.2} />
              </span>
              <span className="card-copy">
                <span className="card-name">
                  {def.name}
                  {level > 0 ? <span className="card-lvl"> ур. {level}</span> : null}
                </span>
                <span className="card-blurb">{def.blurb}</span>
                <span className="card-meta">
                  <span>{upgradeHint(id, level)}</span>
                  <span className="card-price">{maxed ? "МАКС" : formatMilk(cost)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" className="vacation" onClick={() => setPanel("prestige")}>
        <span>
          <strong>Отпуск Сани</strong>
          <span>
            {hayGain > 0
              ? `Можно забрать ${hayGain} сена`
              : `Ещё ${formatMilk(Math.max(0, 100_000 - runMilk))} до первого сена`}
          </span>
        </span>
      </button>
    </aside>
  );
}
