const DB_NAME = 'expense-tracker-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface StoredImage {
  id: string;
  data: string; // Base64 image data
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveImage(id: string, imageData: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const image: StoredImage = {
        id,
        data: imageData,
        createdAt: new Date().toISOString(),
      };

      const request = store.put(image);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to save image:', error);
  }
}

export async function getImage(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        resolve(result?.data || null);
      };
    });
  } catch (error) {
    console.error('Failed to get image:', error);
    return null;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}

export async function deleteImages(ids: string[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      for (const id of ids) {
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          completed++;
          if (completed === ids.length) resolve();
        };
      }

      if (ids.length === 0) resolve();
    });
  } catch (error) {
    console.error('Failed to delete images:', error);
  }
}
