import { request } from './client';

export const getTeamHierarchy = () => {
    return request.get('/team/hierarchy/');
};

export const getTeamStats = () => {
    return request.get('/team/stats/');
};

export const getTeamTree = () => {
    return request.get('/team/tree/');
};

export const teamApi = {
    getTeamHierarchy,
    getTeamStats,
    getTeamTree,
};

export default teamApi;