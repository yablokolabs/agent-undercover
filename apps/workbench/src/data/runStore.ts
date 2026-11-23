import type { RunRecord } from "@undercover/harness";

const DB_NAME = "agent-undercover";
const DB_VERSION = 1;
const RUN_STORE = "runs";
const VERSION_STORE = "targetVersions";

export interface TargetConfigRecord {
  key: string;
  origin: string;
  networkName: string;
  versionNumber: number;
  label: string;
  networkHash: string;
  createdAt: string;
  action: "reviewed-repair";
}

let memoryRuns: RunRecord[] = [];
let memoryVersions: TargetConfigRecord[] = [];
let idbUnavailable = false;

function canUseIndexedDb(): boolean {
  return typeof indexedDB !== "undefined" && !idbUnavailable;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed."));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RUN_STORE)) {
        const store = db.createObjectStore(RUN_STORE, { keyPath: "runId" });
        store.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(VERSION_STORE)) {
        db.createObjectStore(VERSION_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function assertSanitized(record: RunRecord): void {
  const text = JSON.stringify(record);
  if (/UC-[A-Z2-9]{20}/.test(text)) throw new Error("Refusing to persist a record containing a canary value.");
  if (/Bearer\s+(?!\[REDACTED\])[A-Za-z0-9._~+/=-]{12,}/i.test(text)) {
    throw new Error("Refusing to persist a bearer credential.");
  }
}

export async function saveRun(record: RunRecord): Promise<void> {
  assertSanitized(record);
  if (!canUseIndexedDb()) {
    memoryRuns = [record, ...memoryRuns.filter((item) => item.runId !== record.runId)].slice(0, 50);
    return;
  }
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RUN_STORE, "readwrite");
      tx.objectStore(RUN_STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    idbUnavailable = true;
    memoryRuns = [record, ...memoryRuns.filter((item) => item.runId !== record.runId)].slice(0, 50);
  }
}

export async function listRuns(): Promise<RunRecord[]> {
  if (!canUseIndexedDb()) return [...memoryRuns].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  try {
    const db = await openDb();
    const runs = await new Promise<RunRecord[]>((resolve, reject) => {
      const tx = db.transaction(RUN_STORE, "readonly");
      const request = tx.objectStore(RUN_STORE).getAll();
      request.onsuccess = () => resolve(request.result as RunRecord[]);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    idbUnavailable = true;
    return [...memoryRuns].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function deleteRun(runId: string): Promise<void> {
  if (!canUseIndexedDb()) {
    memoryRuns = memoryRuns.filter((run) => run.runId !== runId);
    return;
  }
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RUN_STORE, "readwrite");
      tx.objectStore(RUN_STORE).delete(runId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    memoryRuns = memoryRuns.filter((run) => run.runId !== runId);
  }
}

export async function clearRuns(): Promise<void> {
  memoryRuns = [];
  if (!canUseIndexedDb()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RUN_STORE, "readwrite");
      tx.objectStore(RUN_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Memory fallback already cleared.
  }
}

export async function saveTargetConfig(record: TargetConfigRecord): Promise<void> {
  const key = `${record.origin}::${record.networkName}`;
  const value = { ...record, key };
  memoryVersions = [value, ...memoryVersions.filter((item) => item.key !== key)];
  if (!canUseIndexedDb()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VERSION_STORE, "readwrite");
      tx.objectStore(VERSION_STORE).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Memory fallback already set.
  }
}

export async function listTargetConfigs(): Promise<TargetConfigRecord[]> {
  if (!canUseIndexedDb()) return [...memoryVersions];
  try {
    const db = await openDb();
    const values = await new Promise<TargetConfigRecord[]>((resolve, reject) => {
      const tx = db.transaction(VERSION_STORE, "readonly");
      const request = tx.objectStore(VERSION_STORE).getAll();
      request.onsuccess = () => resolve(request.result as TargetConfigRecord[]);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return values;
  } catch {
    return [...memoryVersions];
  }
}
