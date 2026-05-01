import { useQuery, useMutation } from '@tanstack/react-query';
import { orgChartService } from '../../services/structure/orgChart.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useOrgChartExport = () => {
  const dispatch = useDispatch();
  const exportAsJson = useMutation({
    mutationFn: ({ format = 'full', rootDepartmentId = null }) => orgChartService.exportAsJson(format, rootDepartmentId),
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to export as JSON', type: 'error' }));
      throw error;
    },
  });
  const exportAsCsv = useMutation({
    mutationFn: ({ entity = 'departments', includeInactive = false }) => orgChartService.exportAsCsv(entity, includeInactive),
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to export as CSV', type: 'error' }));
      throw error;
    },
  });
  const exportAsText = useMutation({
    mutationFn: ({ rootDepartmentId = null, maxDepth = 10 }) => orgChartService.exportAsText(rootDepartmentId, maxDepth),
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to export as text', type: 'error' }));
      throw error;
    },
  });
  const exportAsVisio = useMutation({
    mutationFn: ({ rootDepartmentId = null }) => orgChartService.exportAsVisio(rootDepartmentId),
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to export as Visio', type: 'error' }));
      throw error;
    },
  });
  return {
    exportAsJson,
    exportAsCsv,
    exportAsText,
    exportAsVisio,
    isExportingJson: exportAsJson.isLoading,
    isExportingCsv: exportAsCsv.isLoading,
    isExportingText: exportAsText.isLoading,
    isExportingVisio: exportAsVisio.isLoading,
  };
};

export const useDownloadExportedFile = () => {
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };
  return { downloadFile };
};