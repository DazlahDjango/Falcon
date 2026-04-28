import { useEffect, useState } from 'react';

/**
 * useKeyPress - Hook to detect key presses
 * @param {string|string[]} targetKey - Key(s) to detect
 * @returns {boolean} Whether key is pressed
 */
const useKeyPress = (targetKey) => {
    const [keyPressed, setKeyPressed] = useState(false);

    useEffect(() => {
        const keys = Array.isArray(targetKey) ? targetKey : [targetKey];
        
        const downHandler = ({ key }) => {
            if (keys.includes(key)) {
                setKeyPressed(true);
            }
        };

        const upHandler = ({ key }) => {
            if (keys.includes(key)) {
                setKeyPressed(false);
            }
        };

        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [targetKey]);

    return keyPressed;
};

export default useKeyPress;