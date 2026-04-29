import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actualService } from '../../../services/kpi';
import useToast from '../useToast';
const ACTUAL_QUERY_KEY = 'actual';

const useActual = (id) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: actual, isLoading, error } = useQuery({
        queryKey: [ACTUAL_QUERY_KEY, id],
        queryFn: () => actualService.getActual(id),
        enabled: !!id,
        staleTime: 60 * 1000,
    });
    const updateMutation = useMutation({
        mutationFn: (data) => actualService.updateActual(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACTUAL_QUERY_KEY, id] });
            toast.success('Actual updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update actual');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: () => actualService.deleteActual(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACTUAL_QUERY_KEY] });
            toast.success('Actual deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete actual');
        }
    });
    const submitMutation = useMutation({
        mutationFn: () => actualService.submitActual(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACTUAL_QUERY_KEY, id] });
            toast.success('Actual submitted for validation');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to submit actual');
        }
    });
    return {
        actual,
        isLoading,
        error,
        updateActual: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteActual: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        submitActual: submitMutation.mutate,
        isSubmitting: submitMutation.isPending
    };
};
export default useActual;