import { deleteMenuItem } from "../_lib/actions";
import type { MenuItem } from "../_lib/types";

export default function MenuTab({
  menuItems,
  onAddNew,
  onEdit,
}: {
  menuItems: MenuItem[];
  onAddNew: () => void;
  onEdit: (item: MenuItem) => void;
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <p className="text-[#a0a0a0] text-sm">Speisekarte verwalten (inkl. Größen)</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onAddNew}
            className="bg-[#cda1b1] text-[#353941] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#ebd2db]"
          >
            + Neues Gericht
          </button>
        </div>
      </div>

      {menuItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#a0a0a0]">
          Noch keine Gerichte vorhanden.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.isExtra && (
                    <span className="text-[10px] font-bold uppercase bg-[#cda1b1] text-white px-2 py-0.5 rounded">
                      Extra
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-lg text-[#2d2d2d]">{item.name}</h4>
                <p className="text-xs text-[#a0a0a0] line-clamp-1">
                  {item.description || "Keine Beschreibung"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-[#cda1b1]">€ {item.price}</span>
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-500 text-sm font-medium"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => deleteMenuItem(item.id)}
                  className="text-red-500 text-sm font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
