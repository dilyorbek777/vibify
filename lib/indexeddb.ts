const DB_NAME = 'VibifyOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'downloadedAudio';

interface DownloadedAudio {
  id: string;
  songId: string;
  songName: string;
  artist: string;
  album: string;
  coverArt: string;
  audioBlob: Blob;
  audioUrl: string;
  downloadedAt: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('songId', 'songId', { unique: true });
        }
      };
    });
  }

  async saveAudio(audioData: Omit<DownloadedAudio, 'id' | 'downloadedAt'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      const record: DownloadedAudio = {
        ...audioData,
        id: audioData.songId,
        downloadedAt: Date.now(),
      };

      const request = objectStore.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save audio to IndexedDB'));
    });
  }

  async getAudio(songId: string): Promise<DownloadedAudio | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('songId');
      const request = index.get(songId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get audio from IndexedDB'));
    });
  }

  async getAllDownloaded(): Promise<DownloadedAudio[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(new Error('Failed to get all downloaded audio'));
    });
  }

  async deleteAudio(songId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('songId');
      const request = index.getKey(songId);

      request.onsuccess = () => {
        if (request.result !== undefined) {
          const deleteRequest = objectStore.delete(request.result);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(new Error('Failed to delete audio from IndexedDB'));
        } else {
          resolve(); // Audio not found, nothing to delete
        }
      };
      request.onerror = () => reject(new Error('Failed to find audio in IndexedDB'));
    });
  }

  async isDownloaded(songId: string): Promise<boolean> {
    const audio = await this.getAudio(songId);
    return audio !== null;
  }
}

export const indexedDBManager = new IndexedDBManager();
export type { DownloadedAudio };
