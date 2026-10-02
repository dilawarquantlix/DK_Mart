"use server";

import { revalidatePath } from "next/cache";
import { createItem, updateItem, deleteItem } from "@/lib/items";

function readForm(formData) {
  const id = formData.get("id");
  return {
    id: id ? String(id) : null,
    name: formData.get("name"),
    unit: formData.get("unit"),
    price: formData.get("price"),
  };
}

export async function saveItemAction(_prevState, formData) {
  const input = readForm(formData);

  try {
    if (input.id) {
      await updateItem(input.id, input);
    } else {
      await createItem(input);
    }

    revalidatePath("/");
    revalidatePath("/items");
    return { ok: true, message: input.id ? "Item updated." : "Item added." };
  } catch (error) {
    return { ok: false, error: error.message || "Could not save the item." };
  }
}

export async function deleteItemAction(id) {
  try {
    await deleteItem(String(id));
    revalidatePath("/");
    revalidatePath("/items");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Could not delete the item." };
  }
}
