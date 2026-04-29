import api from '../api';
import { API_ENDPOINTS } from '../api/endpoints';

class TargetService {
    async getTargets(params = {}) {
        const response = await api.get(API_ENDPOINTS.TARGET.LIST, { params });
        return response.data;
    }
    async getTarget(id) {
        const response = await api.get(API_ENDPOINTS.TARGET.DETAIL(id));
        return response.data;
    }
    async createTarget(data) {
        const response = await api.post(API_ENDPOINTS.TARGET.CREATE, data);
        return response.data;
    }
    async updateTarget(id, data) {
        const response = await api.put(API_ENDPOINTS.TARGET.UPDATE(id), data);
        return response.data;
    }
    async deleteTarget(id) {
        await api.delete(API_ENDPOINTS.TARGET.DELETE(id));
    }
    async phaseTarget(id, strategy, strategyParams = {}) {
        const response = await api.post(API_ENDPOINTS.TARGET.PHASE(id), {
            strategy,
            strategy_params: strategyParams
        });
        return response.data;
    }
    async getPhasing(id) {
        const response = await api.get(API_ENDPOINTS.TARGET.PHASING(id));
        return response.data;
    }
    async validateTarget(id) {
        const response = await api.get(API_ENDPOINTS.TARGET.VALIDATE(id));
        return response.data;
    }
    async lockPhasingCycle(cycle) {
        const response = await api.post(API_ENDPOINTS.TARGET.LOCK_CYCLE, {
            performance_cycle: cycle
        });
        return response.data;
    }
    async lockPhasing(id) {
        const response = await api.post(`${API_ENDPOINTS.TARGET.MONTHLY_PHASING}${id}/lock/`);
        return response.data;
    }
    async getCascadeMaps(targetId) {
        const response = await api.get(API_ENDPOINTS.CASCADE.MAPS, {
            params: { organization_target: targetId }
        });
        return response.data;
    }
    async createCascade(orgTargetId, ruleId, targets) {
        const response = await api.post(API_ENDPOINTS.CASCADE.MAPS, {
            organization_target: orgTargetId,
            cascade_rule: ruleId,
            targets
        });
        return response.data;
    }
    async cascadeDepartment(deptTargetId, ruleId, userIds, weights = {}) {
        const response = await api.post(API_ENDPOINTS.CASCADE.CASCADE_DEPARTMENT, {
            department_target: deptTargetId,
            cascade_rule: ruleId,
            user_ids: userIds,
            weights
        });
        return response.data;
    }
    async getCascadeTree(orgTargetId) {
        const response = await api.get(API_ENDPOINTS.CASCADE.TREE, {
            params: { organization_target: orgTargetId }
        });
        return response.data;
    }
    async rollbackCascade(cascadeMapId) {
        await api.delete(API_ENDPOINTS.CASCADE.ROLLBACK(cascadeMapId));
    }
    async getCascadeRules(params = {}) {
        const response = await api.get(API_ENDPOINTS.CASCADE.RULES, { params });
        return response.data;
    }
    async getCascadeRule(id) {
        const response = await api.get(API_ENDPOINTS.CASCADE.RULE_DETAIL(id));
        return response.data;
    }
}
export default new TargetService();