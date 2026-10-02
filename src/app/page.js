import AppShell from "@/components/AppShell";
import ShopCalculator from "@/components/ShopCalculator";
import { getItems } from "@/lib/items";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getItems();

  return (
    <AppShell active="shop">
      <ShopCalculator items={items} />
    </AppShell>
  );
}
