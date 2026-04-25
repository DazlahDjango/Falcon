import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetService } from '../../../services/kpi';
import useToast from '../useToast';
const TARGETS_QUERY_KEY = 'targets';

const useTargets = (filters = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [TARGETS_QUERY_KEY, filters],
        queryFn: () => targetService.getTargets(filters),
        staleTime: 5 * 60 * 1000,
    });
    const createMutation = useMutation({
        mutationFn: (data) => targetService.createTarget(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TARGETS_QUERY_KEY] });
            toast.success('Target created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create target');
        }
    });
    return {
        targets: data?.results || [],
        pagination: {
            count: data?.count || 0,
            next: data?.next,
            previous: data?.previous
        },
        isLoading,
        error,
        refetch,
        createTarget: createMutation.mutate,
        isCreating: createMutation.isPending
    };
};
export default useTargets;