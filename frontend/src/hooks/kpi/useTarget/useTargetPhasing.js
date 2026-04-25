import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetService } from '../../../services/kpi';
import useToast from '../useToast';
const PHASING_QUERY_KEY = 'target-phasing';

const useTargetPhasing = (targetId) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: phasing, isLoading, error } = useQuery({
        queryKey: [PHASING_QUERY_KEY, targetId],
        queryFn: () => targetService.getPhasing(targetId),
        enabled: !!targetId,
        staleTime: 5 * 60 * 1000,
    });
    const phaseMutation = useMutation({
        mutationFn: ({ strategy, params }) => targetService.phaseTarget(targetId, strategy, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PHASING_QUERY_KEY, targetId] });
            toast.success('Target phased successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to phase target');
        }
    });
    const lockPhasingMutation = useMutation({
        mutationFn: () => targetService.lockPhasing(targetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PHASING_QUERY_KEY, targetId] });
            toast.success('Phasing locked successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to lock phasing');
        }
    });
    const getMonthlyTargets = () => {
        if (!phasing) return [];
        return phasing.map(p => ({
            month: p.month,
            target: p.target_value,
            isLocked: p.is_locked
        }));
    };
    const getTotalPhased = () => {
        if (!phasing) return 0;
        return phasing.reduce((sum, p) => sum + p.target_value, 0);
    };
    return {
        phasing: getMonthlyTargets(),
        totalPhased: getTotalPhased(),
        isLoading,
        error,
        phaseTarget: phaseMutation.mutate,
        isPhasing: phaseMutation.isPending,
        lockPhasing: lockPhasingMutation.mutate,
        isLocking: lockPhasingMutation.isPending
    };
};
export default useTargetPhasing;