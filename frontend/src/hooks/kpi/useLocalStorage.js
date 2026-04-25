import { useState, useEffect } from 'react';
import * as localStorage from '../../services/accounts/storage/localStorage'
/**
 * useLocalStorage - Hook for persistent state with localStorage
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 */
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return initialValue;
        }
    });
    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    };
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    };
    return [storedValue, setValue, removeValue];
};
export default useLocalStorage;