/**
 * IndexedDB utilities for large data storage
 */

const DB_NAME = 'KPI_DB';
const DB_VERSION = 1;

let db = null;

/**
 * Open IndexedDB connection
 * @returns {Promise<IDBDatabase>} Database instance
 */
export const openDB = () => {
    return new Promise((resolve, reject) => {
        if (db && db.name === DB_NAME) {
            resolve(db);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            
            // Create object stores
            if (!database.objectStoreNames.contains('kpis')) {
                database.createObjectStore('kpis', { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains('scores')) {
                database.createObjectStore('scores', { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains('cache')) {
                database.createObjectStore('cache', { keyPath: 'key' });
            }
            if (!database.objectStoreNames.contains('offlineData')) {
                database.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
};

/**
 * Store data in IndexedDB
 * @param {string} storeName - Object store name
 * @param {any} data - Data to store
 * @returns {Promise<void>}
 */
export const storeData = async (storeName, data) => {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

/**
 * Get data from IndexedDB
 * @param {string} storeName - Object store name
 * @param {string} key - Record key
 * @returns {Promise<any>} Stored data
 */
export const getData = async (storeName, key) => {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

/**
 * Get all data from store
 * @param {string} storeName - Object store name
 * @returns {Promise<Array>} All records
 */
export const getAllData = async (storeName) => {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

/**
 * Delete data from IndexedDB
 * @param {string} storeName - Object store name
 * @param {string} key - Record key
 * @returns {Promise<void>}
 */
export const deleteData = async (storeName, key) => {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

/**
 * Clear all data from store
 * @param {string} storeName - Object store name
 * @returns {Promise<void>}
 */
export const clearStore = async (storeName) => {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

/**
 * Cache API response
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<void>}
 */
export const cacheResponse = async (key, data, ttl = 300000) => {
    const cacheData = {
        key,
        data,
        expires: Date.now() + ttl
    };
    await storeData('cache', cacheData);
};

/**
 * Get cached response
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached data or null if expired
 */
export const getCachedResponse = async (key) => {
    const cached = await getData('cache', key);
    if (!cached) return null;
    if (cached.expires < Date.now()) {
        await deleteData('cache', key);
        return null;
    }
    return cached.data;
};