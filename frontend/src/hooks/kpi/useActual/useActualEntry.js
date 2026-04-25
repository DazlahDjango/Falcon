import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualService } from '../../../services/kpi';
import useToast from '../useToast';

const useActualEntry = (options = {}) => {
    const { onSuccess, onError } = options;
    const queryClient = useQueryClient();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitMutation = useMutation({
        mutationFn: (data) => actualService.createActual(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['actuals'] });
            toast.success('Data submitted successfully');
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            const message = error.response?.data?.error || 'Failed to submit data';
            toast.error(message);
            if (onError) onError(error);
        }
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => actualService.updateActual(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['actuals'] });
            toast.success('Data updated successfully');
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            const message = error.response?.data?.error || 'Failed to update data';
            toast.error(message);
            if (onError) onError(error);
        }
    });
    const resubmitMutation = useMutation({
        mutationFn: ({ id, value, notes }) => actualService.resubmitActual(id, value, notes),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['actuals'] });
            toast.success('Data resubmitted successfully');
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            const message = error.response?.data?.error || 'Failed to resubmit data';
            toast.error(message);
            if (onError) onError(error);
        }
    });
    const validateForm = (value, unit, type) => {
        const errors = {};
        if (value === undefined || value === null || value === '') {
            errors.value = 'Value is required';
        } else if (isNaN(parseFloat(value))) {
            errors.value = 'Please enter a valid number';
        } else if (parseFloat(value) < 0) {
            errors.value = 'Value cannot be negative';
        }
        if (type === 'PERCENTAGE' && parseFloat(value) > 100) {
            errors.value = 'Percentage cannot exceed 100';
        }
        return errors;
    };
    const submitEntry = (data) => {
        setIsSubmitting(true);
        submitMutation.mutate(data);
        setIsSubmitting(false);
    };
    const updateEntry = (id, data) => {
        setIsSubmitting(true);
        updateMutation.mutate({ id, data });
        setIsSubmitting(false);
    };
    const resubmitEntry = (id, value, notes) => {
        setIsSubmitting(true);
        resubmitMutation.mutate({ id, value, notes });
        setIsSubmitting(false);
    };
    return {
        submitEntry,
        updateEntry,
        resubmitEntry,
        isSubmitting,
        validateForm
    };
};
export default useActualEntry;