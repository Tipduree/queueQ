export type PendingQueueAction =
  | { type: "open" }
  | { type: "withService"; serviceId: string };

const PENDING_QUEUE_KEY = "suanbai_pending_queue_action";

export function savePendingQueueAction(action: PendingQueueAction): void {
  localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(action));
}

export function consumePendingQueueAction(): PendingQueueAction | null {
  const raw = localStorage.getItem(PENDING_QUEUE_KEY);
  if (!raw) return null;
  localStorage.removeItem(PENDING_QUEUE_KEY);
  try {
    return JSON.parse(raw) as PendingQueueAction;
  } catch {
    return null;
  }
}
