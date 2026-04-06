import React, { useState, useCallback } from 'react';

const Form = ({
    initialValues = {},
    validationSchema = null,
    onSubmit,
    onError,
    children,
    className = '',
    validateOnChange = true,
    validateOnBlur = true,
    ...props
}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const validate = useCallback(async (formValues, field = null) => {
        if (!validationSchema) return {};
        try {
            if (field) {
                await validationSchema.validateAt(field, formValues);
                setErrors(prev => ({ ...prev, [field]: null }));
                return {};
            } else {
                // Validate all fields
                await validationSchema.validate(formValues, { abortEarly: false });
                setErrors({});
                setIsValid(true);
                return {};
            }
        } catch (err) {
            if (err.inner) {
                const validationErrors = {};
                err.inner.forEach(error => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
                setIsValid(false);
                return validationErrors;
            } else if (err.path) {
                setErrors(prev => ({ ...prev, [err.path]: err.message }));
                setIsValid(false);
                return { [err.path]: err.message };
            }
            return {};
        }
    }, [validationSchema]);
    // Handle field change
    const handleChange = useCallback(async (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setValues(prev => ({ ...prev, [name]: newValue }));
        
        if (validateOnChange) {
            await validate({ ...values, [name]: newValue }, name);
        }
    }, [values, validate, validateOnChange]);
    // Handle field blur
    const handleBlur = useCallback(async (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        if (validateOnBlur) {
            await validate(values, name);
        }
    }, [values, validate, validateOnBlur]);
    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        // Validate all fields
        const validationErrors = await validate(values);
        if (Object.keys(validationErrors).length > 0) {
            // Mark all fields as touched
            const allTouched = {};
            Object.keys(values).forEach(key => {
                allTouched[key] = true;
            });
            setTouched(allTouched);
            
            if (onError) {
                onError(validationErrors);
            }
            return;
        }
        setIsSubmitting(true);
        
        try {
            await onSubmit(values);
        } catch (error) {
            if (onError) {
                onError(error);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validate, onSubmit, onError, isSubmitting]);
    // Reset form
    const resetForm = useCallback((newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
        setIsValid(true);
    }, [initialValues]);
    // Set field value programmatically
    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        if (validateOnChange) {
            validate({ ...values, [name]: value }, name);
        }
    }, [values, validate, validateOnChange]);
    // Set field error programmatically
    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
        setIsValid(false);
    }, []);
    const formContext = {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldError,
        resetForm
    };
    return (
        <form
            className={`form ${className}`}
            onSubmit={handleSubmit}
            noValidate
            {...props}
        >
            {typeof children === 'function' 
                ? children(formContext) 
                : React.cloneElement(children, { formContext })}
        </form>
    );
};

export default Form;