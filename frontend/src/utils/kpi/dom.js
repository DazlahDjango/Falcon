/**
 * DOM Utilities
 * Functions for DOM manipulation
 */

/**
 * Scroll to element
 * @param {string|HTMLElement} element - Element ID or DOM element
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
    const el = typeof element === 'string' 
        ? document.getElementById(element) 
        : element;
    
    if (!el) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        ...options
    };
    
    el.scrollIntoView(defaultOptions);
};

/**
 * Get element position relative to viewport
 * @param {HTMLElement} element - DOM element
 * @returns {Object} Position coordinates
 */
export const getElementPosition = (element) => {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX,
    };
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - DOM element
 * @param {number} offset - Offset from viewport
 * @returns {boolean} Whether element is visible
 */
export const isElementInViewport = (element, offset = 0) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -offset &&
        rect.left >= -offset &&
        rect.bottom <= (window.innerHeight + offset) &&
        rect.right <= (window.innerWidth + offset)
    );
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text:', err);
        return false;
    }
};

/**
 * Focus element
 * @param {string|HTMLElement} element - Element ID or DOM element
 */
export const focusElement = (element) => {
    const el = typeof element === 'string' 
        ? document.getElementById(element) 
        : element;
    
    if (el) {
        el.focus();
        // Optional: select content for input elements
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.select();
        }
    }
};

/**
 * Get scrollbar width
 * @returns {number} Scrollbar width in pixels
 */
export const getScrollbarWidth = () => {
    const div = document.createElement('div');
    div.style.overflow = 'scroll';
    div.style.width = '50px';
    div.style.height = '50px';
    document.body.appendChild(div);
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return scrollbarWidth;
};

/**
 * Lock body scroll
 */
export const lockBodyScroll = () => {
    const scrollbarWidth = getScrollbarWidth();
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
};

/**
 * Unlock body scroll
 */
export const unlockBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};