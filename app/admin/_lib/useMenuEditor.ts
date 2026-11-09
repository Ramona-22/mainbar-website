import { useState, type FormEvent } from "react";
import { addDoc, updateDoc, collection, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { isExtraItem } from "../../../lib/menuOrder";
import { emptyMenuForm, menuCategories, type MenuForm, type MenuItem } from "./types";

// State and handlers for the menu add/edit modal.
export function useMenuEditor() {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenuForm);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  // Category and list of the item being edited, to spot a move between tabs.
  const [editingOriginal, setEditingOriginal] =
    useState<{ category?: string; isExtra: boolean } | null>(null);

  const resetMenuForm = () => {
    setMenuForm(emptyMenuForm());
    setEditingId(null);
    setEditingOriginal(null);
    setIsMenuModalOpen(false);
  };

  const openNewItem = () => {
    resetMenuForm();
    setIsMenuModalOpen(true);
  };

  const handleMenuSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSavingMenu) return;
    setIsSavingMenu(true);
    try {
      const cleanedSizes = menuForm.sizes
        .map((s) => ({ label: s.label.trim(), price: s.price.trim() }))
        .filter((s) => s.label && s.price);

      const payload = {
        ...menuForm,
        name: menuForm.name.trim(),
        price: menuForm.price.trim(),
        description: menuForm.description.trim(),
        name_en: menuForm.name_en.trim(),
        description_en: menuForm.description_en.trim(),
        sizes: cleanedSizes.length > 0 ? cleanedSizes : null,
      };

      // A new item, or one moved to another tab or list, goes to the end of
      // its list: a timestamp is always larger than the saved positions.
      if (editingId) {
        const moved =
          editingOriginal &&
          (editingOriginal.category !== payload.category ||
            editingOriginal.isExtra !== payload.isExtra);
        await updateDoc(
          doc(db, "menu", editingId),
          moved ? { ...payload, order: Date.now() } : payload
        );
      } else {
        await addDoc(collection(db, "menu"), { ...payload, order: Date.now() });
      }
      resetMenuForm();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern.");
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setMenuForm({
      category: item.category || menuCategories[0],
      name: item.name || "",
      description: item.description || "",
      name_en: item.name_en || "",
      description_en: item.description_en || "",
      price: item.price || "",
      image_url: item.image_url || "",
      isExtra: isExtraItem(item.isExtra),
      sizes: item.sizes || [],
    });
    setEditingId(item.id);
    setEditingOriginal({ category: item.category, isExtra: isExtraItem(item.isExtra) });
    setIsMenuModalOpen(true);
  };

  // Size helpers
  const addSizeRow = () => {
    setMenuForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { label: "", price: "" }],
    }));
  };

  const updateSizeRow = (
    index: number,
    field: "label" | "price",
    value: string
  ) => {
    setMenuForm((prev) => {
      const newSizes = [...prev.sizes];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return { ...prev, sizes: newSizes };
    });
  };

  const removeSizeRow = (index: number) => {
    setMenuForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  return {
    isMenuModalOpen,
    setIsMenuModalOpen,
    editingId,
    setEditingId,
    menuForm,
    setMenuForm,
    isSavingMenu,
    resetMenuForm,
    openNewItem,
    handleMenuSubmit,
    handleEditClick,
    addSizeRow,
    updateSizeRow,
    removeSizeRow,
  };
}

export type MenuEditorState = ReturnType<typeof useMenuEditor>;
