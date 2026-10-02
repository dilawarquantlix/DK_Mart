import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getItems } from "./items";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "orders.json");

let queue = Promise.resolve();

function enqueue(work) {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readOrders() {
  await ensureFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(orders, null, 2), "utf8");
  await fs.rename(tempFile, DATA_FILE);
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
