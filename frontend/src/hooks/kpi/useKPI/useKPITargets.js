import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetService } from '../../../services/kpi';
import useToast from '../useToast';

const TARGETS_QUERY_KEY = 'kpi-targets';
const useKPITargets = (kpiId, year) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: targets, isLoading, error } = useQuery({
        queryKey: [TARGETS_QUERY_KEY, kpiId, year],
        queryFn: () => targetService.getTargets({ kpi: kpiId, year }),
        enabled: !!kpiId,
        staleTime: 5 * 60 * 1000,
    });
    const createMutation = useMutation({
        mutationFn: (data) => targetService.createTarget({ ...data, kpi_id: kpiId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TARGETS_QUERY_KEY, kpiId] });
            toast.success('Target created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create target');
        }
    });
    return {
        targets: targets?.results || [],
        isLoading,
        error,
        createTarget: createMutation.mutate,
        isCreating: createMutation.isPending
    };
};
export default useKPITargets;