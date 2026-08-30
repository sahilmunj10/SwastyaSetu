import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOfflineQueue, addOfflineItem, clearOfflineQueue, OfflineQueueItem } from '../services/offlineStorage';
import { api } from '../services/api';

interface OfflineSyncContextType {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  toggleConnectivity: () => void;
  queue: OfflineQueueItem[];
  queueCount: number;
  isSyncing: boolean;
  lastSyncMessage: string | null;
  addOfflineRecord: (type: 'REGISTER_PATIENT' | 'RECORD_VITALS', payload: any) => Promise<void>;
  syncNow: () => Promise<{ success: boolean; count: number; message: string }>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const refreshQueue = async () => {
    const items = await getOfflineQueue();
    setQueue(items);
  };

  useEffect(() => {
    refreshQueue();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleConnectivity = () => {
    setIsOnline(prev => !prev);
  };

  const addOfflineRecord = async (type: 'REGISTER_PATIENT' | 'RECORD_VITALS', payload: any) => {
    await addOfflineItem(type, payload);
    await refreshQueue();
  };

  const syncNow = async () => {
    const currentQueue = await getOfflineQueue();
    if (currentQueue.length === 0) {
      return { success: true, count: 0, message: 'No offline records waiting for sync.' };
    }

    setIsSyncing(true);
    try {
      const res = await api.syncOfflineBatch(currentQueue);
      await clearOfflineQueue();
      await refreshQueue();
      const msg = `Successfully synchronized ${res.syncedCount} records with central health server.`;
      setLastSyncMessage(msg);
      return { success: true, count: res.syncedCount, message: msg };
    } catch (err: any) {
      const errMessage = err.message || 'Sync failed due to network error.';
      setLastSyncMessage(`Sync error: ${errMessage}`);
      return { success: false, count: 0, message: errMessage };
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <OfflineSyncContext.Provider
      value={{
        isOnline,
        setIsOnline,
        toggleConnectivity,
        queue,
        queueCount: queue.length,
        isSyncing,
        lastSyncMessage,
        addOfflineRecord,
        syncNow
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  return context;
}
