import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetService } from '../../../services/kpi';
import useToast from '../useToast';
const TARGET_QUERY_KEY = 'target';

const useTarget = (id) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: target, isLoading, error } = useQuery({
        queryKey: [TARGET_QUERY_KEY, id],
        queryFn: () => targetService.getTarget(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
    const updateMutation = useMutation({
        mutationFn: (data) => targetService.updateTarget(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TARGET_QUERY_KEY, id] });
            toast.success('Target updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update target');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: () => targetService.deleteTarget(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TARGET_QUERY_KEY] });
            toast.success('Target deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete target');
        }
    });
    return {
        target,
        isLoading,
        error,
        updateTarget: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteTarget: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending
    };
};
export default useTarget;