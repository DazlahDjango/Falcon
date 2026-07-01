import { BaseStructureService, withRetry } from './base.service';
import { BULK_ENDPOINTS } from '../../config/constants/structureApiConstants';

class BulkService extends BaseStructureService {
  constructor() {
    super('bulk-operations');
  }

  async processDepartments(departments, action = 'create') {
    if (!departments || !Array.isArray(departments)) {
      throw new Error('Departments array is required');
    }
    if (departments.length === 0) {
      throw new Error('At least one department is required');
    }
    if (departments.length > 100) {
      throw new Error('Maximum 100 departments per bulk operation');
    }
    return withRetry(() => this.apiClient.post(BULK_ENDPOINTS.DEPARTMENTS, {
      departments,
      action,
    }));
  }

  async processEmployments(employments) {
    if (!employments || !Array.isArray(employments)) {
      throw new Error('Employments array is required');
    }
    if (employments.length === 0) {
      throw new Error('At least one employment is required');
    }
    if (employments.length > 100) {
      throw new Error('Maximum 100 employments per bulk operation');
    }
    return withRetry(() => this.apiClient.post(BULK_ENDPOINTS.EMPLOYMENTS, {
      employments,
    }));
  }

  async processReportingLines(reportingLines, action = 'create') {
    if (!reportingLines || !Array.isArray(reportingLines)) {
      throw new Error('Reporting lines array is required');
    }
    if (reportingLines.length === 0) {
      throw new Error('At least one reporting line is required');
    }
    if (reportingLines.length > 100) {
      throw new Error('Maximum 100 reporting lines per bulk operation');
    }
    return withRetry(() => this.apiClient.post(BULK_ENDPOINTS.REPORTING_LINES, {
      reporting_lines: reportingLines,
      action,
    }));
  }

  async reassignManager(employeeIds, newManagerId, effectiveDate) {
    if (!employeeIds || !Array.isArray(employeeIds)) {
      throw new Error('Employee IDs array is required');
    }
    if (employeeIds.length === 0) {
      throw new Error('At least one employee ID is required');
    }
    if (!newManagerId) {
      throw new Error('New manager ID is required');
    }
    if (employeeIds.length > 100) {
      throw new Error('Maximum 100 employees per bulk reassignment');
    }
    return withRetry(() => this.apiClient.post(BULK_ENDPOINTS.REASSIGN_MANAGER, {
      employee_ids: employeeIds,
      new_manager_id: newManagerId,
      effective_date: effectiveDate || new Date().toISOString().split('T')[0],
    }));
  }

  async bulkTransfer(employeeIds, newDepartmentId, newUnitId, effectiveDate) {
    if (!employeeIds || !Array.isArray(employeeIds)) {
      throw new Error('Employee IDs array is required');
    }
    if (employeeIds.length === 0) {
      throw new Error('At least one employee ID is required');
    }
    if (employeeIds.length > 100) {
      throw new Error('Maximum 100 employees per bulk transfer');
    }
    return withRetry(() => this.apiClient.post('/bulk-operations/transfer/', {
      employee_ids: employeeIds,
      new_department_id: newDepartmentId,
      new_unit_id: newUnitId,
      effective_date: effectiveDate || new Date().toISOString().split('T')[0],
    }));
  }
}

export const bulkService = new BulkService();
export { BulkService };