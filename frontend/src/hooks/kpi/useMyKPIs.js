import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const useMyKPIs = (userId, filters = {}) => {
    return useQuery({
        queryKey: ['my-kpis', userId, filters],
        queryFn: async () => {
            const response = await api.get(`/kpis/users/${userId}/kpis/`, { params: filters });
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useMyKPITargets = (userId, year = null) => {
    return useQuery({
        queryKey: ['my-kpi-targets', userId, year],
        queryFn: async () => {
            const params = year ? { year } : {};
            const response = await api.get(`/kpis/users/${userId}/targets/`, { params });
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useMyKPIScores = (userId, year = null, month = null) => {
    return useQuery({
        queryKey: ['my-kpi-scores', userId, year, month],
        queryFn: async () => {
            const params = {};
            if (year) params.year = year;
            if (month) params.month = month;
            const response = await api.get(`/kpis/users/${userId}/scores/`, { params });
            return response.data;
        },
        enabled: !!userId,
        staleTime: 60 * 1000, // 1 minute
    });
};

export const useMyKPIActuals = (userId, year = null, month = null) => {
    return useQuery({
        queryKey: ['my-kpi-actuals', userId, year, month],
        queryFn: async () => {
            const params = {};
            if (year) params.year = year;
            if (month) params.month = month;
            const response = await api.get(`/kpis/users/${userId}/actuals/`, { params });
            return response.data;
        },
        enabled: !!userId,
        staleTime: 60 * 1000,
    });
};

export const useMyKPIWeights = (userId) => {
    return useQuery({
        queryKey: ['my-kpi-weights', userId],
        queryFn: async () => {
            const response = await api.get('/kpis/kpi-weights/', { params: { user: userId } });
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};
export default { useMyKPIs, useMyKPITargets, useMyKPIScores, useMyKPIActuals, useMyKPIWeights }