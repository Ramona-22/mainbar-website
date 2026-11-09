import { useState, type FormEvent } from "react";
import { addDoc, updateDoc, collection, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { emptyMenuForm, menuCategories, type MenuForm, type MenuItem } from "./types";

// State and handlers for the menu add/edit modal.
export function useMenuEditor() {
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState<MenuForm>(emptyMenuForm);
  const [isSavingMenu, setIsSavingMenu] = useState(false);

  const resetMenuForm = () => {
    setMenuForm(emptyMenuForm());
    setEditingId(null);
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
        sizes: cleanedSizes.length > 0 ? cleanedSizes : null,
      };

      if (editingId) {
        await updateDoc(doc(db, "menu", editingId), payload);
      } else {
        await addDoc(collection(db, "menu"), payload);
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
      price: item.price || "",
      image_url: item.image_url || "",
      isExtra: !!item.isExtra,
      sizes: item.sizes || [],
    });
    setEditingId(item.id);
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
