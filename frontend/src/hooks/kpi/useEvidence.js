/**
 * Hook for managing evidence
 */
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadEvidence, selectEvidence, selectActualLoading } from '../../store/kpi';

const useEvidence = (actualId) => {
    const dispatch = useDispatch();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const evidence = useSelector(selectEvidence);
    const loading = useSelector(selectActualLoading);
    
    const upload = useCallback(async (file, evidenceType, description = '') => {
        setUploading(true);
        setError(null);
        try {
            const result = await dispatch(uploadEvidence({
                actualId,
                file,
                evidenceType,
                description
            })).unwrap();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setUploading(false);
        }
    }, [dispatch, actualId]);
    
    return {
        evidence,
        loading,
        uploading,
        error,
        upload,
    };
};

export default useEvidence;