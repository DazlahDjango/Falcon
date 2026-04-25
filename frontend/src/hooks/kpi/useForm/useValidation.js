import { useState, useCallback } from 'react';

const useValidation = (initialErrors = {}) => {
    const [errors, setErrors] = useState(initialErrors);
    const [isValid, setIsValid] = useState(true);
    const validateField = useCallback((field, value, rules) => {
        if (!rules) return null;
        for (const rule of rules) {
            const error = rule(value);
            if (error) return error;
        }
        return null;
    }, []);
    const validateForm = useCallback((values, validationSchema) => {
        const newErrors = {};
        let formIsValid = true;
        for (const field in validationSchema) {
            const error = validateField(field, values[field], validationSchema[field]);
            if (error) {
                newErrors[field] = error;
                formIsValid = false;
            }
        }  
        setErrors(newErrors);
        setIsValid(formIsValid);
        return { isValid: formIsValid, errors: newErrors };
    }, [validateField]);
    const setFieldError = useCallback((field, error) => {
        setErrors(prev => ({ ...prev, [field]: error }));
        setIsValid(false);
    }, []);
    const clearFieldError = useCallback((field) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);
    const clearErrors = useCallback(() => {
        setErrors({});
        setIsValid(true);
    }, []);
    return {
        errors,
        isValid,
        validateForm,
        setFieldError,
        clearFieldError,
        clearErrors
    };
};
export default useValidation;