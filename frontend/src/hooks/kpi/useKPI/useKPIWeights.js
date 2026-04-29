import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kpiService } from '../../../services/kpi';
import useToast from '../useToast';
const WEIGHTS_QUERY_KEY = 'kpi-weights';

const useKPIWeights = (kpiId) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: weights, isLoading, error } = useQuery({
        queryKey: [WEIGHTS_QUERY_KEY, kpiId],
        queryFn: () => kpiService.getKPIWeights(kpiId),
        enabled: !!kpiId,
        staleTime: 5 * 60 * 1000
    });
    const updateMutation = useMutation({
        mutationFn: (weightsData) => kpiService.updateKPIWeights(kpiId, weightsData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WEIGHTS_QUERY_KEY, kpiId] });
            toast.success('Weights updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update weights');
        }
    });
    const validateSum = (weightsList) => {
        const total = weightsList.reduce((sum, w) => sum + w.weight, 0);
        return Math.abs(total - 100) < 0.01;
    };
    return {
        weights: weights || [],
        isLoading,
        error,
        updateWeights: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        validateSum
    };
};
export default useKPIWeights;