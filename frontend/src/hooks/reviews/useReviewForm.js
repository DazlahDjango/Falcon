// src/hooks/reviews/useReviewForm.js
// Hook for form handling in reviews

import { useState, useCallback } from 'react';

export const useReviewForm = (initialValues = {}, onSubmit) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Handle input change
    const handleChange = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [errors]);

    // Handle input blur
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    // Set field error
    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    // Set multiple values at once
    const setValuesBulk = useCallback((newValues) => {
        setValues(prev => ({ ...prev, ...newValues }));
        setIsDirty(true);
    }, []);

    // Reset form to initial values
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);
        setIsSubmitting(false);
    }, [initialValues]);

    // Validate a single field
    const validateField = useCallback((name, value, validators = []) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) {
                setFieldError(name, error);
                return error;
            }
        }
        setFieldError(name, undefined);
        return undefined;
    }, [setFieldError]);

    // Validate all fields
    const validateForm = useCallback((validationSchema) => {
        const newErrors = {};
        let isValid = true;

        for (const [field, validators] of Object.entries(validationSchema)) {
            const value = values[field];
            for (const validator of validators) {
                const error = validator(value);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                    break;
                }
            }
        }

        setErrors(newErrors);
        return isValid;
    }, [values]);

    // Submit form
    const handleSubmit = useCallback(async (validationSchema) => {
        if (validationSchema) {
            const isValid = validateForm(validationSchema);
            if (!isValid) {
                return false;
            }
        }

        setIsSubmitting(true);
        try {
            const result = await onSubmit(values);
            setIsDirty(false);
            return result;
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            }
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [values, onSubmit, validateForm]);

    // Check if field has error and is touched
    const hasError = useCallback((name) => {
        return touched[name] && !!errors[name];
    }, [touched, errors]);

    // Get error message for field
    const getError = useCallback((name) => {
        return touched[name] ? errors[name] : undefined;
    }, [touched, errors]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isDirty,
        handleChange,
        handleBlur,
        handleSubmit,
        setValues: setValuesBulk,
        setFieldError,
        resetForm,
        validateField,
        validateForm,
        hasError,
        getError,
    };
};

// Common validators
export const validators = {
    required: (message = 'This field is required') => (value) => {
        if (value === undefined || value === null || value === '') {
            return message;
        }
        return undefined;
    },
    
    minLength: (min, message) => (value) => {
        if (value && value.length < min) {
            return message || `Must be at least ${min} characters`;
        }
        return undefined;
    },
    
    maxLength: (max, message) => (value) => {
        if (value && value.length > max) {
            return message || `Must be at most ${max} characters`;
        }
        return undefined;
    },
    
    min: (min, message) => (value) => {
        if (value !== undefined && value !== null && value < min) {
            return message || `Must be at least ${min}`;
        }
        return undefined;
    },
    
    max: (max, message) => (value) => {
        if (value !== undefined && value !== null && value > max) {
            return message || `Must be at most ${max}`;
        }
        return undefined;
    },
    
    email: (message = 'Invalid email address') => (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return message;
        }
        return undefined;
    },
    
    pattern: (regex, message) => (value) => {
        if (value && !regex.test(value)) {
            return message;
        }
        return undefined;
    },
};