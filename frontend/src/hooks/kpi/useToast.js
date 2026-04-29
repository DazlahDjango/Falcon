import { useCallback } from 'react';

const useToast = () => {
    const showToast = useCallback((message, type = 'info', options = {}) => {
        // This is a placeholder - integrate with your actual toast library
        // Example with react-hot-toast:
        // import toast from 'react-hot-toast';
        // 
        // switch (type) {
        //     case 'success':
        //         toast.success(message, options);
        //         break;
        //     case 'error':
        //         toast.error(message, options);
        //         break;
        //     case 'warning':
        //         toast(message, { icon: '⚠️', ...options });
        //         break;
        //     default:
        //         toast(message, options);
        // }
        
        console.log(`[${type.toUpperCase()}]`, message);
    }, []);

    const success = useCallback((message, options = {}) => {
        showToast(message, 'success', options);
    }, [showToast]);

    const error = useCallback((message, options = {}) => {
        showToast(message, 'error', options);
    }, [showToast]);

    const warning = useCallback((message, options = {}) => {
        showToast(message, 'warning', options);
    }, [showToast]);

    const info = useCallback((message, options = {}) => {
        showToast(message, 'info', options);
    }, [showToast]);

    return {
        showToast,
        success,
        error,
        warning,
        info
    };
};

export default useToast;