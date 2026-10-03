import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

let modePromise = null;

async function detectMode() {
  if (process.env.VERCEL || process.env.VERCEL_ENV) return "memory";

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const probe = path.join(DATA_DIR, `.write-test-${process.pid}`);
    await fs.writeFile(probe, "", "utf8");
    await fs.unlink(probe);
    return "file";
  } catch {
    return "memory";
  }
}

function getMode() {
  if (!modePromise) modePromise = detectMode();
  return modePromise;
}

const memory = new Map();

export async function readJson(name) {
  const mode = await getMode();

  if (mode === "memory") {
    return memory.has(name) ? structuredClone(memory.get(name)) : null;
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
    const parsed = JSON.parse(raw);
    return parsed ?? null;
  } catch {
    return null;
  }
}

export async function writeJson(name, value) {
  const mode = await getMode();

  if (mode === "memory") {
    memory.set(name, structuredClone(value));
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${name}.json`);
  const tempFile = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tempFile, file);
}
