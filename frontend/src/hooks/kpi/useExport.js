/**
 * Hook for exporting data
 */
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    exportKPIs,
    exportScores,
    exportReport,
    exportDepartmentReport,
    exportKPIDetail,
    selectExporting,
    selectExportBlob
} from '../../store/kpi';

const useExport = () => {
    const dispatch = useDispatch();
    const [downloading, setDownloading] = useState(false);
    const exporting = useSelector(selectExporting);
    const exportBlob = useSelector(selectExportBlob);
    
    const downloadBlob = useCallback((blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }, []);
    
    const exportKPIsList = useCallback(async (params = {}, format = 'csv') => {
        setDownloading(true);
        try {
            const result = await dispatch(exportKPIs({ ...params, format })).unwrap();
            downloadBlob(result, `kpis_export.${format}`);
            return result;
        } finally {
            setDownloading(false);
        }
    }, [dispatch, downloadBlob]);
    
    const exportScoresList = useCallback(async (params = {}, format = 'csv') => {
        setDownloading(true);
        try {
            const result = await dispatch(exportScores({ ...params, format })).unwrap();
            downloadBlob(result, `scores_export.${format}`);
            return result;
        } finally {
            setDownloading(false);
        }
    }, [dispatch, downloadBlob]);
    
    const exportPerformanceReport = useCallback(async (params = {}, format = 'pdf') => {
        setDownloading(true);
        try {
            const result = await dispatch(exportReport({ ...params, format })).unwrap();
            const extension = format === 'excel' ? 'xlsx' : format;
            downloadBlob(result, `performance_report.${extension}`);
            return result;
        } finally {
            setDownloading(false);
        }
    }, [dispatch, downloadBlob]);

    const exportDepartmentReportList = useCallback(async (params = {}, format = 'csv') => {
        setDownloading(true);
        try {
            const result = await dispatch(exportDepartmentReport({ ...params, format })).unwrap();
            downloadBlob(result, `department_report.${format}`);
            return result;
        } finally {
            setDownloading(false);
        }
    }, [dispatch, downloadBlob]);

    const exportKPIDetailItem = useCallback(async (params = {}, format = 'csv') => {
        setDownloading(true);
        try {
            const result = await dispatch(exportKPIDetail({ ...params, format })).unwrap();
            downloadBlob(result, `kpi_detail_${params.kpi_id || 'export'}.${format}`);
            return result;
        } finally {
            setDownloading(false);
        }
    }, [dispatch, downloadBlob]);
    
    return {
        exportKPIs: exportKPIsList,
        exportScores: exportScoresList,
        exportReport: exportPerformanceReport,
        exportDepartmentReport: exportDepartmentReportList,
        exportKPIDetail: exportKPIDetailItem,
        exporting: exporting || downloading,
    };
};

export default useExport;