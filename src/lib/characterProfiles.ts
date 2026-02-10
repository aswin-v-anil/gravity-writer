// Character sample storage and processing utilities for custom handwriting generation

export interface CharacterSample {
    char: string;
    imageData: string; // Base64 encoded image
    width: number;
    height: number;
    createdAt: number;
}

export interface HandwritingProfile {
    id: string;
    name: string;
    characters: Record<string, CharacterSample[]>; // Multiple samples per character
    createdAt: number;
    updatedAt: number;
}

// All characters that should be sampled
export const SAMPLE_CHARACTERS = [
    // Uppercase
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    // Lowercase
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
    // Numbers
    ...'0123456789'.split(''),
    // Common punctuation
    ...'.,:;!?\'"-()'.split(''),
];

// IndexedDB storage for profiles
const DB_NAME = 'HandwritingProfilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'profiles';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

export async function saveProfile(profile: HandwritingProfile): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put({
            ...profile,
            updatedAt: Date.now(),
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getProfile(id: string): Promise<HandwritingProfile | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function getAllProfiles(): Promise<HandwritingProfile[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteProfile(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Create a new profile
export function createProfile(name: string): HandwritingProfile {
    return {
        id: `profile_${Date.now()}`,
        name,
        characters: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

// Add a character sample to a profile
export function addCharacterSample(
    profile: HandwritingProfile,
    char: string,
    imageData: string,
    width: number,
    height: number
): HandwritingProfile {
    const sample: CharacterSample = {
        char,
        imageData,
        width,
        height,
        createdAt: Date.now(),
    };

    const existingSamples = profile.characters[char] || [];

    return {
        ...profile,
        characters: {
            ...profile.characters,
            [char]: [...existingSamples, sample],
        },
        updatedAt: Date.now(),
    };
}

// Get a random sample for a character (for variation when rendering)
export function getRandomSample(profile: HandwritingProfile, char: string): CharacterSample | null {
    const samples = profile.characters[char];
    if (!samples || samples.length === 0) return null;
    return samples[Math.floor(Math.random() * samples.length)];
}

// Calculate completion percentage
export function getCompletionPercentage(profile: HandwritingProfile): number {
    const sampledChars = Object.keys(profile.characters).filter(
        (char) => profile.characters[char].length > 0
    ).length;
    return Math.round((sampledChars / SAMPLE_CHARACTERS.length) * 100);
}
