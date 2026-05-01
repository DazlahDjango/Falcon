/**
 * Structure Services Barrel Export
 * Centralizes all structure-related API services
 */

export { default as BaseStructureService, apiClient, withRetry } from './base.service';

export { DepartmentService } from './department.service';
export { TeamService } from './team.service';
export { PositionService } from './position.service';
export { EmploymentService } from './employment.service';
export { ReportingService } from './reporting.service';
export { HierarchyService } from './hierarchy.service';
export { OrgChartService } from './orgChart.service';
export { CostCenterService } from './costCenter.service';
export { LocationService } from './location.service';
export { BulkService } from './bulk.service';
export { StructureAdminService } from './structureAdmin.service';
export { StructureSearchService } from './structureSearch.service';
export { structureWebSocketService } from './structureWebSocket.service';

// Singleton instances for direct use
import { DepartmentService } from './department.service';
import { TeamService } from './team.service';
import { PositionService } from './position.service';
import { EmploymentService } from './employment.service';
import { ReportingService } from './reporting.service';
import { HierarchyService } from './hierarchy.service';
import { OrgChartService } from './orgChart.service';
import { CostCenterService } from './costCenter.service';
import { LocationService } from './location.service';
import { BulkService } from './bulk.service';
import { StructureAdminService } from './structureAdmin.service';
import { StructureSearchService } from './structureSearch.service';

export const structureService = {
  departments: new DepartmentService(),
  teams: new TeamService(),
  positions: new PositionService(),
  employments: new EmploymentService(),
  reporting: new ReportingService(),
  hierarchy: new HierarchyService(),
  orgCharts: new OrgChartService(),
  costCenters: new CostCenterService(),
  locations: new LocationService(),
  bulk: new BulkService(),
  admin: new StructureAdminService(),
  search: new StructureSearchService(),
};

export default structureService;