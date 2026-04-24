import { useSelector, useDispatch } from 'react-redux';
import {
  fetchKpis,
  fetchKpiById,
  fetchKpiOverview,
  fetchKpiPerformanceTrend,
  createKpi,
  updateKpi,
  deleteKpi,
  submitKpiActual,
  clearKpis,
} from '../../store/organisations/slice/kpiSlice';

export const useKpiData = () => {
  const dispatch = useDispatch();
  const { kpis, currentKpi, overview, performanceTrend, total, loading, error } = useSelector(
    (state) => state.kpis
  );

  const getKpis = (params = {}) => {
    return dispatch(fetchKpis(params)).unwrap();
  };

  const getKpiById = (id) => {
    return dispatch(fetchKpiById(id)).unwrap();
  };

  const getKpiOverview = (params = {}) => {
    return dispatch(fetchKpiOverview(params)).unwrap();
  };

  const getPerformanceTrend = (params = {}) => {
    return dispatch(fetchKpiPerformanceTrend(params)).unwrap();
  };

  const addKpi = (data) => {
    return dispatch(createKpi(data)).unwrap();
  };

  const editKpi = (id, data) => {
    return dispatch(updateKpi({ id, data })).unwrap();
  };

  const removeKpi = (id) => {
    return dispatch(deleteKpi(id)).unwrap();
  };

  const addActualValue = (id, data) => {
    return dispatch(submitKpiActual({ id, data })).unwrap();
  };

  const clear = () => {
    dispatch(clearKpis());
  };

  return {
    kpis,
    currentKpi,
    overview,
    performanceTrend,
    total,
    loading,
    error,
    getKpis,
    getKpiById,
    getKpiOverview,
    getPerformanceTrend,
    addKpi,
    editKpi,
    removeKpi,
    addActualValue,
    clearKpis: clear,
  };
};
