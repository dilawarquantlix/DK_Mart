import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { DEFAULT_ITEMS } from "./shop-config";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "items.json");

let queue = Promise.resolve();

function enqueue(work) {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function seedItems() {
  const now = new Date().toISOString();
  const used = new Set();

  return DEFAULT_ITEMS.map((item) => {
    let id = slugify(item.name) || randomBytes(4).toString("hex");
    while (used.has(id)) id = `${id}-${randomBytes(2).toString("hex")}`;
    used.add(id);

    return { id, ...item, createdAt: now, updatedAt: now };
  });
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(seedItems(), null, 2), "utf8");
  }
}

async function readItems() {
  await ensureFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeItems(items) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(items, null, 2), "utf8");
  await fs.rename(tempFile, DATA_FILE);
}

function normalize(input = {}) {
  const name = String(input.name ?? "").trim();
  if (!name) return { error: "Item name is required." };
  if (name.length > 60) {
    return { error: "Item name must be 60 characters or fewer." };
  }

  const unit = String(input.unit ?? "").trim() || "piece";
  if (unit.length > 20) {
    return { error: "Unit must be 20 characters or fewer." };
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "Price must be a number greater than 0." };
  }
  if (price > 10000000) {
    return { error: "Price looks too large." };
  }

  return {
    value: { name, unit, price: Math.round(price * 100) / 100 },
  };
}

function definedEntries(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  );
}

export function getItems() {
  return enqueue(readItems);
}

export function createItem(input) {
  return enqueue(async () => {
    const { error, value } = normalize(input);
    if (error) throw new Error(error);

    const items = await readItems();
    const now = new Date().toISOString();

    let id = slugify(value.name) || randomBytes(4).toString("hex");
    while (items.some((item) => item.id === id)) {
      id = `${slugify(value.name) || "item"}-${randomBytes(2).toString("hex")}`;
    }

    const item = { id, ...value, createdAt: now, updatedAt: now };
    items.push(item);
    await writeItems(items);
    return item;
  });
}

export function updateItem(id, input) {
  return enqueue(async () => {
    const items = await readItems();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("Item not found.");

    const merged = { ...items[index], ...definedEntries(input) };
    const { error, value } = normalize(merged);
    if (error) throw new Error(error);

    const updated = {
      ...items[index],
      ...value,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    await writeItems(items);
    return updated;
  });
}

export function deleteItem(id) {
  return enqueue(async () => {
    const items = await readItems();
    const remaining = items.filter((item) => item.id !== id);
    if (remaining.length === items.length) throw new Error("Item not found.");

    await writeItems(remaining);
    return { id };
  });
}
