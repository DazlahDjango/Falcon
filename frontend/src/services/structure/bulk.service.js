import { BaseStructureService, withRetry } from './base.service';

export class BulkService extends BaseStructureService {
  constructor() {
    super('bulk-operations');
  }

  async processDepartments(departments, action = 'create') {
    if (!departments || !departments.length) throw new Error('Departments array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/bulk-operations/departments/', {
        departments,
        action,
      });
      return response;
    });
  }

  async processEmployments(employments) {
    if (!employments || !employments.length) throw new Error('Employments array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/employments/bulk-create/', { employments });
      return response;
    });
  }

  async processReportingLines(reportingLines, action = 'create') {
    if (!reportingLines || !reportingLines.length) throw new Error('Reporting lines array is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/bulk-operations/reporting-lines/', {
        reporting_lines: reportingLines,
        action,
      });
      return response;
    });
  }

  async reassignManager(employeeIds, newManagerId, effectiveDate = null) {
    if (!employeeIds || !employeeIds.length) throw new Error('Employee IDs array is required');
    if (!newManagerId) throw new Error('New manager ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/bulk-operations/reassign-manager/', {
        employee_ids: employeeIds,
        new_manager_id: newManagerId,
        effective_date: effectiveDate,
      });
      return response;
    });
  }

  async bulkTransfer(employeeIds, newDepartmentId, newTeamId = null, effectiveDate = null) {
    if (!employeeIds || !employeeIds.length) throw new Error('Employee IDs array is required');
    if (!newDepartmentId) throw new Error('New department ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.post('/bulk-operations/transfer/', {
        employee_ids: employeeIds,
        new_department_id: newDepartmentId,
        new_team_id: newTeamId,
        effective_date: effectiveDate,
      });
      return response;
    });
  }

  async getOperationStatus(operationId) {
    if (!operationId) throw new Error('Operation ID is required');
    return withRetry(async () => {
      const response = await this.apiClient.get(`/bulk-operations/status/${operationId}/`);
      return response;
    });
  }
}

export const bulkService = new BulkService();