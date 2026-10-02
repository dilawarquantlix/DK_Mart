import AppShell from "@/components/AppShell";
import ItemManager from "@/components/ItemManager";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Items — DK Mart",
  description: "Add, edit and remove the products in your shop.",
};

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <AppShell active="items">
      <ItemManager items={items} />
    </AppShell>
  );
}
