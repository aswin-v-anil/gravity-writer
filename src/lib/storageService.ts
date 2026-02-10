
interface StoredItem {
    id: string;
    [key: string]: any;
}

const DB_NAME = "GravityWriterDB";
const DB_VERSION = 1;
const STYLES_STORE = "handwriting_styles";
const WORK_STORE = "exam_work_history";

export class StorageService {
    private dbPromise: Promise<IDBDatabase>;

    constructor() {
        this.dbPromise = new Promise((resolve, reject) => {
            if (typeof window === "undefined") return; // SSR check

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject("Error opening DB");

            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STYLES_STORE)) {
                    db.createObjectStore(STYLES_STORE, { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains(WORK_STORE)) {
                    db.createObjectStore(WORK_STORE, { keyPath: "id" });
                }
            };
        });
    }

    async saveStyle(style: any): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STYLES_STORE, "readwrite");
            const store = tx.objectStore(STYLES_STORE);
            const req = store.put(style);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async getStyles(): Promise<any[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STYLES_STORE, "readonly");
            const store = tx.objectStore(STYLES_STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async deleteStyle(id: string): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STYLES_STORE, "readwrite");
            tx.objectStore(STYLES_STORE).delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async saveWork(work: any): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(WORK_STORE, "readwrite");
            tx.objectStore(WORK_STORE).put(work);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    async getHistory(): Promise<any[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(WORK_STORE, "readonly");
            const store = tx.objectStore(WORK_STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
}

export const storageService = new StorageService();
