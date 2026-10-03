import { randomBytes } from "node:crypto";
import { getItems } from "./items";
import { readJson, writeJson } from "./store";

let queue = Promise.resolve();

function enqueue(work) {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readOrders() {
  const stored = await readJson("orders");
  return Array.isArray(stored) ? stored : [];
}

async function writeOrders(orders) {
  await writeJson("orders", orders);
}

async function buildLineItems(lineItems) {
  const catalog = await getItems();
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const seen = new Set();
  const result = [];

  for (const line of Array.isArray(lineItems) ? lineItems : []) {
    const item = byId.get(String(line?.id));
    if (!item || seen.has(item.id)) continue;

    const quantity = Number(line?.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    const rounded = Math.min(Math.round(quantity * 100) / 100, 10000);

    result.push({
      id: item.id,
      name: item.name,
      unit: item.unit,
      price: item.price,
      quantity: rounded,
      lineTotal: Math.round(rounded * item.price * 100) / 100,
    });
    seen.add(item.id);
  }

  return result;
}

export function createOrder(lineItems) {
  return enqueue(async () => {
    const items = await buildLineItems(lineItems);
    if (items.length === 0) {
      throw new Error("Add at least one item to the order.");
    }

    const total =
      Math.round(
        items.reduce((sum, item) => sum + item.lineTotal, 0) * 100
      ) / 100;

    const order = {
      id: randomBytes(5).toString("hex"),
      items,
      total,
      createdAt: new Date().toISOString(),
    };

    const orders = await readOrders();
    orders.unshift(order);
    await writeOrders(orders.slice(0, 200));
    return order;
  });
}

export function getOrder(id) {
  return enqueue(async () => {
    const orders = await readOrders();
    return orders.find((order) => order.id === id) ?? null;
  });
}
