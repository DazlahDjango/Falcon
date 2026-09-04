/**
 * Hook for bulk upload operations
 */
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    uploadKPIs,
    uploadActuals,
    uploadTargets,
    createKPIsForm as createKPIsFormThunk,
    submitActualsForm as submitActualsFormThunk,
    submitCombinedForm as submitCombinedFormThunk,
    downloadTemplate,
    clearUploadResult,
    selectUploadResult,
    selectUploading,
    selectUploadProgress
} from '../../store/kpi';

const useBulkUpload = () => {
    const dispatch = useDispatch();
    
    const [uploadType, setUploadType] = useState(null);
    const uploadResult = useSelector(selectUploadResult);
    const uploading = useSelector(selectUploading);
    const progress = useSelector(selectUploadProgress);
    
    const uploadKPIsFile = useCallback(async (file, frameworkId, dryRun = false) => {
        setUploadType('kpi');
        return dispatch(uploadKPIs({ file, frameworkId, dryRun })).unwrap();
    }, [dispatch]);
    
    const uploadActualsFile = useCallback(async (file, year, month, dryRun = false) => {
        setUploadType('actual');
        return dispatch(uploadActuals({ file, year, month, dryRun })).unwrap();
    }, [dispatch]);
    
    const uploadTargetsFile = useCallback(async (file, year, dryRun = false) => {
        setUploadType('target');
        return dispatch(uploadTargets({ file, year, dryRun })).unwrap();
    }, [dispatch]);
    
    const downloadKpiTemplate = useCallback(() => {
        return dispatch(downloadTemplate('kpi')).unwrap();
    }, [dispatch]);
    
    const downloadActualTemplate = useCallback(() => {
        return dispatch(downloadTemplate('actual')).unwrap();
    }, [dispatch]);
    
    const downloadTargetTemplate = useCallback(() => {
        return dispatch(downloadTemplate('target')).unwrap();
    }, [dispatch]);
    
    const clearResult = useCallback(() => {
        dispatch(clearUploadResult());
        setUploadType(null);
    }, [dispatch]);
    
    const submitKPIsForm = useCallback(async (items) => {
        setUploadType('form_kpi');
        return dispatch(createKPIsFormThunk({ items })).unwrap();
    }, [dispatch]);

    const submitActualsForm = useCallback(async (year, month, items) => {
        setUploadType('form_actual');
        return dispatch(submitActualsFormThunk({ year, month, items })).unwrap();
    }, [dispatch]);

    const submitCombinedForm = useCallback(async (year, month, items) => {
        setUploadType('form_combined');
        return dispatch(submitCombinedFormThunk({ year, month, items })).unwrap();
    }, [dispatch]);

    return {
        uploadType,
        uploadResult,
        uploading,
        progress,
        uploadKPIs: uploadKPIsFile,
        uploadActuals: uploadActualsFile,
        uploadTargets: uploadTargetsFile,
        submitKPIsForm,
        submitActualsForm,
        submitCombinedForm,
        downloadKpiTemplate,
        downloadActualTemplate,
        downloadTargetTemplate,
        clearResult,
    };
};

export default useBulkUpload;