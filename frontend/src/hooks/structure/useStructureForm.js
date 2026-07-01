import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useStructureForm = ({
    initialValues = {},
    validationSchema = null,
    onSubmit = null,
    onSuccess = null,
    onError = null,
    validateOnChange = false,
    validateOnBlur = true,
}) => {
    const dispatch = useDispatch();

    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const validate = useCallback(async (formValues) => {
        if (!validationSchema) return {};

        try {
            const validationErrors = await validationSchema(formValues);
            return validationErrors || {};
        } catch (err) {
            console.error('Validation error:', err);
            return {};
        }
    }, [validationSchema]);

    const setFieldValue = useCallback((field, value, shouldValidate = validateOnChange) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);

        if (shouldValidate) {
            validate({ ...values, [field]: value }).then(validationErrors => {
                setErrors(prev => ({ ...prev, [field]: validationErrors[field] }));
            });
        }
    }, [values, validate, validateOnChange]);

    const setFieldTouched = useCallback((field, isTouched = true) => {
        setTouched(prev => ({ ...prev, [field]: isTouched }));

        if (validateOnBlur && isTouched) {
            validate(values).then(validationErrors => {
                setErrors(validationErrors);
            });
        }
    }, [values, validate, validateOnBlur]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setFieldValue(name, fieldValue);
    }, [setFieldValue]);

    const handleSelectChange = useCallback((name, value) => {
        setFieldValue(name, value);
    }, [setFieldValue]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setFieldTouched(name, true);
    }, [setFieldTouched]);

    const resetForm = useCallback((newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
        setIsDirty(false);
    }, [initialValues]);

    const validateForm = useCallback(async () => {
        const validationErrors = await validate(values);
        setErrors(validationErrors);

        const allTouched = {};
        Object.keys(values).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        return Object.keys(validationErrors).length === 0;
    }, [values, validate]);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) {
            dispatch(showToast({ message: 'Please fix validation errors', type: 'error' }));
            return;
        }

        if (!onSubmit) return;

        setIsSubmitting(true);

        try {
            const result = await onSubmit(values);
            dispatch(showToast({ message: 'Form submitted successfully', type: 'success' }));
            onSuccess?.(result);
            setIsDirty(false);
            return result;
        } catch (error) {
            const errorMessage = error.message || 'Form submission failed';
            dispatch(showToast({ message: errorMessage, type: 'error' }));
            onError?.(error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSubmit, onSuccess, onError, dispatch]);

    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    const isReady = useMemo(() => {
        return isValid && !isSubmitting;
    }, [isValid, isSubmitting]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isDirty,
        isValid,
        isReady,
        setFieldValue,
        setFieldTouched,
        handleChange,
        handleSelectChange,
        handleBlur,
        handleSubmit,
        resetForm,
        validateForm,
    };
};

export const useDepartmentForm = ({ onSubmit, initialValues = {} }) => {
    const validateDepartment = useCallback(async (values) => {
        const errors = {};

        if (!values.code?.trim()) {
            errors.code = 'Department code is required';
        } else if (!/^[A-Z0-9][A-Z0-9\-_]{2,49}$/.test(values.code)) {
            errors.code = 'Code must be 3-50 characters: uppercase letters, numbers, hyphens, underscores';
        }

        if (!values.name?.trim()) {
            errors.name = 'Department name is required';
        }

        if (values.headcount_limit && values.headcount_limit < 0) {
            errors.headcount_limit = 'Headcount limit must be positive';
        }

        return errors;
    }, []);

    return useStructureForm({
        initialValues: {
            code: '',
            name: '',
            description: '',
            parent_id: '',
            headcount_limit: '',
            sensitivity_level: 'internal',
            is_active: true,
            ...initialValues,
        },
        validationSchema: validateDepartment,
        onSubmit,
    });
};

export const usePositionForm = ({ onSubmit, initialValues = {} }) => {
    const validatePosition = useCallback(async (values) => {
        const errors = {};

        if (!values.job_code?.trim()) {
            errors.job_code = 'Job code is required';
        } else if (!/^[A-Z]{2,4}-[0-9]{3,5}$/.test(values.job_code)) {
            errors.job_code = 'Format: 2-4 letters, hyphen, 3-5 digits (e.g., ENG-001)';
        }

        if (!values.title?.trim()) {
            errors.title = 'Position title is required';
        }

        if (values.level < 1 || values.level > 20) {
            errors.level = 'Level must be between 1 and 20';
        }

        if (values.max_incumbents && values.max_incumbents < 1) {
            errors.max_incumbents = 'Max incumbents must be at least 1';
        }

        return errors;
    }, []);

    return useStructureForm({
        initialValues: {
            job_code: '',
            title: '',
            grade: '',
            level: 5,
            reports_to_id: '',
            min_tenure_months: 0,
            required_competencies: [],
            is_single_incumbent: false,
            max_incumbents: '',
            requires_supervisor_approval: true,
            ...initialValues,
        },
        validationSchema: validatePosition,
        onSubmit,
    });
};

export const useEmploymentForm = ({ onSubmit, initialValues = {} }) => {
    const validateEmployment = useCallback(async (values) => {
        const errors = {};

        if (!values.user_id?.trim()) {
            errors.user_id = 'User ID is required';
        }

        if (!values.position_id) {
            errors.position_id = 'Position is required';
        }

        if (!values.department_id) {
            errors.department_id = 'Department is required';
        }

        if (!values.effective_from) {
            errors.effective_from = 'Effective from date is required';
        }

        if (values.effective_from && values.effective_to && values.effective_from > values.effective_to) {
            errors.effective_to = 'Effective to must be after effective from';
        }

        return errors;
    }, []);

    return useStructureForm({
        initialValues: {
            user_id: '',
            position_id: '',
            department_id: '',
            unit_id: '',
            employment_type: 'permanent',
            effective_from: new Date().toISOString().split('T')[0],
            effective_to: '',
            is_manager: false,
            is_executive: false,
            is_board_member: false,
            change_reason: '',
            ...initialValues,
        },
        validationSchema: validateEmployment,
        onSubmit,
    });
};

export default useStructureForm;