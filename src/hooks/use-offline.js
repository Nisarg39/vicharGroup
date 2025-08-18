import { useState, useEffect, useCallback } from 'react';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serviceWorker, setServiceWorker] = useState(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          setServiceWorker(registration);
          
          // Check if service worker is ready
          if (registration.active) {
            setIsServiceWorkerReady(true);
          } else {
            registration.addEventListener('activate', () => {
              setIsServiceWorkerReady(true);
            });
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Store data in IndexedDB for offline use
  const storeOfflineData = useCallback(async (key, data) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ExamPortalDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        const putRequest = store.put({ key, data, timestamp: Date.now() });
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to store data'));
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offlineData')) {
          db.createObjectStore('offlineData', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('submissions')) {
          db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }, []);

  // Retrieve data from IndexedDB
  const getOfflineData = useCallback(async (key) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ExamPortalDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['offlineData'], 'readonly');
        const store = transaction.objectStore('offlineData');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => resolve(getRequest.result?.data || null);
        getRequest.onerror = () => reject(new Error('Failed to retrieve data'));
      };
    });
  }, []);

  // Store offline submission
  const storeOfflineSubmission = useCallback(async (submission) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ExamPortalDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['submissions'], 'readwrite');
        const store = transaction.objectStore('submissions');
        const addRequest = store.add({
          ...submission,
          timestamp: Date.now(),
          syncStatus: 'pending'
        });
        
        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(new Error('Failed to store submission'));
      };
    });
  }, []);

  // Get all offline submissions
  const getOfflineSubmissions = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ExamPortalDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['submissions'], 'readonly');
        const store = transaction.objectStore('submissions');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
        getAllRequest.onerror = () => reject(new Error('Failed to retrieve submissions'));
      };
    });
  }, []);

  // Clear offline submissions
  const clearOfflineSubmissions = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ExamPortalDB', 1);
      
      request.onerror = () => reject(new Error('Failed to open IndexedDB'));
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['submissions'], 'readwrite');
        const store = transaction.objectStore('submissions');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(new Error('Failed to clear submissions'));
      };
    });
  }, []);

  // Trigger background sync
  const triggerBackgroundSync = useCallback(async () => {
    if (serviceWorker && 'sync' in serviceWorker) {
      try {
        await serviceWorker.sync.register('sync-exam-submissions');
        return true;
      } catch (error) {
        console.error('Background sync registration failed:', error);
        return false;
      }
    }
    return false;
  }, [serviceWorker]);

  // Cache exam data for offline use
  const cacheExamData = useCallback(async (examId, examData) => {
    if (serviceWorker && serviceWorker.active) {
      serviceWorker.active.postMessage({
        type: 'CACHE_EXAM_DATA',
        examId,
        examData
      });
    }
    
    // Also store in IndexedDB as backup
    await storeOfflineData(`exam_${examId}`, examData);
  }, [serviceWorker, storeOfflineData]);

  // Sync offline submissions with server
  const syncOfflineSubmissions = useCallback(async () => {
    if (!isOnline) {
      return { success: false, message: 'Cannot sync while offline' };
    }

    try {
      const submissions = await getOfflineSubmissions();
      
      if (submissions.length === 0) {
        return { success: true, message: 'No submissions to sync' };
      }

      const response = await fetch('/api/exam/sync-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissions })
      });

      if (response.ok) {
        const result = await response.json();
        await clearOfflineSubmissions();
        return { success: true, ...result };
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, message: error.message };
    }
  }, [isOnline, getOfflineSubmissions, clearOfflineSubmissions]);

  // Check if data is available offline
  const isDataAvailableOffline = useCallback(async (key) => {
    try {
      const data = await getOfflineData(key);
      return data !== null;
    } catch (error) {
      console.error('Error checking offline data availability:', error);
      return false;
    }
  }, [getOfflineData]);

  // Get offline storage usage
  const getOfflineStorageUsage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          percentage: estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
        };
      } catch (error) {
        console.error('Error getting storage usage:', error);
        return null;
      }
    }
    return null;
  }, []);

  return {
    isOnline,
    isServiceWorkerReady,
    serviceWorker,
    storeOfflineData,
    getOfflineData,
    storeOfflineSubmission,
    getOfflineSubmissions,
    clearOfflineSubmissions,
    triggerBackgroundSync,
    cacheExamData,
    syncOfflineSubmissions,
    isDataAvailableOffline,
    getOfflineStorageUsage
  };
} 