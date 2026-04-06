import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem } from '../../services/accounts/storage/localStorage';

export const useLocalStorage = (key, initialValue, encrypt = false) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = getItem(key, encrypt);
            if (item !== null) {
                return item;
            }
            return initialValue;
        } catch (error) {
            console.error('useLocalStorage read error:', error);
            return initialValue;
        }
    });
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            setItem(key, valueToStore, encrypt);
        } catch (error) {
            console.error('useLocalStorage write item:', error);
        }
    }, [key, storedValue, encrypt]);
    const removeValue = useCallback(() => {
        try {
            removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error('useLocalStorage remove error:', error);
        }
    }, [key, initialValue]);
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch {
                    setStoredValue(e.newValue);
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);   
    return [storedValue, setValue, removeValue];
}