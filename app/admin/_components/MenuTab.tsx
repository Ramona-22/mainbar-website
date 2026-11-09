import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { deleteMenuItem, saveMenuOrder } from "../_lib/actions";
import { menuCategories, type MenuItem } from "../_lib/types";
import { compareMenuItems, isExtraItem } from "../../../lib/menuOrder";

const OTHER = "OHNE KATEGORIE";

export default function MenuTab({
  menuItems,
  onAddNew,
  onEdit,
}: {
  menuItems: MenuItem[];
  onAddNew: () => void;
  onEdit: (item: MenuItem) => void;
}) {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]);

  const categoryOf = (item: MenuItem) =>
    item.category && menuCategories.includes(item.category) ? item.category : OTHER;
  const hasOther = menuItems.some((i) => categoryOf(i) === OTHER);
  const tabs = hasOther ? [...menuCategories, OTHER] : menuCategories;
  const current = tabs.includes(activeCategory) ? activeCategory : menuCategories[0];

  const inTab = menuItems.filter((i) => categoryOf(i) === current).sort(compareMenuItems);
  const mains = inTab.filter((i) => !isExtraItem(i.isExtra));
  const extras = inTab.filter((i) => isExtraItem(i.isExtra));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <p className="text-[#a0a0a0] text-sm">
          Speisekarte verwalten – Reihenfolge wie auf der Startseite. Zum Verschieben am Griff
          ziehen oder die Pfeile nutzen.
        </p>
        <button
          onClick={onAddNew}
          className="self-start shrink-0 bg-[#cda1b1] text-[#353941] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#ebd2db]"
        >
          + Neues Gericht
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Menü-Kategorien">
        {tabs.map((cat) => {
          const count = menuItems.filter((i) => categoryOf(i) === cat).length;
          const active = cat === current;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                active
                  ? "bg-[#353941] text-white border-[#353941]"
                  : "bg-white text-[#353941] border-gray-200 hover:border-[#cda1b1]"
              }`}
            >
              {cat} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {inTab.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
          Noch keine Gerichte in dieser Kategorie.
        </div>
      ) : (
        <div className="space-y-8">
          {mains.length > 0 && (
            <SortableList
              key={signature(mains)}
              title="Gerichte & Getränke"
              items={mains}
              onEdit={onEdit}
            />
          )}
          {extras.length > 0 && (
            <SortableList
              key={signature(extras)}
              title="Extras"
              items={extras}
              onEdit={onEdit}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Remount a list whenever its data changes in Firestore, so local drag
// state always starts from the saved order.
const signature = (items: MenuItem[]) =>
  items.map((i) => `${i.id}:${i.order ?? ""}:${i.name ?? ""}:${i.price ?? ""}`).join("|");

function SortableList({
  title,
  items,
  onEdit,
}: {
  title: string;
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
}) {
  const savedIds = items.map((i) => i.id);
  const [ids, setIds] = useState(savedIds);
  const [saving, setSaving] = useState(false);
  const byId = new Map(items.map((i) => [i.id, i]));

  const persist = async (next: string[]) => {
    if (next.join() === savedIds.join()) return;
    setSaving(true);
    const ok = await saveMenuOrder(next);
    setSaving(false);
    if (!ok) setIds(savedIds);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= ids.length || saving) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    setIds(next);
    persist(next);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#cda1b1]">{title}</h3>
        {saving && <span className="text-xs text-[#a0a0a0]">Speichert…</span>}
      </div>
      <Reorder.Group
        axis="y"
        values={ids}
        onReorder={setIds}
        className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50"
      >
        {ids.map((id, index) => {
          const item = byId.get(id);
          if (!item) return null;
          return (
            <Row
              key={id}
              item={item}
              index={index}
              count={ids.length}
              disabled={saving}
              onMove={move}
              onDrop={() => persist(ids)}
              onEdit={onEdit}
            />
          );
        })}
      </Reorder.Group>
    </section>
  );
}

function Row({
  item,
  index,
  count,
  disabled,
  onMove,
  onDrop,
  onEdit,
}: {
  item: MenuItem;
  index: number;
  count: number;
  disabled: boolean;
  onMove: (index: number, delta: number) => void;
  onDrop: () => void;
  onEdit: (item: MenuItem) => void;
}) {
  const controls = useDragControls();
  const priceText =
    item.sizes && item.sizes.length > 0
      ? item.sizes.map((s) => `${s.label ? s.label + " " : ""}€ ${s.price}`).join(" · ")
      : `€ ${item.price ?? ""}`;

  return (
    <Reorder.Item
      value={item.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDrop}
      className="relative bg-white p-4 flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl"
    >
      <button
        type="button"
        aria-label={`${item.name} verschieben`}
        onPointerDown={(e) => !disabled && controls.start(e)}
        className="touch-none cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#cda1b1] px-1 select-none text-xl leading-none"
      >
        ⋮⋮
      </button>

      <div className="flex flex-col">
        <button
          type="button"
          aria-label="Nach oben"
          disabled={disabled || index === 0}
          onClick={() => onMove(index, -1)}
          className="text-gray-400 hover:text-[#353941] disabled:opacity-20 text-xs leading-none p-1"
        >
          ▲
        </button>
        <button
          type="button"
          aria-label="Nach unten"
          disabled={disabled || index === count - 1}
          onClick={() => onMove(index, 1)}
          className="text-gray-400 hover:text-[#353941] disabled:opacity-20 text-xs leading-none p-1"
        >
          ▼
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-serif text-lg text-[#2d2d2d] truncate">{item.name}</h4>
        <p className="text-xs text-[#a0a0a0] line-clamp-1">
          {item.description || "Keine Beschreibung"}
        </p>
        <p className="text-xs font-bold text-[#cda1b1] mt-0.5 sm:hidden">{priceText}</p>
      </div>

      <span className="hidden sm:block font-bold text-[#cda1b1] text-sm text-right max-w-56">
        {priceText}
      </span>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-4 shrink-0">
        <button onClick={() => onEdit(item)} className="text-blue-500 text-sm font-medium">
          Bearbeiten
        </button>
        <button
          onClick={() => deleteMenuItem(item.id)}
          className="text-red-500 text-sm font-medium"
        >
          Löschen
        </button>
      </div>
    </Reorder.Item>
  );
}
