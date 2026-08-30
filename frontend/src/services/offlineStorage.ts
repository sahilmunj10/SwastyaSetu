import { get, set } from 'idb-keyval';

const OFFLINE_QUEUE_KEY = 'swasthya_setu_offline_queue';

export interface OfflineQueueItem {
  id: string;
  type: 'REGISTER_PATIENT' | 'RECORD_VITALS';
  payload: any;
  timestamp: string;
}

export async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const queue = await get<OfflineQueueItem[]>(OFFLINE_QUEUE_KEY);
    return queue || [];
  } catch (err) {
    const local = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return local ? JSON.parse(local) : [];
  }
}

export async function addOfflineItem(type: 'REGISTER_PATIENT' | 'RECORD_VITALS', payload: any): Promise<OfflineQueueItem> {
  const item: OfflineQueueItem = {
    id: `off_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString()
  };

  const queue = await getOfflineQueue();
  queue.push(item);

  try {
    await set(OFFLINE_QUEUE_KEY, queue);
  } catch (err) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  return item;
}

export async function clearOfflineQueue(): Promise<void> {
  try {
    await set(OFFLINE_QUEUE_KEY, []);
  } catch (err) {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }
}
