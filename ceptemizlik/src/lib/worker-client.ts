import type { WorkerRequest, WorkerResponse } from './core';

type RequestWithoutId = WorkerRequest extends infer R ? (R extends WorkerRequest ? Omit<R, 'id'> : never) : never;

type Pending = { request: WorkerRequest; resolve: (value: WorkerResponse) => void; timer: number };

let worker: Worker | null = null;
let workerUnavailable = false;
let sequence = 0;
const pending = new Map<number, Pending>();

const TIMEOUT_MS = 180_000;

async function runOnMainThread(request: WorkerRequest): Promise<WorkerResponse> {
  const core = await import('./core');
  return (await core.handleRequest(request)).response;
}

function settle(id: number, response: WorkerResponse) {
  const entry = pending.get(id);
  if (!entry) return;
  window.clearTimeout(entry.timer);
  pending.delete(id);
  entry.resolve(response);
}

function failWorker() {
  workerUnavailable = true;
  worker?.terminate();
  worker = null;
  // Worker hiç açılamadıysa (eski WebView, modül worker desteği yok) bekleyen işleri ana iş parçacığında çalıştır.
  const waiting = [...pending.entries()];
  pending.clear();
  for (const [, entry] of waiting) {
    window.clearTimeout(entry.timer);
    void runOnMainThread(entry.request).then(entry.resolve);
  }
}

function getWorker(): Worker | null {
  if (workerUnavailable || typeof Worker === 'undefined') return null;
  if (worker) return worker;
  try {
    const created = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
    created.onmessage = (event: MessageEvent<WorkerResponse>) => settle(event.data.id, event.data);
    created.onerror = (event) => { event.preventDefault(); failWorker(); };
    created.onmessageerror = () => failWorker();
    worker = created;
    return created;
  } catch {
    workerUnavailable = true;
    return null;
  }
}

/** İsteği worker'a gönderir; veri kopyalanır (aktarılmaz) ki worker çökerse ana iş parçacığında tekrar denenebilsin. */
export function callWorker(request: RequestWithoutId): Promise<WorkerResponse> {
  const id = ++sequence;
  const full = { ...request, id } as WorkerRequest;
  const target = getWorker();
  if (!target) return runOnMainThread(full);
  return new Promise<WorkerResponse>((resolve) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      resolve({ id, ok: false, message: 'İşlem çok uzun sürdü ve durduruldu. Daha küçük bir fotoğrafla tekrar deneyin.' });
      // Takılmış worker'ı yenile.
      worker?.terminate();
      worker = null;
    }, TIMEOUT_MS);
    pending.set(id, { request: full, resolve, timer });
    try {
      target.postMessage(full);
    } catch {
      window.clearTimeout(timer);
      pending.delete(id);
      void runOnMainThread(full).then(resolve);
    }
  });
}
