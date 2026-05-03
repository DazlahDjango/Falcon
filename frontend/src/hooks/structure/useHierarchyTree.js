import { useQuery } from '@tanstack/react-query';
import { orgChartService } from '../../services/structure/orgChart.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';

export const useHierarchyTree = (includeInactive = false) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.HIERARCHY_VERSION, 'tree', { includeInactive }],
    queryFn: () => orgChartService.getTreeView(includeInactive),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useFullOrgChart = (rootDepartmentId = null) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.ORG_CHART, 'full', { rootDepartmentId }],
    queryFn: () => orgChartService.getFullOrgChart(rootDepartmentId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFlatOrgChart = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.ORG_CHART, 'flat'],
    queryFn: () => orgChartService.getFlatOrgChart(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useOrgChartPreview = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.ORG_CHART, 'preview'],
    queryFn: () => orgChartService.getPreview(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGraphData = (treeData) => {
  const buildNodesAndLinks = (nodes, parentId = null) => {
    const result = { nodes: [], links: [] };
    nodes?.forEach(node => {
      result.nodes.push({
        id: node.id,
        name: node.name,
        code: node.code,
        type: 'department',
        value: node.stats?.employee_count || 10,
      });
      if (parentId) {
        result.links.push({
          source: parentId,
          target: node.id,
        });
      }
      if (node.children && node.children.length > 0) {
        const childResult = buildNodesAndLinks(node.children, node.id);
        result.nodes.push(...childResult.nodes);
        result.links.push(...childResult.links);
      }
    });

    return result;
  };
  const graphData = treeData?.data?.departments ? buildNodesAndLinks(treeData.data.departments) : { nodes: [], links: [] };
  return { nodes: graphData.nodes, links: graphData.links };
};