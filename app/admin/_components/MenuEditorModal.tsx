import { motion, AnimatePresence } from "framer-motion";
import { menuCategories } from "../_lib/types";
import type { MenuEditorState } from "../_lib/useMenuEditor";

// Add/edit dialog for a menu item. Wraps its own AnimatePresence so the
// enter/exit animation matches the original inline markup.
export default function MenuEditorModal({ editor }: { editor: MenuEditorState }) {
  const {
    isMenuModalOpen,
    editingId,
    menuForm,
    setMenuForm,
    isSavingMenu,
    resetMenuForm,
    handleMenuSubmit,
    addSizeRow,
    updateSizeRow,
    removeSizeRow,
  } = editor;

  return (
    <AnimatePresence>
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto relative shadow-2xl"
          >
            <button
              onClick={resetMenuForm}
              disabled={isSavingMenu}
              aria-label="Schließen"
              className="absolute top-5 right-5 text-2xl text-gray-400 hover:text-black"
            >
              ×
            </button>

            <h3 className="font-serif text-xl mb-6 pr-8">
              {editingId ? "Gericht bearbeiten" : "Neues Gericht hinzufügen"}
            </h3>

            <form onSubmit={handleMenuSubmit} className="space-y-5">
              <div>
                <label htmlFor="menu-category" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                  Kategorie
                </label>
                <select
                  id="menu-category"
                  value={menuForm.category}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, category: e.target.value })
                  }
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1]"
                >
                  {menuCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="menu-name" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                  Name
                </label>
                <input
                  id="menu-name"
                  required
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, name: e.target.value })
                  }
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1]"
                  placeholder="z.B. Cafe Crema"
                />
              </div>

              <div>
                <label htmlFor="menu-price" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                  Hauptpreis (€)
                </label>
                <input
                  id="menu-price"
                  required
                  value={menuForm.price}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, price: e.target.value })
                  }
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1]"
                  placeholder="z.B. 3,50"
                />
              </div>

              <div>
                <label htmlFor="menu-description" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                  Beschreibung
                </label>
                <textarea
                  id="menu-description"
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, description: e.target.value })
                  }
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] resize-none"
                />
              </div>

              <details className="rounded-2xl border border-gray-200 p-4" open={!!(menuForm.name_en || menuForm.description_en)}>
                <summary className="cursor-pointer text-[10px] uppercase tracking-widest text-[#a0a0a0]">
                  Englische Version (optional)
                </summary>
                <p className="text-xs text-[#a0a0a0] mt-2 mb-3">
                  Wird angezeigt, wenn Gäste die Website auf Englisch stellen. Leer lassen = deutscher Text.
                </p>
                <label htmlFor="menu-name-en" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                  Name (Englisch)
                </label>
                <input
                  id="menu-name-en"
                  type="text"
                  value={menuForm.name_en}
                  onChange={(e) => setMenuForm({ ...menuForm, name_en: e.target.value })}
                  className="w-full border-b border-gray-200 py-2 mb-4 focus:outline-none focus:border-[#cda1b1]"
                />
                <label htmlFor="menu-description-en" className="text-[10px] uppercase tracking-widest text-[#a0a0a0] block mb-1">
                  Beschreibung (Englisch)
                </label>
                <textarea
                  id="menu-description-en"
                  rows={2}
                  value={menuForm.description_en}
                  onChange={(e) => setMenuForm({ ...menuForm, description_en: e.target.value })}
                  className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-[#cda1b1] resize-none"
                />
              </details>

              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] uppercase tracking-widest text-[#a0a0a0]">
                    Größen / Varianten
                  </label>
                  <button
                    type="button"
                    onClick={addSizeRow}
                    className="text-xs font-bold text-[#cda1b1]"
                  >
                    + Größe hinzufügen
                  </button>
                </div>

                {menuForm.sizes.length === 0 && (
                  <p className="text-xs text-gray-400">Keine Größen – nur Hauptpreis wird verwendet</p>
                )}

                {menuForm.sizes.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input
                      placeholder="Label (Normal / 0,25 l)"
                      value={s.label}
                      onChange={(e) => updateSizeRow(i, "label", e.target.value)}
                      className="flex-1 border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-[#cda1b1]"
                    />
                    <input
                      placeholder="Preis"
                      value={s.price}
                      onChange={(e) => updateSizeRow(i, "price", e.target.value)}
                      className="w-20 border-b border-gray-200 py-1.5 text-sm focus:outline-none focus:border-[#cda1b1]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSizeRow(i)}
                      aria-label="Größe entfernen"
                      className="text-red-400 text-lg font-bold px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isExtra"
                  checked={menuForm.isExtra}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, isExtra: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#cda1b1]"
                />
                <label htmlFor="isExtra" className="text-xs font-bold uppercase tracking-widest">
                  Als Extra markieren
                </label>
              </div>

              <button
                type="submit"
                disabled={isSavingMenu}
                className="w-full bg-[#cda1b1] hover:bg-[#ebd2db] text-[#353941] py-4 rounded-full font-bold uppercase tracking-widest text-xs disabled:opacity-60"
              >
                {isSavingMenu
                  ? "Wird gespeichert..."
                  : editingId
                    ? "Änderungen speichern"
                    : "Gericht hinzufügen"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
