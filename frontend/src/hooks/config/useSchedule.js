import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleService } from '../../services/config';
import { CONFIG_QUERY_KEYS, CONFIG_MUTATION_KEYS } from '../../config/constants/configApiConstants';

export const useSchedule = () => {
  const queryClient = useQueryClient();

  const useSchedules = (params = {}, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.SCHEDULES, params],
      queryFn: () => scheduleService.getSchedules(params),
      staleTime: 60000,
      ...options
    });
  };

  const useSchedule = (scheduleId, options = {}) => {
    return useQuery({
      queryKey: [CONFIG_QUERY_KEYS.SCHEDULE, scheduleId],
      queryFn: () => scheduleService.getSchedule(scheduleId),
      enabled: !!scheduleId,
      staleTime: 60000,
      ...options
    });
  };

  const createSchedule = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.CREATE_SCHEDULE],
    mutationFn: (data) => scheduleService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.SCHEDULES] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.DASHBOARD_SCHEDULING] });
    }
  });

  const updateSchedule = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.UPDATE_SCHEDULE],
    mutationFn: ({ scheduleId, data }) => scheduleService.updateSchedule(scheduleId, data),
    onSuccess: (_, { scheduleId }) => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.SCHEDULE, scheduleId] });
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.SCHEDULES] });
    }
  });

  const deleteSchedule = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.DELETE_SCHEDULE],
    mutationFn: (scheduleId) => scheduleService.deleteSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.SCHEDULES] });
    }
  });

  const executeDueSchedules = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.EXECUTE_SCHEDULES],
    mutationFn: () => scheduleService.executeDueSchedules(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONFIG_QUERY_KEYS.SCHEDULES] });
    }
  });

  const validateCron = useMutation({
    mutationKey: [CONFIG_MUTATION_KEYS.VALIDATE_CRON],
    mutationFn: (cronExpression) => scheduleService.validateCronExpression(cronExpression),
  });

  return {
    useSchedules,
    useSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    executeDueSchedules,
    validateCron
  };
};