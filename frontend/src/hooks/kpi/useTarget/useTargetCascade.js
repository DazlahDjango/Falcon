import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetService } from '../../../services/kpi';
import useToast from '../useToast';
const CASCADE_QUERY_KEY = 'target-cascade';

const useTargetCascade = (targetId) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: cascadeMaps, isLoading, error } = useQuery({
        queryKey: [CASCADE_QUERY_KEY, targetId],
        queryFn: () => targetService.getCascadeMaps(targetId),
        enabled: !!targetId,
        staleTime: 5 * 60 * 1000,
    });
    const { data: rules, isLoading: rulesLoading } = useQuery({
        queryKey: ['cascade-rules'],
        queryFn: () => targetService.getCascadeRules(),
        staleTime: 60 * 60 * 1000, // 1 hour
    });
    const cascadeMutation = useMutation({
        mutationFn: ({ ruleId, targets }) => targetService.createCascade(targetId, ruleId, targets),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CASCADE_QUERY_KEY, targetId] });
            toast.success('Cascade created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create cascade');
        }
    });
    const rollbackMutation = useMutation({
        mutationFn: (cascadeMapId) => targetService.rollbackCascade(cascadeMapId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CASCADE_QUERY_KEY, targetId] });
            toast.success('Cascade rolled back successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to rollback cascade');
        }
    });
    const buildCascadeTree = () => {
        if (!cascadeMaps) return null;
        const tree = {
            departments: []
        };
        cascadeMaps.forEach(map => {
            if (map.department_target) {
                tree.departments.push({
                    id: map.department_target.id,
                    name: map.department_target.name,
                    target: map.department_target.target_value,
                    contribution: map.contribution_percentage,
                    individuals: []
                });
            }
        });
        cascadeMaps.forEach(map => {
            if (map.individual_target && map.department_target) {
                const dept = tree.departments.find(d => d.id === map.department_target.id);
                if (dept) {
                    dept.individuals.push({
                        id: map.individual_target.id,
                        userId: map.individual_target.user_id,
                        name: map.individual_target.user_name,
                        target: map.individual_target.target_value,
                        contribution: map.contribution_percentage
                    });
                }
            }
        });
        
        return tree;
    };
    return {
        cascadeMaps: cascadeMaps || [],
        cascadeTree: buildCascadeTree(),
        rules: rules?.results || [],
        isLoading: isLoading || rulesLoading,
        error,
        createCascade: cascadeMutation.mutate,
        isCreating: cascadeMutation.isPending,
        rollbackCascade: rollbackMutation.mutate,
        isRollingBack: rollbackMutation.isPending
    };
};
export default useTargetCascade;